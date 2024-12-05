import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "../services/AuthProvider";

export default function HomeLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="HomeScreen" />
        <Stack.Screen
          name="PickFeelingScreen"
          options={{ gestureEnabled: true }}
        />
        <Stack.Screen name="DetailScreen" options={{ gestureEnabled: true }} />
        <Stack.Screen name="SettingScreen" options={{ gestureEnabled: true }} />
        <Stack.Screen name="SearchScreen" options={{ gestureEnabled: true }} />
      </Stack>
    </AuthProvider>
  );
}
