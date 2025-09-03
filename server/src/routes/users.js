import express from 'express';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Convo.js';

export default function createUsersRouter(onlineMap) {
  const router = express.Router();

  // GET /users
  router.get('/', async (req, res) => {
    try {
      const me = req.user.id;
      const users = await User.find({ _id: { $ne: me } }).select('_id username email');

      const result = await Promise.all(
        users.map(async (u) => {
          const conv = await Conversation.findOne({
            participants: { $all: [me, u._id] }
          });

          let lastText = '';
          let lastAt = null;
          if (conv) {
            const lastMsg = await Message.findOne({ conversation: conv._id }).sort({ createdAt: -1 });
            if (lastMsg) {
              lastText = lastMsg.text;
              lastAt = lastMsg.createdAt;
            }
          }

          return {
            id: u._id,
            username: u.username,
            email: u.email,
            online: onlineMap.has(String(u._id)),
            lastMessageText: lastText,
            lastMessageAt: lastAt
          };
        })
      );

      res.json(result.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0)));
    } catch {
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}
