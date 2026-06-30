import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
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
import { C } from '../../constants/theme';
import { usePlayer, Song } from '../../store/playerStore';

const MOODS = ['Focus', 'Chill', 'Hype', 'Sleep'];

// ── Real songs per mood ──
const MOOD_SONGS: Record<string, Song[]> = {
  Focus: [
    { id: 'f1', title: 'Intro', artist: 'The xx', duration: '2:07', color: '#5a4be8', bg: '#13102a' },
    { id: 'f2', title: 'Comptine d\'un autre été', artist: 'Yann Tiersen', duration: '2:34', color: '#5a4be8', bg: '#13102a' },
    { id: 'f3', title: 'Experience', artist: 'Ludovico Einaudi', duration: '5:14', color: '#7a6cf0', bg: '#16143a' },
  ],
  Chill: [
    { id: 'c1', title: 'Golden Hour', artist: 'JVKE', duration: '3:29', color: '#1d9e75', bg: '#0e1f1a' },
    { id: 'c2', title: 'Peaches', artist: 'Justin Bieber', duration: '3:18', color: '#1d9e75', bg: '#0e1f1a' },
    { id: 'c3', title: 'Watermelon Sugar', artist: 'Harry Styles', duration: '2:54', color: '#2ab882', bg: '#0f2218' },
  ],
  Hype: [
    { id: 'h1', title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', color: '#d85a30', bg: '#1e1010' },
    { id: 'h2', title: 'SICKO MODE', artist: 'Travis Scott', duration: '5:12', color: '#d85a30', bg: '#1e1010' },
    { id: 'h3', title: 'HUMBLE.', artist: 'Kendrick Lamar', duration: '2:57', color: '#e06030', bg: '#201208' },
  ],
  Sleep: [
    { id: 's1', title: 'Clair de Lune', artist: 'Claude Debussy', duration: '4:54', color: '#888780', bg: '#101018' },
    { id: 's2', title: 'Holocene', artist: 'Bon Iver', duration: '5:37', color: '#888780', bg: '#101018' },
    { id: 's3', title: 'Retrograde', artist: 'James Blake', duration: '4:09', color: '#9a9890', bg: '#121218' },
  ],
};

// ── Real playlists with real song lists ──
const HOME_PLAYLISTS = [
  {
    id: 'p1',
    name: 'Late Night Drive',
    count: 12,
    color: '#5a4be8',
    bg: '#13102a',
    songs: [
      { id: 'ln1', title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', color: '#5a4be8', bg: '#13102a' },
      { id: 'ln2', title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', color: '#5a4be8', bg: '#13102a' },
      { id: 'ln3', title: 'Save Your Tears', artist: 'The Weeknd', duration: '3:35', color: '#5a4be8', bg: '#13102a' },
    ],
  },
  {
    id: 'p2',
    name: 'Morning Run',
    count: 18,
    color: '#d85a30',
    bg: '#1e1010',
    songs: [
      { id: 'mr1', title: 'HUMBLE.', artist: 'Kendrick Lamar', duration: '2:57', color: '#d85a30', bg: '#1e1010' },
      { id: 'mr2', title: 'God\'s Plan', artist: 'Drake', duration: '3:18', color: '#d85a30', bg: '#1e1010' },
      { id: 'mr3', title: 'SICKO MODE', artist: 'Travis Scott', duration: '5:12', color: '#d85a30', bg: '#1e1010' },
    ],
  },
  {
    id: 'p3',
    name: 'Sunday Vibes',
    count: 9,
    color: '#1d9e75',
    bg: '#0e1f1a',
    songs: [
      { id: 'sv1', title: 'Golden Hour', artist: 'JVKE', duration: '3:29', color: '#1d9e75', bg: '#0e1f1a' },
      { id: 'sv2', title: 'Watermelon Sugar', artist: 'Harry Styles', duration: '2:54', color: '#1d9e75', bg: '#0e1f1a' },
      { id: 'sv3', title: 'Peaches', artist: 'Justin Bieber', duration: '3:18', color: '#1d9e75', bg: '#0e1f1a' },
    ],
  },
];

// ── Jump back in — trending real songs ──
const JUMP_BACK: Song[] = [
  { id: 'j1', title: 'As It Was', artist: 'Harry Styles', duration: '2:37', color: '#d4537e', bg: '#1e1020' },
  { id: 'j2', title: 'Starboy', artist: 'The Weeknd', duration: '3:50', color: '#5a4be8', bg: '#13102a' },
  { id: 'j3', title: 'Stay', artist: 'The Kid LAROI', duration: '2:21', color: '#1d9e75', bg: '#0e1f1a' },
  { id: 'j4', title: 'Heat Waves', artist: 'Glass Animals', duration: '3:59', color: '#ba7517', bg: '#1a1008' },
];

// ── Featured banner per mood ──
const FEATURED: Record<string, { title: string; sub: string; color: string; bg: string }> = {
  Focus: { title: 'Deep Work Session', sub: 'Ambient · Lo-fi · Minimal', color: '#5a4be8', bg: '#13102a' },
  Chill: { title: 'Sunday Slowdown', sub: 'Acoustic · Soul · Indie', color: '#1d9e75', bg: '#0e1f1a' },
  Hype: { title: 'Adrenaline Rush', sub: 'Alt · Electronic · High BPM', color: '#d85a30', bg: '#1e1010' },
  Sleep: { title: 'Drift Away', sub: 'Ambient · Jazz · Soft', color: '#888780', bg: '#101018' },
};

export default function HomeScreen() {
  const lastOffset = useRef(0);
  const [hideMini, setHideMini] = useState(false);
  const [activeMood, setActiveMood] = useState('Focus');
  const { song: currentSong, isPlaying, setQueue, recentlyPlayed } = usePlayer();
  const router = useRouter();

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const direction = currentOffset - lastOffset.current;
    if (direction > 10) setHideMini(true);
    else if (direction < -10) setHideMini(false);
    lastOffset.current = currentOffset;
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'good morning' : hour < 17 ? 'good afternoon' : 'good evening';

  const featured = FEATURED[activeMood];
  const moodSongs = MOOD_SONGS[activeMood];
  const recentList = recentlyPlayed.length > 0
    ? recentlyPlayed.slice(0, 6)
    : JUMP_BACK.slice(0, 4);

  const handleSongPress = (song: Song, sourceList: Song[]) => {
    const index = sourceList.findIndex((s) => s.id === song.id);
    setQueue(sourceList, index >= 0 ? index : 0);
    router.push('/player');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={{ backgroundColor: C.bg }} edges={['top']} />

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >

        {/* ── Top bar ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginTop: 10,
            marginBottom: 20,
          }}
        >
          <View>
            <Text style={{ color: C.textMuted, fontSize: 12, marginBottom: 2 }}>
              {greeting}
            </Text>
            <Text style={{ color: C.text, fontSize: 22, fontWeight: '700' }}>
              What's the mood?
            </Text>
          </View>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: C.purple,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>SI</Text>
          </View>
        </View>

        {/* ── Mood Pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 24 }}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          {MOODS.map((mood) => (
            <MoodPill
              key={mood}
              label={mood}
              active={activeMood === mood}
              onPress={() => setActiveMood(mood)}
            />
          ))}
        </ScrollView>

        {/* ── Featured Banner ── */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => handleSongPress(moodSongs[0], moodSongs)}
          style={{
            marginHorizontal: 20,
            backgroundColor: featured.bg,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: C.border,
            padding: 20,
            marginBottom: 28,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            overflow: 'hidden',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 9,
                letterSpacing: 1.2,
                color: featured.color,
                fontWeight: '700',
                marginBottom: 6,
                opacity: 0.85,
              }}
            >
              {activeMood.toUpperCase()} MIX
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: C.text,
                marginBottom: 4,
                lineHeight: 24,
              }}
            >
              {featured.title}
            </Text>
            <Text style={{ fontSize: 11, color: C.textMuted, marginBottom: 14 }}>
              {featured.sub}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                onPress={() => handleSongPress(moodSongs[0], moodSongs)}
                style={{
                  backgroundColor: featured.color,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <View
                  style={{
                    width: 0,
                    height: 0,
                    borderTopWidth: 5,
                    borderBottomWidth: 5,
                    borderLeftWidth: 8,
                    borderTopColor: 'transparent',
                    borderBottomColor: 'transparent',
                    borderLeftColor: '#fff',
                    marginLeft: 1,
                  }}
                />
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Play</Text>
              </TouchableOpacity>
              <Text style={{ color: C.textMuted, fontSize: 11 }}>
                {moodSongs.length} songs
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <WaveformBars
              color={featured.color}
              bg="transparent"
              count={5}
              isPlaying={isPlaying && moodSongs.some((s) => s.id === currentSong.id)}
              size="lg"
            />
          </View>
        </TouchableOpacity>

        {/* ── Recently Played ── */}
        <View style={{ marginBottom: 28 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              marginBottom: 14,
            }}
          >
            <Text style={{ color: C.textMuted, fontSize: 10, letterSpacing: 1.5, fontWeight: '700' }}>
              RECENTLY PLAYED
            </Text>
            {recentlyPlayed.length > 0 && (
              <Text style={{ color: C.textDim, fontSize: 10 }}>
                {recentlyPlayed.length} songs
              </Text>
            )}
          </View>

          <View
            style={{
              paddingHorizontal: 20,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {recentList.map((song) => {
              const isActive = currentSong.id === song.id;
              return (
                <TouchableOpacity
                  key={song.id}
                  onPress={() => handleSongPress(song, recentList)}
                  activeOpacity={0.8}
                  style={{
                    width: '47.5%',
                    backgroundColor: C.card,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: isActive ? C.purple : C.border,
                    padding: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <WaveformBars
                    color={song.color}
                    bg={song.bg}
                    count={3}
                    isPlaying={isActive && isPlaying}
                    size="sm"
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: isActive ? C.purpleLight : C.text,
                        marginBottom: 2,
                      }}
                    >
                      {song.title}
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 9, color: C.textMuted }}>
                      {song.artist}
                    </Text>
                  </View>
                  {isActive && isPlaying && (
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.purple }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Mood Picks — horizontal scroll ── */}
        <View style={{ marginBottom: 28 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              marginBottom: 14,
            }}
          >
            <Text style={{ color: C.textMuted, fontSize: 10, letterSpacing: 1.5, fontWeight: '700' }}>
              {activeMood.toUpperCase()} PICKS
            </Text>
            <Text style={{ color: C.textDim, fontSize: 10 }}>
              {moodSongs.length} songs
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {moodSongs.map((song) => {
              const isActive = currentSong.id === song.id;
              return (
                <TouchableOpacity
                  key={song.id}
                  onPress={() => handleSongPress(song, moodSongs)}
                  activeOpacity={0.8}
                  style={{
                    width: 130,
                    backgroundColor: song.bg,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: isActive ? song.color : C.border,
                    padding: 14,
                    gap: 10,
                  }}
                >
                  <WaveformBars
                    color={song.color}
                    bg="transparent"
                    count={4}
                    isPlaying={isActive && isPlaying}
                    size="md"
                  />
                  <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: '600', color: C.text }}>
                    {song.title}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 10, color: C.textMuted }}>
                    {song.artist}
                  </Text>
                  <Text style={{ fontSize: 10, color: C.textDim }}>{song.duration}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Your Playlists ── */}
        <View style={{ marginBottom: 28 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              marginBottom: 14,
            }}
          >
            <Text style={{ color: C.textMuted, fontSize: 10, letterSpacing: 1.5, fontWeight: '700' }}>
              YOUR PLAYLISTS
            </Text>
            <TouchableOpacity onPress={() => router.push('/waves')}>
              <Text style={{ color: C.purpleLight, fontSize: 10, fontWeight: '600' }}>
                see all
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {HOME_PLAYLISTS.map((playlist) => (
              <TouchableOpacity
                key={playlist.id}
                onPress={() => handleSongPress(playlist.songs[0], playlist.songs)}
                activeOpacity={0.8}
                style={{ width: 110, gap: 8, alignItems: 'center' }}
              >
                <View
                  style={{
                    width: 110,
                    height: 110,
                    backgroundColor: playlist.bg,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: C.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WaveformBars
                    color={playlist.color}
                    bg="transparent"
                    count={5}
                    isPlaying={false}
                    size="md"
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 11, fontWeight: '600', color: C.text, textAlign: 'center' }}
                >
                  {playlist.name}
                </Text>
                <Text style={{ fontSize: 9, color: C.textMuted }}>
                  {playlist.count} songs
                </Text>
              </TouchableOpacity>
            ))}

            {/* New playlist card */}
            <TouchableOpacity
              onPress={() => router.push('/waves')}
              activeOpacity={0.8}
              style={{ width: 110, gap: 8, alignItems: 'center' }}
            >
              <View
                style={{
                  width: 110,
                  height: 110,
                  backgroundColor: C.card,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: C.border,
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Text style={{ color: C.textMuted, fontSize: 24, lineHeight: 28 }}>+</Text>
                <Text style={{ color: C.textMuted, fontSize: 9, textAlign: 'center' }}>
                  New playlist
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ── Jump Back In ── */}
        <View>
          <Text
            style={{
              color: C.textMuted,
              fontSize: 10,
              letterSpacing: 1.5,
              fontWeight: '700',
              paddingHorizontal: 20,
              marginBottom: 14,
            }}
          >
            JUMP BACK IN
          </Text>

          {JUMP_BACK.map((song, index) => {
            const isActive = currentSong.id === song.id;
            return (
              <TouchableOpacity
                key={song.id}
                onPress={() => handleSongPress(song, JUMP_BACK)}
                activeOpacity={0.75}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  gap: 12,
                  backgroundColor: isActive ? '#16162a' : 'transparent',
                }}
              >
                {/* Number or animated bars */}
                <View style={{ width: 20, alignItems: 'center', justifyContent: 'center' }}>
                  {isActive && isPlaying ? (
                    <View style={{ flexDirection: 'row', gap: 1.5, alignItems: 'flex-end', height: 14 }}>
                      {[0.6, 1, 0.7].map((h, i) => (
                        <View
                          key={i}
                          style={{
                            width: 3,
                            height: 14 * h,
                            backgroundColor: C.purple,
                            borderRadius: 1.5,
                          }}
                        />
                      ))}
                    </View>
                  ) : (
                    <Text style={{ color: C.textDim, fontSize: 12 }}>{index + 1}</Text>
                  )}
                </View>

                <WaveformBars
                  color={song.color}
                  bg={song.bg}
                  count={3}
                  isPlaying={isActive && isPlaying}
                  size="sm"
                />

                <View style={{ flex: 1 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: isActive ? C.purpleLight : C.text,
                      marginBottom: 3,
                    }}
                  >
                    {song.title}
                  </Text>
                  <Text style={{ fontSize: 11, color: C.textMuted }}>
                    {song.artist}
                  </Text>
                </View>

                <Text style={{ fontSize: 11, color: C.textDim }}>{song.duration}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      <MiniPlayer hidden={hideMini} />
    </View>
  );
}