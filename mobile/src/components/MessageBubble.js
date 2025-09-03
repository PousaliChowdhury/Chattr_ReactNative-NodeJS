import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function MessageBubble({ message, isMine, isUnread }) {
  return (
    <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
      <Text style={[styles.text, isUnread && !isMine ? styles.unreadText : null]}>
        {message.text || ''}
      </Text>
      <Text style={styles.meta}>
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        {isMine
          ? message.status === 'read'
            ? ' ✓✓'
            : message.status === 'delivered'
            ? ' ✓'
            : ''
          : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 10,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: { elevation: 3 },
    }),
  },
  mine: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6' },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#FFF' },
  text: { fontSize: 16 },
  meta: { fontSize: 10, color: '#666', marginTop: 4, textAlign: 'right' },
  unreadText: { fontWeight: '700' },
});
