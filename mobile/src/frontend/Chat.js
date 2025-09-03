import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useStore } from '../store';
import MessageBubble from '../components/MessageBubble';

export default function ChatScreen({ route }) {
  const { userId: peerId } = route.params;
  const [text, setText] = useState('');
  const fetchMessagesWith = useStore((s) => s.fetchMessagesWith);
  const messages = useStore((s) => s.messages);
  const sendMessage = useStore((s) => s.sendMessage);
  const emitTyping = useStore((s) => s.emitTyping);
  const markRead = useStore((s) => s.markRead);
  const conversationIdByPeer = useStore((s) => s.conversationIdByPeer);
  const me = useStore((s) => s.user);
  const typingFrom = useStore((s) => s.typingFrom);
  const flatRef = useRef(null);

  useEffect(() => {
    (async () => {
      const convId = await fetchMessagesWith(peerId);
      markRead(peerId, convId);
    })();
  }, [peerId, fetchMessagesWith, markRead]);

  const convId = conversationIdByPeer[peerId];
  const thread = convId ? (messages[convId] || []) : [];

  const onSend = () => {
    if (!text.trim()) return;
    sendMessage(peerId, text.trim());
    setText('');
    emitTyping(peerId, false);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
  <KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1, backgroundColor: '#fbefdaff'  }}
  keyboardVerticalOffset={60} // adjust if you have a header
>
  {/* Messages list */}
  <FlatList
    ref={flatRef}
    data={thread}
    keyExtractor={(item) => String(item._id)}
    renderItem={({ item }) => (
      <MessageBubble
        message={item}
        isMine={String(item.sender) === String(me?.id || me?._id)}
        // isUnread={item.status !== 'read' && String(item.sender) !== String(me?.id || me?._id)}
      />
    )}
    contentContainerStyle={{ padding: 12, paddingBottom: 80 }} // leave space for input
    onContentSizeChange={() =>
      flatRef.current?.scrollToEnd({ animated: true })
    }
    keyboardShouldPersistTaps="handled" // important to prevent taps from dismissing keyboard
  />

  {/* Typing indicator */}
  {typingFrom[peerId] && (
    <View style={styles.typingWrapper}>
      <Text style={styles.typing}>Typing...</Text>
    </View>
  )}

  {/* Input row */}
  <View style={styles.floatingWrapper}>
    <View style={styles.inputRow}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={(t) => {
          setText(t);
          emitTyping(peerId, t.length > 0);
        }}
        placeholder="Type a message"
        multiline
      />
      <TouchableOpacity style={styles.sendBtn} onPress={onSend}>
        <Text style={styles.sendBtnText}>Send</Text>
      </TouchableOpacity>
    </View>
  </View>
</KeyboardAvoidingView>
);

}

const styles = StyleSheet.create({
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderTopWidth: 1, borderTopColor: '#e0f2e5ff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#e0f2e5ff', borderRadius: 20, paddingHorizontal: 12, marginRight: 8, height: 40, backgroundColor: '#dcf5ffff', },
  floatingWrapper: {
  marginHorizontal: 12,
  marginBottom: 42,
  borderRadius: 24,
  backgroundColor: "#def5feff",
  // shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 5,
},

// input: {
//   flex: 1,
//   borderWidth: 1,
//   borderColor: "#efe7f6ff",
//   borderRadius: 20,
//   paddingHorizontal: 12,
//   marginRight: 8,
//   backgroundColor: "#efe7f6ff",
//   height: 40,
// },

sendBtn: {
  backgroundColor: "#007AFF",   // iOS blue, you can change
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 20,
},

sendBtnText: {
  color: "white",
  fontWeight: "600",
},
typingWrapper: {
  position: "absolute",
  bottom: 100,      
  left: 0,
  right: 0,
  alignItems: "center",
},

typing: {
  backgroundColor: "#f9b8e0ff",
  paddingHorizontal: 12,
  paddingVertical: 4,
  borderRadius: 12,
  color: "#0b0b0cff",
  fontSize: 12,
},

});
