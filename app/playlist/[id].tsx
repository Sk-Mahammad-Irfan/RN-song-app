import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MiniPlayer from '../../components/MiniPlayer';
import WaveformBars from '../../components/WaveformBars';
import { PLAYLISTS, SONGS } from '../../constants/mockData';
import { C } from '../../constants/theme';

export default function PlaylistDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const playlist = PLAYLISTS.find((p) => p.id === id);
  if (!playlist) {
    return (
      <View style={[styles.container, { backgroundColor: C.bg }]}>
        <Text style={{ color: C.text }}>Playlist not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <FlatList
        data={SONGS}
        keyExtractor={(item) => item.id}
        scrollEnabled
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={[styles.backArrow, { color: C.text }]}>‹</Text>
              </TouchableOpacity>
              <Text style={[styles.breadcrumb, { color: C.textMuted }]}>
                your waves › {playlist.name}
              </Text>
            </View>

            <View style={styles.headerContent}>
              <WaveformBars
                color={playlist.color}
                bg={playlist.bg}
                size="lg"
                count={6}
              />
              <Text style={[styles.playlistName, { color: C.text }]}>
                {playlist.name}
              </Text>
              <View style={styles.playlistStats}>
                <Text style={[styles.stat, { color: C.textMuted }]}>
                  {playlist.count} songs
                </Text>
                <Text style={[styles.stat, { color: C.textMuted }]}>
                  {playlist.duration}
                </Text>
              </View>

              <View style={styles.tagContainer}>
                {playlist.tags.map((tag) => (
                  <Text
                    key={tag}
                    style={[
                      styles.tag,
                      {
                        backgroundColor: C.border,
                        color: C.textMuted,
                      },
                    ]}
                  >
                    {tag}
                  </Text>
                ))}
              </View>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.playButton,
                    {
                      backgroundColor: C.purple,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.playButtonText, { color: C.text }]}>
                    ▶ Play all
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    {
                      backgroundColor: C.card,
                      borderColor: C.border,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.iconButtonText}>🔀</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    {
                      backgroundColor: C.card,
                      borderColor: C.border,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.iconButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={[
                styles.songsHeader,
                {
                  backgroundColor: C.card,
                  borderColor: C.border,
                },
              ]}
            >
              <Text style={[styles.songsHeaderText, { color: C.textMuted }]}>
                {SONGS.length} songs
              </Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.songRow,
              {
                backgroundColor: C.card,
                borderColor: C.border,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.songNumber, { color: C.textMuted }]}>
              {index + 1}
            </Text>
            <View style={styles.songInfo}>
              <Text style={[styles.songTitle, { color: C.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.songArtist, { color: C.textMuted }]} numberOfLines={1}>
                {item.artist}
              </Text>
            </View>
            <Text style={[styles.duration, { color: C.textMuted }]}>
              {item.duration}
            </Text>
            <View
              style={{
                opacity: index === 0 ? 1 : 0.4,
              }}
            >
              <WaveformBars
                color={item.color}
                bg={item.bg}
                size="sm"
                count={3}
              />
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
      <View style={styles.miniPlayerWrapper}>
        <MiniPlayer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backArrow: {
    fontSize: 28,
  },
  breadcrumb: {
    fontSize: 12,
    flex: 1,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  playlistName: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  playlistStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  stat: {
    fontSize: 11,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  playButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 16,
  },
  songsHeader: {
    borderWidth: 0.5,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  songsHeaderText: {
    fontSize: 11,
  },
  songRow: {
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 16,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  songNumber: {
    fontSize: 11,
    width: 24,
    textAlign: 'center',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 10,
  },
  duration: {
    fontSize: 10,
    width: 30,
    textAlign: 'right',
  },
  miniPlayerWrapper: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
  },
});
