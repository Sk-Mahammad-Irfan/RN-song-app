import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { usePlayer } from '../store/playerStore';
import WaveformBars from './WaveformBars';

export default function MiniPlayer() {
  const { song, isPlaying, toggle } = usePlayer();
  const router = useRouter();

  if (!song) return null;

  return (
    <TouchableOpacity
      onPress={() => router.push('/player')}
      activeOpacity={0.92}
      style={{
        backgroundColor: '#1a1a26',
        borderTopWidth: 0.5,
        borderTopColor: '#2a2a38',
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <WaveformBars
        color={song.color}
        bg={song.bg}
        count={4}
        isPlaying={isPlaying}
        size="sm"
      />

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{ color: '#f0f0f8', fontSize: 13, fontWeight: '500' }}
        >
          {song.title}
        </Text>
        <Text
          numberOfLines={1}
          style={{ color: '#5a5a6e', fontSize: 11, marginTop: 2 }}
        >
          {song.artist}
        </Text>
      </View>

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          toggle();
        }}
        activeOpacity={0.8}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#5a4be8',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isPlaying ? (
          <View style={{ flexDirection: 'row', gap: 3 }}>
            <View style={{ width: 3, height: 13, backgroundColor: '#fff', borderRadius: 2 }} />
            <View style={{ width: 3, height: 13, backgroundColor: '#fff', borderRadius: 2 }} />
          </View>
        ) : (
          <View
            style={{
              width: 0,
              height: 0,
              borderTopWidth: 6,
              borderBottomWidth: 6,
              borderLeftWidth: 10,
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: '#fff',
              marginLeft: 2,
            }}
          />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}