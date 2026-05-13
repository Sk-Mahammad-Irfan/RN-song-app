import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MiniPlayer from '../../components/MiniPlayer';
import WaveformBars from '../../components/WaveformBars';
import { C } from '../../constants/theme';
import { useWavesSongs, WavePlaylist, AutoPlaylist } from '../../hooks/useWavesSongs';
import { usePlayer, Song } from '../../store/playerStore';

const sectionLabel = {
  fontSize: 9,
  letterSpacing: 1.2,
  fontWeight: '600' as const,
  color: C.textMuted,
  marginHorizontal: 16,
  marginBottom: 12,
};

// ── Skeleton ──
function SkeletonRow() {
  return (
    <View
      style={ {
        backgroundColor: C.card,
        borderWidth: 0.5,
        borderColor: C.border,
        borderRadius: 14,
        padding: 12,
        marginHorizontal: 16,
        marginVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      } }
    >
      <View style={ { width: 32, height: 32, backgroundColor: '#1e1e2e', borderRadius: 8 } } />
      <View style={ { flex: 1, gap: 6 } }>
        <View style={ { height: 10, backgroundColor: '#1e1e2e', borderRadius: 5, width: '70%' } } />
        <View style={ { height: 8, backgroundColor: '#1a1a28', borderRadius: 5, width: '40%' } } />
      </View>
    </View>
  );
}

function SkeletonAutoCard() {
  return (
    <View
      style={ {
        backgroundColor: C.card,
        borderWidth: 0.5,
        borderColor: C.border,
        borderRadius: 14,
        padding: 14,
        width: 116,
        gap: 8,
        alignItems: 'center',
      } }
    >
      <View style={ { width: 32, height: 32, backgroundColor: '#1e1e2e', borderRadius: 8 } } />
      <View style={ { height: 9, width: '80%', backgroundColor: '#1e1e2e', borderRadius: 4 } } />
      <View style={ { height: 7, width: '50%', backgroundColor: '#1a1a28', borderRadius: 4 } } />
    </View>
  );
}

