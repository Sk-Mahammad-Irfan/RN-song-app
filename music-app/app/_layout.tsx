import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePlayer } from '../store/playerStore';

export default function RootLayout() {
  const loadLikedSongs = usePlayer((state) => state.loadLikedSongs);

  useEffect(() => {
    // Load persisted liked songs
    loadLikedSongs();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="player" />
        <Stack.Screen name="playlist/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}