import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MiniPlayer from '../../components/MiniPlayer';
import MoodPill from '../../components/MoodPill';
import WaveformBars from '../../components/WaveformBars';
import { SONGS } from '../../constants/mockData';
import { C } from '../../constants/theme';
import { usePlayer } from '../../store/playerStore';

const MOODS = ['Focus', 'Chill', 'Hype', 'Sleep'];

export default function HomeScreen() {
  const [activeMood, setActiveMood] = useState('Focus');
  const { song: currentSong, isPlaying, setSong } = usePlayer();
  const router = useRouter();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'good morning' : hour < 17 ? 'good afternoon' : 'good evening';

  const filteredSongs = SONGS.filter((_, i) => {
    if (activeMood === 'Focus') return i % 2 === 0 || i === 0;
    if (activeMood === 'Chill') return [1, 2, 4].includes(i);
    if (activeMood === 'Hype') return [0, 2, 3].includes(i);
    return true;
  });

  return (
    <View style={ { flex: 1, backgroundColor: C.bg } }>
      <SafeAreaView style={ { backgroundColor: C.bg } } />

      <ScrollView
        style={ { flex: 1 } }
        contentContainerStyle={ { paddingHorizontal: 20, paddingBottom: 16 } }
        showsVerticalScrollIndicator={ false }
      >
        {/* Greeting */ }
        <Text style={ { color: '#7a7a8c', fontSize: 14, marginBottom: 6, marginTop: 4 } }>
          { greeting }
        </Text>

        <Text
          style={ {
            color: '#f0f0f5',
            fontSize: 30,
            fontWeight: '600',
            lineHeight: 36,
            marginBottom: 20,
          } }
        >
          What's the{ '\n' }mood tonight?
        </Text>

        {/* Mood Pills */ }
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={ false }
          style={ { marginBottom: 28, marginHorizontal: -20 } }
          contentContainerStyle={ { paddingHorizontal: 20, gap: 10 } }
        >
          { MOODS.map((mood) => (
            <MoodPill
              key={ mood }
              label={ mood }
              active={ activeMood === mood }
              onPress={ () => setActiveMood(mood) }
            />
          )) }
        </ScrollView>

        {/* Recently Played label */ }
        <Text
          style={ {
            color: C.textMuted,
            fontSize: 10,
            letterSpacing: 1.5,
            marginBottom: 14,
          } }
        >
          RECENTLY PLAYED
        </Text>

        {/* Song list */ }
        { filteredSongs.map((song, index) => {
          const isActive = currentSong.id === song.id;
          return (
            <TouchableOpacity
              key={ song.id }
              activeOpacity={ 0.75 }
              onPress={ () => {
                setSong(song);
                router.push('/player');
              } }
              style={ {
                backgroundColor: C.card,
                borderRadius: 16,
                borderWidth: 0.5,
                borderColor: C.border,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                marginBottom: 10,
              } }
            >
              <WaveformBars
                color={ song.color }
                bg={ song.bg }
                count={ 5 }
                isPlaying={ isActive && isPlaying }
                size="md"
              />
              <View style={ { flex: 1 } }>
                <Text
                  numberOfLines={ 1 }
                  style={ {
                    color: '#e8e8f2',
                    fontSize: 14,
                    fontWeight: '500',
                    marginBottom: 4,
                  } }
                >
                  { song.title }
                </Text>
                <Text style={ { color: C.textMuted, fontSize: 12 } }>
                  { song.artist } · { song.duration }
                </Text>
                { index === 0 && (
                  <View
                    style={ {
                      height: 2,
                      backgroundColor: '#2a2a38',
                      borderRadius: 1,
                      marginTop: 7,
                    } }
                  >
                    <View
                      style={ {
                        width: '40%',
                        height: 2,
                        backgroundColor: C.purple,
                        borderRadius: 1,
                      } }
                    />
                  </View>
                ) }
              </View>
              <TouchableOpacity style={ { padding: 4 } }>
                <Text
                  style={ {
                    fontSize: 17,
                    color: index === 0 ? C.purple : '#3e3e50',
                  } }
                >
                  { index === 0 ? '♥' : '♡' }
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }) }
      </ScrollView>

      <MiniPlayer />
    </View>
  );
}