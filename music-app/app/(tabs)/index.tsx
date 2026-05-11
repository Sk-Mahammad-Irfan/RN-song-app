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
import { PLAYLISTS, SONGS } from '../../constants/mockData';
import { C } from '../../constants/theme';
import { usePlayer } from '../../store/playerStore';

const MOODS = ['Focus', 'Chill', 'Hype', 'Sleep'];

const MOOD_FILTER: Record<string, number[]> = {
  Focus: [0, 2, 4],
  Chill: [1, 2, 4],
  Hype: [0, 2, 3],
  Sleep: [1, 3, 4],
};

// Featured banners — mood based
const FEATURED: Record<string, { title: string; sub: string; color: string; bg: string }> = {
  Focus: { title: 'Deep Work Session', sub: 'Ambient · Lo-fi · Minimal', color: '#5a4be8', bg: '#13102a' },
  Chill: { title: 'Sunday Slowdown', sub: 'Acoustic · Soul · Indie', color: '#1d9e75', bg: '#0e1f1a' },
  Hype: { title: 'Adrenaline Rush', sub: 'Alt · Electronic · High BPM', color: '#d85a30', bg: '#1e1010' },
  Sleep: { title: 'Drift Away', sub: 'Ambient · Jazz · Soft', color: '#888780', bg: '#101018' },
};

