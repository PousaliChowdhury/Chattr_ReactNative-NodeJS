import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { getOrCreateConversation } from "./routes/conversations.js";
import Message from "./models/Message.js";
import Convo from "./models/Convo.js";

export function initSocket(httpServer, onlineMap) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_ORIGIN?.split(",") || "*", credentials: true }
  });

  // auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("No token"));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = String(payload.id);
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    onlineMap.set(userId, socket.id);
    io.emit("presence", { userId, online: true });

    socket.on("disconnect", () => {
      onlineMap.delete(userId);
      io.emit("presence", { userId, online: false });
    });

    socket.on("typing:start", ({ to }) => {
      const s = onlineMap.get(String(to));
      if (s) io.to(s).emit("typing", { from: userId, isTyping: true });
    });

    socket.on("typing:stop", ({ to }) => {
      const s = onlineMap.get(String(to));
      if (s) io.to(s).emit("typing", { from: userId, isTyping: false });
    });

    socket.on("message:send", async ({ to, text }) => {
      if (!to || !text) return;
      const conv = await getOrCreateConversation(userId, to);
      const msg = await Message.create({
        conversation: conv._id,
        sender: userId,
        recipient: to,
        text,
        status: "sent"
      });
      conv.lastMessageText = text;
      conv.lastMessageAt = new Date();
      await conv.save();

      io.to(socket.id).emit("message:new", { message: msg });

      const rSock = onlineMap.get(String(to));
      if (rSock) {
        await Message.updateOne({ _id: msg._id }, { status: "delivered", deliveredAt: new Date() });
        const updated = await Message.findById(msg._id);
        io.to(rSock).emit("message:new", { message: updated });
        io.to(socket.id).emit("message:new", { message: updated });
      }
    });

    socket.on("message:read", async ({ from, conversationId }) => {
      const filter = {
        conversation: conversationId,
        recipient: userId,
        sender: from,
        status: { $ne: "read" }
      };
      const readAt = new Date();
      await Message.updateMany(filter, { status: "read", readAt });

      const fromSock = onlineMap.get(String(from));
      if (fromSock) io.to(fromSock).emit("message:read", { conversationId, readerId: userId, readAt });
      io.to(socket.id).emit("message:read", { conversationId, readerId: userId, readAt });
    });
  });

  return io;
}
