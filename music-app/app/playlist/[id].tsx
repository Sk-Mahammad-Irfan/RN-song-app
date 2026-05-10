import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MiniPlayer from '../../components/MiniPlayer';
import WaveformBars from '../../components/WaveformBars';
import { PLAYLISTS, SONGS } from '../../constants/mockData';
import { C } from '../../constants/theme';
import { usePlayer } from '../../store/playerStore';

export default function PlaylistDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { song: currentSong, isPlaying, setSong } = usePlayer();

  const playlist = PLAYLISTS.find((p) => p.id === id);

  if (!playlist) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: C.textMuted, fontSize: 14 }}>Playlist not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <FlatList
        data={SONGS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top }}>

            {/* ── Back row ── */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                gap: 10,
              }}
            >
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={{ fontSize: 28, color: C.text, lineHeight: 32 }}>‹</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 12, color: C.textMuted, flex: 1 }}>
                your waves › {playlist.name}
              </Text>
            </View>

            {/* ── Playlist hero ── */}
            <View style={{ alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12 }}>
              <WaveformBars
                color={playlist.color}
                bg={playlist.bg}
                size="lg"
                count={6}
              />

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: C.text,
                  textAlign: 'center',
                  marginTop: 4,
                }}
              >
                {playlist.name}
              </Text>

              {/* count + duration */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Text style={{ fontSize: 11, color: C.textMuted }}>{playlist.count} songs</Text>
                <Text style={{ fontSize: 11, color: C.textMuted }}>{playlist.duration}</Text>
              </View>

              {/* Tags */}
              <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                {playlist.tags.map((tag) => (
                  <Text
                    key={tag}
                    style={{
                      fontSize: 10,
                      color: C.textMuted,
                      backgroundColor: C.border,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 10,
                    }}
                  >
                    {tag}
                  </Text>
                ))}
              </View>

              {/* Action buttons */}
              <View style={{ flexDirection: 'row', gap: 8, width: '100%', marginTop: 4 }}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => { setSong(SONGS[0]); router.push('/player'); }}
                  style={{
                    flex: 1,
                    backgroundColor: C.purple,
                    borderRadius: 10,
                    paddingVertical: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.text }}>
                    ▶  Play all
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    backgroundColor: C.card,
                    borderWidth: 0.5,
                    borderColor: C.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 15 }}>🔀</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    backgroundColor: C.card,
                    borderWidth: 0.5,
                    borderColor: C.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 20, color: C.textMuted, lineHeight: 26 }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Songs count strip ── */}
            <View
              style={{
                backgroundColor: C.card,
                borderWidth: 0.5,
                borderColor: C.border,
                borderRadius: 10,
                paddingVertical: 8,
                paddingHorizontal: 14,
                marginHorizontal: 16,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 11, color: C.textMuted }}>
                {SONGS.length} songs
              </Text>
            </View>
          </View>
        }

        renderItem={({ item, index }) => {
          const isActive = currentSong.id === item.id;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => { setSong(item); router.push('/player'); }}
              style={{
                backgroundColor: C.card,
                borderWidth: 0.5,
                borderColor: isActive ? C.purple : C.border,
                borderRadius: 12,
                padding: 10,
                marginHorizontal: 16,
                marginVertical: 4,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              {/* Number */}
              <Text
                style={{
                  fontSize: 11,
                  color: isActive ? C.purpleLight : C.textMuted,
                  width: 22,
                  textAlign: 'center',
                }}
              >
                {index + 1}
              </Text>

              {/* Song info */}
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: isActive ? C.purpleLight : C.text,
                    marginBottom: 3,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 10, color: C.textMuted }}
                >
                  {item.artist}
                </Text>
              </View>

              {/* Duration */}
              <Text style={{ fontSize: 10, color: C.textDim, width: 32, textAlign: 'right' }}>
                {item.duration}
              </Text>

              {/* Waveform bars */}
              <View style={{ opacity: isActive ? 1 : 0.35 }}>
                <WaveformBars
                  color={item.color}
                  bg={item.bg}
                  size="sm"
                  count={3}
                  isPlaying={isActive && isPlaying}
                />
              </View>
            </TouchableOpacity>
          );
        }}

        ListFooterComponent={<View style={{ height: 120 }} />}
      />

      {/* ── Mini Player ── */}
      <View style={{ position: 'absolute', bottom: 50, left: 0, right: 0 }}>
        <MiniPlayer />
      </View>
    </View>
  );
}