// ── Playlist detail modal ──
function PlaylistModal({
  playlist,
  visible,
  onClose,
}: {
  playlist: WavePlaylist | AutoPlaylist | null;
  visible: boolean;
  onClose: () => void;
}) {
  const { setQueue, song: currentSong, isPlaying } = usePlayer();
  const router = useRouter();

  if (!playlist) return null;

  const songs = playlist.songs;

  const handlePlay = (song: Song, index: number) => {
    setQueue(songs, index);
    onClose();
    router.push('/player');
  };

  return (
    <Modal visible={ visible } animationType="slide" presentationStyle="pageSheet">
      <View style={ { flex: 1, backgroundColor: C.bg } }>

        {/* Header */ }
        <View
          style={ {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 20,
            paddingTop: 28,
            borderBottomWidth: 0.5,
            borderBottomColor: C.border,
          } }
        >
          <TouchableOpacity onPress={ onClose }>
            <Text style={ { fontSize: 28, color: C.text, lineHeight: 32 } }>‹</Text>
          </TouchableOpacity>
          <View style={ { alignItems: 'center' } }>
            <WaveformBars
              color={ playlist.color }
              bg={ playlist.bg }
              count={ 5 }
              size="sm"
              isPlaying={ false }
            />
          </View>
          <View style={ { width: 28 } } />
        </View>

        {/* Playlist info */ }
        <View style={ { alignItems: 'center', padding: 20, gap: 8 } }>
          <WaveformBars
            color={ playlist.color }
            bg={ playlist.bg }
            count={ 7 }
            size="lg"
            isPlaying={ false }
          />
          <Text style={ { fontSize: 18, fontWeight: '600', color: C.text, marginTop: 8 } }>
            { playlist.name }
          </Text>
          <Text style={ { fontSize: 11, color: C.textMuted } }>
            { songs.length } songs
          </Text>
          { 'tags' in playlist && (
            <View style={ { flexDirection: 'row', gap: 6 } }>
              { (playlist as WavePlaylist).tags.map((tag) => (
                <Text
                  key={ tag }
                  style={ {
                    fontSize: 9,
                    color: C.textMuted,
                    backgroundColor: C.border,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 10,
                  } }
                >
                  { tag }
                </Text>
              )) }
            </View>
          ) }

          {/* Play all */ }
          { songs.length > 0 && (
            <TouchableOpacity
              onPress={ () => handlePlay(songs[0], 0) }
              style={ {
                backgroundColor: C.purple,
                borderRadius: 20,
                paddingHorizontal: 24,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginTop: 4,
              } }
            >
              <View
                style={ {
                  width: 0, height: 0,
                  borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 8,
                  borderTopColor: 'transparent', borderBottomColor: 'transparent',
                  borderLeftColor: '#fff',
                } }
              />
              <Text style={ { color: '#fff', fontSize: 13, fontWeight: '600' } }>Play all</Text>
            </TouchableOpacity>
          ) }
        </View>

        {/* Song list */ }
        { songs.length === 0 ? (
          <View style={ { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 40 } }>
            { playlist.id === 'liked' ? (
              <>
                <Text style={ { fontSize: 40, lineHeight: 48 } }>♡</Text>
                <Text style={ { fontSize: 17, fontWeight: '600', color: C.text, textAlign: 'center' } }>
                  Nothing here yet
                </Text>
                <Text style={ { fontSize: 13, color: C.textMuted, textAlign: 'center', lineHeight: 22 } }>
                  Songs you love will live here.{ '\n' }Hit ♡ on anything that moves you.
                </Text>
                <TouchableOpacity
                  onPress={ onClose }
                  style={ {
                    marginTop: 8,
                    backgroundColor: C.purpleDim,
                    borderRadius: 20,
                    paddingHorizontal: 24,
                    paddingVertical: 10,
                  } }
                >
                  <Text style={ { color: C.purpleLight, fontSize: 13, fontWeight: '500' } }>
                    Discover music
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <ActivityIndicator color={ C.purple } />
                <Text style={ { color: C.textMuted, fontSize: 12 } }>Loading songs...</Text>
              </>
            ) }
          </View>
        ) : (
          <FlatList
            data={ songs }
            keyExtractor={ (item) => item.id }
            showsVerticalScrollIndicator={ false }
            contentContainerStyle={ { paddingBottom: 40 } }
            renderItem={ ({ item, index }) => {
              const isActive = currentSong.id === item.id;
              return (
                <TouchableOpacity
                  onPress={ () => handlePlay(item, index) }
                  activeOpacity={ 0.75 }
                  style={ {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    gap: 12,
                    backgroundColor: isActive ? '#16162a' : 'transparent',
                    borderBottomWidth: 0.5,
                    borderBottomColor: C.border,
                  } }
                >
                  <Text style={ { fontSize: 11, color: isActive ? C.purpleLight : C.textDim, width: 22, textAlign: 'center' } }>
                    { index + 1 }
                  </Text>
                  <WaveformBars
                    color={ item.color }
                    bg={ item.bg }
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
                      { item.title }
                    </Text>
                    <Text style={ { fontSize: 11, color: C.textMuted } }>
                      { item.artist }{ item.album ? ` · ${item.album}` : '' }
                    </Text>
                  </View>
                  <Text style={ { fontSize: 10, color: C.textDim } }>{ item.duration }</Text>
                </TouchableOpacity>
              );
            } }
          />
        ) }
      </View>
    </Modal>
  );
}

