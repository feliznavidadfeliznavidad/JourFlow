import { Stack } from 'expo-router'
import React from 'react'

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(authentication)" options={{ gestureEnabled: true }} />
      <Stack.Screen 
        name="(homepage)" 
        options={{ 
          gestureEnabled: false,
          animation: 'none'
        }} 
      />
    </Stack>
  )
}