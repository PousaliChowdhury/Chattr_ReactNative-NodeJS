import { create } from 'zustand';
import socketIOClient  from 'socket.io-client';
import { api, setAuthToken } from './api';

const SOCKET_URL = process.env.SOCKET_URL || 'http://192.168.0.101:7000';

export const useStore = create((set, get) => ({
  user: null,
  token: null,
  users: [],
  messages: {},               // { [conversationId]: Message[] }
  conversationIdByPeer: {},   // { [peerId]: conversationId }
  typingFrom: {},             // { [userId]: boolean }
  online: {},                 // { [userId]: boolean }
  socket: null,

  // ----------------- REGISTER -----------------
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    const data = response.data;

    if (!data) {
      console.warn('Backend did not return data; user might still be created');
      return { user: { username, email }, token: null };
    }

    return data; // leave token handling to RegisterScreen
  },

  // ----------------- LOGIN -----------------
  login: async (email, password) => {
    try {
      // Clear previous error
      set({ error: null });

      const { data } = await api.post('/auth/login', { email, password });
      set({ user: data.user, token: data.token });
      setAuthToken(data.token);
      if (!get().socket) get().connectSocket();

      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || err.message });
      throw err; // rethrow if needed
    }
  },
  // ----------------- SOCKET -----------------
  connectSocket: () => {
    const token = get().token;
    const user = get().user;
    if (!token || !user || get().socket) return; // prevent duplicate sockets

    const socket = socketIOClient(SOCKET_URL, { auth: { token } });
    set({ socket });

    
    socket.on('connect', () => {
    console.log('Socket connected for', user.email);
  });

    // ---------- PRESENCE ----------
    socket.on('presence', ({ userId, online }) => {
      set((state) => ({ online: { ...state.online, [userId]: online } }));
    });

    // ---------- TYPING ----------
    socket.on('typing', ({ from, isTyping }) => {
      set((state) => ({ typingFrom: { ...state.typingFrom, [from]: isTyping } }));
    });

    // ---------- NEW MESSAGE ----------
    socket.on('message:new', ({ message, tempId }) => {
  set((state) => {
    const arr = state.messages[message.conversation] || [];
    let replaced = false;

    const updated = arr.map((m) => {
      if (tempId && m._id === tempId) {
        replaced = true;
        return {
          ...m,              
          _id: message._id,
          createdAt: message.createdAt,
          status: message.status || 'sent',
          pending: false,
        };
      }
      return m;
    });

    if (!replaced && !updated.some((m) => m._id === message._id)) {
      updated.push(message);
    }

    return { messages: { ...state.messages, [message.conversation]: updated } };
  });
});



    // ---------- MESSAGE READ ----------
    socket.on('message:read', ({ conversationId, readerId, readAt }) => {
      set((state) => {
        const arr = (state.messages[conversationId] || []).map((m) => {
          if (String(m.sender) === String(readerId)) return m; // their messages not affected
          if (m.status !== 'read') return { ...m, status: 'read', readAt };
          return m;
        });
        return { messages: { ...state.messages, [conversationId]: arr } };
      });
    });
  },

  // ----------------- SEND MESSAGE -----------------
sendMessage: (peerId, text) => {
  if (!text.trim()) return;

  const socket = get().socket;
  const user = get().user;
  const convId = get().conversationIdByPeer[peerId];
  if (!convId) return console.error("No conversationId for peer");

  const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const optimistic = {
    _id: tempId,
    conversation: convId,
    text,                  // include text
    sender: user?.id || user?._id, // must match user type
    status: "pending",
    pending: true,
    createdAt: new Date().toISOString(),
  };

  set((state) => ({
    messages: {
      ...state.messages,
      [convId]: [...(state.messages[convId] || []), optimistic],
    },
  }));

  if (socket && user) {
    socket.emit("message:send", { to: peerId, text, tempId });
  }
},




  // ----------------- TYPING INDICATOR -----------------
  emitTyping: (peerId, isTyping) => {
    const socket = get().socket;
    if (!socket) return;
    socket.emit(isTyping ? 'typing:start' : 'typing:stop', { to: peerId });
  },

  // ----------------- MARK READ -----------------
  markRead: (from, conversationId) => {
    const socket = get().socket;
    if (!socket) return;
    socket.emit('message:read', { from, conversationId });
  },

  // ----------------- LOGOUT -----------------
  logout: () => {
    const s = get().socket;
    if (s) s.disconnect();

    set({
      user: null,
      token: null,
      users: [],
      messages: {},
      conversationIdByPeer: {},
      typingFrom: {},
      online: {},
      socket: null,
    });

    setAuthToken(null);
  },

  // ----------------- USERS -----------------
  fetchUsers: async () => {
    const { data } = await api.get('/users');
    const online = {};
    data.forEach((u) => (online[u.id] = u.online));
    set({ users: data, online });
  },

  fetchMessagesWith: async (peerId) => {
    const { data } = await api.get(`/conversations/${peerId}/messages`);
    set((state) => ({
      conversationIdByPeer: { ...state.conversationIdByPeer, [peerId]: data.conversationId },
      messages: { ...state.messages, [data.conversationId]: data.messages },
    }));
    return data.conversationId;
  },
}));