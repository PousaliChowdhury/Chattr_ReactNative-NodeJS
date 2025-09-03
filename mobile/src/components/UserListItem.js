import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';

export default function UserListItem({ user, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={[styles.dot, { backgroundColor: user.online ? '#01ffa2ff' : '#a9aeb6ff' }]} />

      {user.avatarUrl ? (
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{user.username?.[0]}</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.username}>{user.username}</Text>
        {!!user.lastMessageText && (
          <Text numberOfLines={1} style={styles.preview}>{user.lastMessageText}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  avatarPlaceholder: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#ddd', marginRight: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontWeight: '700', color: '#555' },
  info: { flex: 1 },
  username: { fontSize: 16, fontWeight: '600' },
  preview: { fontSize: 12, color: '#666' },
});
