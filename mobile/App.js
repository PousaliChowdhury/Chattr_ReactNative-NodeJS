import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/frontend/Login.js';
import RegisterScreen from './src/frontend/Register.js';
import HomeScreen from './src/frontend/Home.js';
import ChatScreen from './src/frontend/Chat.js';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account', headerTitleAlign: "center", }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{
    title: "Chats",   // 👈 change text
    headerTitleStyle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#111827", // dark gray / black
    },
    headerTitleAlign: "center", // 👈 centers the text
  }}/>
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={({ route }) => ({ title: route.params?.username || 'Chat' })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
