import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "../services/AuthProvider";
export default function AuthLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="WelcomeScreen" />
        <Stack.Screen name="LoginScreen" />
      </Stack>
    </AuthProvider>
  );
}
