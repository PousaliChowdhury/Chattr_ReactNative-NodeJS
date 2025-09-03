import express from 'express';
import http from 'http';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import conversationsRoutes from './routes/conversations.js';
import { auth } from './middleware/auth.js';
import { initSocket } from './socket.js';
import authRoutes from './routes/authenticate.js';
import createUsersRouter from './routes/users.js';

const app = express();

console.log("auth:", typeof auth);
console.log("users:", typeof createUsersRouter);
console.log("convos:", typeof conversationsRoutes);

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json());

app.get('/', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);

const onlineMap = new Map();
app.use('/users', auth, createUsersRouter(onlineMap)); 

app.use('/conversations', auth, conversationsRoutes);

const server = http.createServer(app);
const PORT = process.env.PORT || 7000;

connectDB(process.env.MONGO_URI)
  .then(() => {
    initSocket(server, onlineMap);
    server.listen(PORT, () => console.log(`🚀 Server running on :${PORT}`));
  })
  .catch((err) => {
    console.error('❌ DB error', err);
    process.exit(1);
  });
