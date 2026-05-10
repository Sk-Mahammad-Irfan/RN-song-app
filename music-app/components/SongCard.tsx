import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C } from '../constants/theme';
import { usePlayer } from '../store/playerStore';
import WaveformBars from './WaveformBars';

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  color: string;
  bg: string;
}

interface Props {
  song: Song;
  index: number;
  showProgress?: boolean;
}

export default function SongCard({ song, index, showProgress = false }: Props) {
  const router = useRouter();
  const { song: currentSong, isPlaying, setSong } = usePlayer();
  const isActive = currentSong.id === song.id;

  const handlePress = () => {
    setSong(song);
    router.push('/player');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      style={[styles.card, { borderColor: C.border, backgroundColor: C.card }]}
    >
      <WaveformBars
        color={song.color}
        bg={song.bg}
        count={4}
        size="sm"
        isPlaying={isActive && isPlaying}
      />
      <View style={styles.info}>
        <Text style={[styles.title, { color: C.text }]} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={[styles.artist, { color: C.textMuted }]} numberOfLines={1}>
          {song.artist} · {song.duration}
        </Text>
        {(showProgress || (isActive && index === 0)) && (
          <View style={[styles.progressBg, { backgroundColor: C.border }]}>
            <View style={[styles.progressFill, { backgroundColor: C.purple, width: '40%' }]} />
          </View>
        )}
      </View>
      <TouchableOpacity onPress={() => {}}>
        <Text style={{ fontSize: 16, color: isActive ? C.purple : '#3e3e50' }}>
          {isActive ? '♥' : '♡'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 0.5,
    borderRadius: 14,
    padding: 12,
    marginVertical: 5,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 3,
  },
  artist: {
    fontSize: 11,
  },
  progressBg: {
    height: 2,
    borderRadius: 1,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});