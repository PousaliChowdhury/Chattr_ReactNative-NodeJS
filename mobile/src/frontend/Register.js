import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useStore } from '../store';

export default function RegisterScreen({ navigation }) {
  const register = useStore((s) => s.register);
  const login = useStore((s) => s.login);
  const connectSocket = useStore((s) => s.connectSocket);


  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!username || !email || !password) {
      return Alert.alert('Error', 'Please fill in all fields');
    }

    setLoading(true);

    try {
      let data = await register(username, email, password);
      navigation.replace('Home');
      if (!data || !data.user) {
        throw new Error('Invalid response from server');
      }

      // If no token returned, attempt auto-login
      if (!data.token) {
        const loginData = await login(email, password);
        data = loginData;
        useStore.setState({ user: loginData.user, token: loginData.token });
      }

      connectSocket?.();
      navigation.replace('Home');
    } catch (e) {
      console.error('Register failed:', e.response?.data || e.message || e);
      Alert.alert('Register failed', e.response?.data?.message || e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an account</Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

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

      <Button
        title={loading ? 'Registering...' : 'Register'}
        onPress={onRegister}
        disabled={loading}
      />

      <TouchableOpacity onPress={() => navigation.replace('Login')}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
title: { fontSize: 24, fontWeight: '700', marginBottom: 20, textAlign: 'center'  },  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  loginText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#007AFF',
  },
});