export default function HomeScreen() {
  const [activeMood, setActiveMood] = useState('Focus');
  const { song: currentSong, isPlaying, setQueue, playSong, recentlyPlayed } = usePlayer();
  const router = useRouter();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'good morning' : hour < 17 ? 'good afternoon' : 'good evening';

  const featured = FEATURED[activeMood];
  const filteredSongs = SONGS.filter((_, i) =>
    MOOD_FILTER[activeMood]?.includes(i) ?? true
  );
  const recentList = recentlyPlayed.length > 0
    ? recentlyPlayed.slice(0, 6)
    : SONGS.slice(0, 3);

  const handleSongPress = (song: (typeof SONGS)[0], sourceList: typeof SONGS) => {
    const index = sourceList.findIndex((s) => s.id === song.id);
    setQueue(sourceList, index >= 0 ? index : 0);
    router.push('/player');
  };

  return (
    <View style={ { flex: 1, backgroundColor: C.bg } }>
      <SafeAreaView style={ { backgroundColor: C.bg } } />

      <ScrollView
        style={ { flex: 1 } }
        contentContainerStyle={ { paddingBottom: 16 } }
        showsVerticalScrollIndicator={ false }
      >

        {/* ── Top bar ── */ }
        <View
          style={ {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginTop: 6,
            marginBottom: 20,
          } }
        >
          <View>
            <Text style={ { color: C.textMuted, fontSize: 12, marginBottom: 2 } }>
              { greeting }
            </Text>
            <Text style={ { color: C.text, fontSize: 20, fontWeight: '600' } }>
              What's the mood?
            </Text>
          </View>

          {/* Avatar */ }
          <View
            style={ {
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: C.purple,
              alignItems: 'center',
              justifyContent: 'center',
            } }
          >
            <Text style={ { color: '#fff', fontSize: 14, fontWeight: '600' } }>SI</Text>
          </View>
        </View>

        {/* ── Mood Pills ── */ }
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={ false }
          style={ { marginBottom: 22 } }
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

        {/* ── Featured Banner ── */ }
        <TouchableOpacity
          activeOpacity={ 0.88 }
          onPress={ () => handleSongPress(filteredSongs[0], filteredSongs) }
          style={ {
            marginHorizontal: 20,
            backgroundColor: featured.bg,
            borderRadius: 20,
            borderWidth: 0.5,
            borderColor: C.border,
            padding: 20,
            marginBottom: 28,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            overflow: 'hidden',
          } }
        >
          {/* Large waveform */ }
          <View style={ { flex: 1 } }>
            <Text
              style={ {
                fontSize: 9,
                letterSpacing: 1.2,
                color: featured.color,
                fontWeight: '600',
                marginBottom: 6,
                opacity: 0.8,
              } }
            >
              { activeMood.toUpperCase() } MIX
            </Text>
            <Text
              style={ {
                fontSize: 20,
                fontWeight: '700',
                color: C.text,
                marginBottom: 4,
                lineHeight: 24,
              } }
            >
              { featured.title }
            </Text>
            <Text style={ { fontSize: 11, color: C.textMuted, marginBottom: 14 } }>
              { featured.sub }
            </Text>
            <View
              style={ {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              } }
            >
              <TouchableOpacity
                onPress={ () => handleSongPress(filteredSongs[0], filteredSongs) }
                style={ {
                  backgroundColor: featured.color,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                } }
              >
                <View
                  style={ {
                    width: 0,
                    height: 0,
                    borderTopWidth: 5,
                    borderBottomWidth: 5,
                    borderLeftWidth: 8,
                    borderTopColor: 'transparent',
                    borderBottomColor: 'transparent',
                    borderLeftColor: '#fff',
                    marginLeft: 1,
                  } }
                />
                <Text style={ { color: '#fff', fontSize: 12, fontWeight: '600' } }>
                  Play
                </Text>
              </TouchableOpacity>
              <Text style={ { color: C.textMuted, fontSize: 11 } }>
                { filteredSongs.length } songs
              </Text>
            </View>
          </View>

          {/* Right side waveform visual */ }
          <View style={ { alignItems: 'flex-end', gap: 6 } }>
            <WaveformBars
              color={ featured.color }
              bg="transparent"
              count={ 5 }
              isPlaying={ isPlaying && filteredSongs.some((s) => s.id === currentSong.id) }
              size="lg"
            />
          </View>
        </TouchableOpacity>

        {/* ── Recently Played ── */ }
        { recentList.length > 0 && (
          <View style={ { marginBottom: 28 } }>
            <View
              style={ {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                marginBottom: 14,
              } }
            >
              <Text style={ { color: C.textMuted, fontSize: 10, letterSpacing: 1.5 } }>
                RECENTLY PLAYED
              </Text>
              { recentlyPlayed.length > 0 && (
                <Text style={ { color: C.textDim, fontSize: 10 } }>
                  { recentlyPlayed.length } songs
                </Text>
              ) }
            </View>

            {/* 2-column grid */ }
            <View
              style={ {
                paddingHorizontal: 20,
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 10,
              } }
            >
              { recentList.map((song) => {
                const isActive = currentSong.id === song.id;
                return (
                  <TouchableOpacity
                    key={ song.id }
                    onPress={ () => handleSongPress(song, recentList) }
                    activeOpacity={ 0.8 }
                    style={ {
                      width: '47.5%',
                      backgroundColor: C.card,
                      borderRadius: 12,
                      borderWidth: 0.5,
                      borderColor: isActive ? C.purple : C.border,
                      padding: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    } }
                  >
                    <WaveformBars
                      color={ song.color }
                      bg={ song.bg }
                      count={ 3 }
                      isPlaying={ isActive && isPlaying }
                      size="sm"
                    />
                    <View style={ { flex: 1 } }>
                      <Text
                        numberOfLines={ 1 }
                        style={ {
                          fontSize: 11,
                          fontWeight: '500',
                          color: isActive ? C.purpleLight : C.text,
                          marginBottom: 2,
                        } }
                      >
                        { song.title }
                      </Text>
                      <Text numberOfLines={ 1 } style={ { fontSize: 9, color: C.textMuted } }>
                        { song.artist }
                      </Text>
                    </View>
                    { isActive && isPlaying && (
                      <View
                        style={ {
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: C.purple,
                        } }
                      />
                    ) }
                  </TouchableOpacity>
                );
              }) }
            </View>
          </View>
        ) }

        {/* ── Mood Picks — horizontal scroll ── */ }
        <View style={ { marginBottom: 28 } }>
          <View
            style={ {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              marginBottom: 14,
            } }
          >
            <Text style={ { color: C.textMuted, fontSize: 10, letterSpacing: 1.5 } }>
              { activeMood.toUpperCase() } PICKS
            </Text>
            <Text style={ { color: C.textDim, fontSize: 10 } }>
              { filteredSongs.length } songs
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={ false }
            contentContainerStyle={ { paddingHorizontal: 20, gap: 12 } }
          >
            { filteredSongs.map((song) => {
              const isActive = currentSong.id === song.id;
              return (
                <TouchableOpacity
                  key={ song.id }
                  onPress={ () => handleSongPress(song, filteredSongs) }
                  activeOpacity={ 0.8 }
                  style={ {
                    width: 130,
                    backgroundColor: song.bg,
                    borderRadius: 16,
                    borderWidth: 0.5,
                    borderColor: isActive ? song.color : C.border,
                    padding: 14,
                    gap: 10,
                  } }
                >
                  <WaveformBars
                    color={ song.color }
                    bg="transparent"
                    count={ 4 }
                    isPlaying={ isActive && isPlaying }
                    size="md"
                  />
                  <Text
                    numberOfLines={ 1 }
                    style={ {
                      fontSize: 12,
                      fontWeight: '500',
                      color: C.text,
                    } }
                  >
                    { song.title }
                  </Text>
                  <Text
                    numberOfLines={ 1 }
                    style={ { fontSize: 10, color: C.textMuted } }
                  >
                    { song.artist }
                  </Text>
                  <Text style={ { fontSize: 10, color: C.textDim } }>
                    { song.duration }
                  </Text>
                </TouchableOpacity>
              );
            }) }
          </ScrollView>
        </View>

        {/* ── Your Playlists ── */ }
        <View style={ { marginBottom: 28 } }>
          <View
            style={ {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              marginBottom: 14,
            } }
          >
            <Text style={ { color: C.textMuted, fontSize: 10, letterSpacing: 1.5 } }>
              YOUR PLAYLISTS
            </Text>
            <TouchableOpacity onPress={ () => router.push('/waves') }>
              <Text style={ { color: C.purpleLight, fontSize: 10, fontWeight: '500' } }>
                see all
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={ false }
            contentContainerStyle={ { paddingHorizontal: 20, gap: 12 } }
          >
            { PLAYLISTS.map((playlist) => (
              <TouchableOpacity
                key={ playlist.id }
                onPress={ () => router.push(`/playlist/${playlist.id}`) }
                activeOpacity={ 0.8 }
                style={ {
                  width: 110,
                  gap: 8,
                  alignItems: 'center',
                } }
              >
                <View
                  style={ {
                    width: 110,
                    height: 110,
                    backgroundColor: playlist.bg,
                    borderRadius: 16,
                    borderWidth: 0.5,
                    borderColor: C.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  } }
                >
                  <WaveformBars
                    color={ playlist.color }
                    bg="transparent"
                    count={ 5 }
                    isPlaying={ false }
                    size="md"
                  />
                </View>
                <Text
                  numberOfLines={ 1 }
                  style={ {
                    fontSize: 11,
                    fontWeight: '500',
                    color: C.text,
                    textAlign: 'center',
                  } }
                >
                  { playlist.name }
                </Text>
                <Text style={ { fontSize: 9, color: C.textMuted } }>
                  { playlist.count } songs
                </Text>
              </TouchableOpacity>
            )) }

            {/* Create new playlist card */ }
            <TouchableOpacity
              onPress={ () => router.push('/waves') }
              activeOpacity={ 0.8 }
              style={ { width: 110, gap: 8, alignItems: 'center' } }
            >
              <View
                style={ {
                  width: 110,
                  height: 110,
                  backgroundColor: C.card,
                  borderRadius: 16,
                  borderWidth: 0.5,
                  borderColor: C.border,
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                } }
              >
                <Text style={ { color: C.textMuted, fontSize: 24, lineHeight: 28 } }>+</Text>
                <Text style={ { color: C.textMuted, fontSize: 9, textAlign: 'center' } }>
                  New playlist
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ── Jump back in — full width rows ── */ }
        <View style={ { marginBottom: 16 } }>
          <Text
            style={ {
              color: C.textMuted,
              fontSize: 10,
              letterSpacing: 1.5,
              paddingHorizontal: 20,
              marginBottom: 14,
            } }
          >
            JUMP BACK IN
          </Text>

          { SONGS.slice(0, 4).map((song, index) => {
            const isActive = currentSong.id === song.id;
            return (
              <TouchableOpacity
                key={ song.id }
                onPress={ () => handleSongPress(song, SONGS) }
                activeOpacity={ 0.75 }
                style={ {
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                  gap: 12,
                  backgroundColor: isActive ? '#16162a' : 'transparent',
                } }
              >
                {/* Number or playing indicator */ }
                <View
                  style={ {
                    width: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  } }
                >
                  { isActive && isPlaying ? (
                    <View style={ { flexDirection: 'row', gap: 1.5, alignItems: 'flex-end', height: 14 } }>
                      { [0.6, 1, 0.7].map((h, i) => (
                        <View
                          key={ i }
                          style={ {
                            width: 3,
                            height: 14 * h,
                            backgroundColor: C.purple,
                            borderRadius: 1.5,
                          } }
                        />
                      )) }
                    </View>
                  ) : (
                    <Text style={ { color: C.textDim, fontSize: 12 } }>{ index + 1 }</Text>
                  ) }
                </View>

                <WaveformBars
                  color={ song.color }
                  bg={ song.bg }
                  count={ 3 }
                  isPlaying={ isActive && isPlaying }
                  size="sm"
                />

                <View style={ { flex: 1 } }>
                  <Text
                    numberOfLines={ 1 }
                    style={ {
                      fontSize: 13,
                      fontWeight: '500',
                      color: isActive ? C.purpleLight : C.text,
                      marginBottom: 3,
                    } }
                  >
                    { song.title }
                  </Text>
                  <Text style={ { fontSize: 11, color: C.textMuted } }>
                    { song.artist } · { song.duration }
                  </Text>
                </View>

                <Text style={ { fontSize: 11, color: C.textDim } }>{ song.duration }</Text>
              </TouchableOpacity>
            );
          }) }
        </View>

      </ScrollView>

      <MiniPlayer />
    </View>
  );
}