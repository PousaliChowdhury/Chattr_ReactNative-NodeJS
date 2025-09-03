import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessageAt: { type: Date, default: Date.now },
    lastMessageText: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Conversation', conversationSchema);
