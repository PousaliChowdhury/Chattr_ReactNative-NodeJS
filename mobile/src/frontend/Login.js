import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useStore } from '../store';

export default function LoginScreen({ navigation }) {
  const login = useStore((s) => s.login);
  const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

  const onLogin = async () => {
    try {
      await login(email, password);
      navigation.replace('Home');
    } catch (e) {
      Alert.alert('Login failed', e?.message || 'Unknown error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back 😊</Text>
      <TextInput
              placeholder="Email"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
      
            <TextInput
              placeholder="Password"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
      <Button title="Login" onPress={onLogin} />
      <TouchableOpacity onPress={() => navigation.replace("Register")}>
  <Text style={{ textAlign: "center", marginTop: 16, color: "#007AFF" }}>
    Don’t have an account? Register
  </Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20, textAlign: 'center'  },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  link: { marginTop: 12, color: '#2563EB', textAlign: 'center' }
});