export default function WavesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setQueue, song: currentSong, isPlaying, likedSongs } = usePlayer();
  const { playlists, autoPlaylists, loading } = useWavesSongs();

  const [selectedPlaylist, setSelectedPlaylist] = useState<WavePlaylist | AutoPlaylist | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openPlaylist = (playlist: WavePlaylist | AutoPlaylist) => {
    setSelectedPlaylist(playlist);
    setModalVisible(true);
  };

  return (
    <View style={ { flex: 1, backgroundColor: C.bg } }>
      <FlatList
        data={ playlists }
        keyExtractor={ (item) => item.id }
        showsVerticalScrollIndicator={ false }
        ListHeaderComponent={
          <View style={ { paddingTop: insets.top + 16 } }>

            {/* ── Title ── */ }
            <Text
              style={ {
                fontSize: 19,
                fontWeight: '500',
                color: C.text,
                marginHorizontal: 16,
                marginBottom: 20,
              } }
            >
              Your waves
            </Text>

            {/* ── Pinned — Liked Songs ── */ }
            <Text style={ sectionLabel }>PINNED</Text>
            <TouchableOpacity
              activeOpacity={ 0.8 }
              onPress={ () =>
                openPlaylist({
                  id: 'liked',
                  name: 'Liked Songs',
                  color: C.purple,
                  bg: C.purpleDim,
                  songs: likedSongs,
                })
              }
              style={ {
                backgroundColor: C.card,
                borderWidth: 0.5,
                borderColor: C.border,
                borderRadius: 14,
                padding: 14,
                marginHorizontal: 16,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              } }
            >
              <WaveformBars color={ C.purple } bg={ C.purpleDim } count={ 5 } size="md" />
              <View style={ { flex: 1 } }>
                <Text style={ { fontSize: 14, fontWeight: '500', color: C.text, marginBottom: 3 } }>
                  Liked Songs
                </Text>
                <Text style={ { fontSize: 11, color: C.textMuted } }>
                  { likedSongs.length > 0
                    ? `${likedSongs.length} ${likedSongs.length === 1 ? 'song' : 'songs'}`
                    : 'No liked songs yet' }
                </Text>
              </View>
              { loading
                ? <ActivityIndicator color={ C.purple } size="small" />
                : <Text style={ { fontSize: 18, color: likedSongs.length > 0 ? C.purple : C.textDim } }>
                  { likedSongs.length > 0 ? '♥' : '♡' }
                </Text>
              }
            </TouchableOpacity>

            {/* ── My Playlists label ── */ }
            <Text style={ { ...sectionLabel, marginTop: 20 } }>MY PLAYLISTS</Text>
          </View>
        }

        renderItem={ ({ item }) =>
          loading ? (
            <SkeletonRow />
          ) : (
            <TouchableOpacity
              onPress={ () => openPlaylist(item) }
              activeOpacity={ 0.8 }
              style={ {
                backgroundColor: C.card,
                borderWidth: 0.5,
                borderColor: C.border,
                borderRadius: 14,
                padding: 12,
                marginHorizontal: 16,
                marginVertical: 5,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              } }
            >
              <WaveformBars color={ item.color } bg={ item.bg } count={ 5 } size="sm" />
              <View style={ { flex: 1 } }>
                <Text style={ { fontSize: 13, fontWeight: '500', color: C.text, marginBottom: 4 } }>
                  { item.name }
                </Text>
                <View style={ { flexDirection: 'row', gap: 8, marginBottom: 5 } }>
                  <Text style={ { fontSize: 10, color: C.textMuted } }>
                    { item.songs.length > 0 ? `${item.songs.length} songs` : 'Loading...' }
                  </Text>
                  <Text style={ { fontSize: 10, color: C.textMuted } }>{ item.duration }</Text>
                </View>
                <View style={ { flexDirection: 'row', gap: 5, flexWrap: 'wrap' } }>
                  { item.tags.map((tag) => (
                    <Text
                      key={ tag }
                      style={ {
                        fontSize: 9,
                        color: C.textMuted,
                        backgroundColor: C.border,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 10,
                      } }
                    >
                      { tag }
                    </Text>
                  )) }
                </View>
              </View>
              <Text style={ { fontSize: 18, color: C.textDim } }>›</Text>
            </TouchableOpacity>
          )
        }

        ListFooterComponent={
          <View style={ { paddingBottom: 120 } }>

            {/* ── Auto-generated ── */ }
            <Text style={ { ...sectionLabel, marginTop: 24 } }>AUTO-GENERATED</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={ false }
              contentContainerStyle={ { paddingHorizontal: 16, gap: 10 } }
            >
              { loading
                ? [1, 2, 3].map((i) => <SkeletonAutoCard key={ i } />)
                : autoPlaylists.map((item) => (
                  <TouchableOpacity
                    key={ item.id }
                    activeOpacity={ 0.8 }
                    onPress={ () => openPlaylist(item) }
                    style={ {
                      backgroundColor: item.bg,
                      borderWidth: 0.5,
                      borderColor: C.border,
                      borderRadius: 14,
                      padding: 14,
                      alignItems: 'center',
                      width: 116,
                      gap: 8,
                    } }
                  >
                    <WaveformBars color={ item.color } bg="transparent" count={ 4 } size="sm" />
                    <Text
                      style={ {
                        fontSize: 11,
                        fontWeight: '500',
                        color: C.text,
                        textAlign: 'center',
                      } }
                    >
                      { item.name }
                    </Text>
                    <Text style={ { fontSize: 9, color: C.textMuted } }>
                      { item.songs.length > 0 ? `${item.songs.length} songs` : '...' }
                    </Text>
                  </TouchableOpacity>
                )) }
            </ScrollView>
          </View>
        }
      />

      {/* ── Playlist Modal ── */ }
      <PlaylistModal
        playlist={ selectedPlaylist }
        visible={ modalVisible }
        onClose={ () => setModalVisible(false) }
      />

      {/* ── Mini Player ── */ }
      <MiniPlayer />
    </View>
  );
}