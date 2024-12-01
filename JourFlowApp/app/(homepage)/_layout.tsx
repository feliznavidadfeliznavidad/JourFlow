import { Stack } from 'expo-router';
import React from 'react';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false
      }}
    >
      <Stack.Screen name="HomeScreen" />
      <Stack.Screen 
        name="PickFeelingScreen" 
        options={{ gestureEnabled: true }} 
      />
      <Stack.Screen 
        name="DetailScreen" 
        options={{ gestureEnabled: true }} 
      />
      <Stack.Screen 
        name="SettingScreen" 
        options={{ gestureEnabled: true }} 
      />
    </Stack>
  );
}