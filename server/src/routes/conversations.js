import express from 'express';
import Conversation from '../models/Convo.js';
import Message from '../models/Message.js';

const router = express.Router();

async function getOrCreateConversation(a, b) {
  let conv = await Conversation.findOne({ participants: { $all: [a, b] } });
  if (!conv) conv = await Conversation.create({ participants: [a, b] });
  return conv;
}

// GET /conversations/:userId/messages
router.get('/:userId/messages', async (req, res) => {
  try {
    const me = req.user.id;
    const other = req.params.userId;
    const conv = await getOrCreateConversation(me, other);
    const messages = await Message.find({ conversation: conv._id }).sort({ createdAt: 1 });
    res.json({ conversationId: conv._id, messages });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export { getOrCreateConversation };
export default router;
