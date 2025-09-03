import React, { useEffect } from "react";
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useStore } from "../store";
import UserListItem from "../components/UserListItem";

export default function HomeScreen({ navigation }) {
  const fetchUsers = useStore((s) => s.fetchUsers);
  const users = useStore((s) => s.users);
  const logout = useStore((s) => s.logout);
  const me = useStore((s) => s.user);
  const online = useStore((s) => s.online);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleLogout = () => {
    logout();
    navigation.replace("Login"); // go back to Login screen
  };

  return (
    <View style={{ flex: 1 , backgroundColor: '#d1f9ebff' }}>
      {/* Header */}
      <View style={styles.header}>
        {me && <Text style={styles.subtitle}>Welcome, {me.username} 😊</Text>}
      </View>

      {/* User List */}
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <UserListItem
            user={{
              ...item,
              online: online[item.id],
            }}
            onPress={() =>
              navigation.navigate("Chat", {
                userId: item.id,
                username: item.username,
              })
            }
          />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        ItemSeparatorComponent={() => null}
      />

      {/* 🚪 Floating Logout */}
      <View style={styles.logoutWrapper}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 10,
    paddingBottom: 12,
    alignItems: "center",
    backgroundColor: "#c7fdeaff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    color: "#353535ff",
    fontWeight: "500",
    marginTop: 4,
  },
  logoutWrapper: {
    marginHorizontal: 12,
    marginBottom: 40,
    borderRadius: 24,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutBtn: {
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
