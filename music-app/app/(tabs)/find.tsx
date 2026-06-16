import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MiniPlayer from '../../components/MiniPlayer';
import WaveformBars from '../../components/WaveformBars';
import { C } from '../../constants/theme';
import { SongWithArt, useMusicBrainz } from '../../hooks/useMusicBrainz';
import { usePlayer } from '../../store/playerStore';

const textures = [
  { id: '1', name: 'Deep focus', genre: 'ambient · lo-fi', color: '#5a4be8', bg: '#13102a' },
  { id: '2', name: 'Morning flow', genre: 'acoustic · indie', color: '#1d9e75', bg: '#0e1f1a' },
  { id: '3', name: 'Electric rush', genre: 'alt · electronic', color: '#d85a30', bg: '#1e1010' },
  { id: '4', name: 'Late night', genre: 'jazz · soul', color: '#888780', bg: '#101018' },
];

function MBSongCard({ song, onPress }: { song: SongWithArt; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={ onPress }
      activeOpacity={ 0.85 }
      style={ {
        backgroundColor: '#151521',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 12,
        marginHorizontal: 16,
        marginVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      } }
    >
      { song.coverArt ? (
        <Image
          source={ { uri: song.coverArt } }
          style={ {
            width: 46,
            height: 46,
            borderRadius: 12,
          } }
        />
      ) : (
        <View style={ { width: 46, height: 46, justifyContent: 'center' } }>
          <WaveformBars color={ song.color } bg={ song.bg } count={ 4 } size="sm" />
        </View>
      ) }

      <View style={ { flex: 1 } }>
        <Text
          numberOfLines={ 1 }
          style={ {
            fontSize: 13,
            fontWeight: '600',
            color: '#F2F2F7',
            marginBottom: 3,
          } }
        >
          { song.title }
        </Text>

        <Text
          numberOfLines={ 1 }
          style={ {
            fontSize: 11,
            color: '#8A8A9A',
          } }
        >
          { song.artist }{ song.album ? ` • ${song.album}` : '' }
        </Text>
      </View>

      <Text style={ { fontSize: 11, color: '#6E6E7A' } }>
        { song.duration }
      </Text>
    </TouchableOpacity>
  );
}

export default function FindScreen() {
  const lastOffset = useRef(0);
  const [hideMini, setHideMini] = useState(false);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;

    const direction = currentOffset - lastOffset.current;

    if (direction > 10) {
      setHideMini(true); // scrolling down → hide
    } else if (direction < -10) {
      setHideMini(false); // scrolling up → show
    }

    lastOffset.current = currentOffset;
  };
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setQueue } = usePlayer();

  const {
    query,
    setQuery,
    results,
    loading,
    loadingMore,
    noResults,
    hasMore,
    total,
    loadMore,
    clear,
  } = useMusicBrainz();

  const BOTTOM_SPACE = 120 + insets.bottom;

  const showBrowse = !query;
  const showResults = !!query && results.length > 0;
  const showLoading = loading && !!query;
  const showNoResults = noResults;

  const handleSongPress = (song: SongWithArt, index: number) => {
    const queue = results.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      duration: s.duration,
      color: s.color,
      bg: s.bg,
      releaseId: s.releaseId,
      album: s.album,
      coverArt: s.coverArt,
    }));

    setQueue(queue, index);
    router.push('/player');
  };

  return (
    <View style={ { flex: 1, backgroundColor: '#0B0B10' } }>

      {/* HEADER */ }
      <View style={ { paddingTop: insets.top, paddingHorizontal: 16 } }>
        <Text
          style={ {
            fontSize: 22,
            fontWeight: '700',
            color: '#FFFFFF',
            marginTop: 10,
            marginBottom: 14,
          } }
        >
          Find music
        </Text>

        {/* SEARCH BAR */ }
        <View
          style={ {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#151521',
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: query ? '#7C5CFF' : 'rgba(255,255,255,0.06)',
          } }
        >
          <Text style={ { color: '#7C5CFF', marginRight: 8 } }>⌕</Text>

          <TextInput
            value={ query }
            onChangeText={ setQuery }
            placeholder="Search songs, artists..."
            placeholderTextColor="#6E6E7A"
            style={ {
              flex: 1,
              fontSize: 13,
              color: '#FFFFFF',
            } }
          />

          { !!query && (
            <TouchableOpacity onPress={ clear }>
              <Text style={ { color: '#8A8A9A', fontSize: 16 } }>✕</Text>
            </TouchableOpacity>
          ) }
        </View>
      </View>

      {/* LOADING */ }
      { showLoading && (
        <View style={ { marginTop: 40 } }>
          <ActivityIndicator color="#7C5CFF" />
        </View>
      ) }

      {/* BROWSE */ }
      { showBrowse && (
        <ScrollView contentContainerStyle={ { paddingBottom: BOTTOM_SPACE } } onScroll={ onScroll }
          scrollEventThrottle={ 16 }>
          <Text style={ {
            color: '#6E6E7A',
            fontSize: 10,
            marginHorizontal: 16,
            marginTop: 18,
            marginBottom: 12,
            letterSpacing: 1.2,
          } }>
            BROWSE MOODS
          </Text>

          <View style={ {
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: 16,
            gap: 10,
          } }>
            { textures.map((t) => (
              <TouchableOpacity
                key={ t.id }
                onPress={ () => setQuery(t.genre.split(' · ')[0]) }
                style={ {
                  width: '48%',
                  backgroundColor: t.bg,
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.06)',
                } }
              >
                <WaveformBars color={ t.color } bg="transparent" count={ 5 } size="md" />

                <Text style={ {
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: '600',
                  marginTop: 10,
                } }>
                  { t.name }
                </Text>

                <Text style={ {
                  color: '#8A8A9A',
                  fontSize: 10,
                  marginTop: 4,
                } }>
                  { t.genre }
                </Text>
              </TouchableOpacity>
            )) }
          </View>
        </ScrollView>
      ) }

      {/* RESULTS */ }
      { showResults && !showLoading && (
        <FlatList
          onScroll={ onScroll }
          scrollEventThrottle={ 16 }
          data={ results }
          keyExtractor={ (item) => item.id }
          showsVerticalScrollIndicator={ false }
          contentContainerStyle={ { paddingBottom: BOTTOM_SPACE } }
          renderItem={ ({ item, index }) => (
            <MBSongCard
              song={ item }
              onPress={ () => handleSongPress(item, index) }
            />
          ) }
          ListHeaderComponent={
            <Text style={ {
              color: '#6E6E7A',
              fontSize: 10,
              marginHorizontal: 16,
              marginTop: 10,
              marginBottom: 10,
            } }>
              { results.length } OF { total } RESULTS
            </Text>
          }
          ListFooterComponent={
            hasMore ? (
              <TouchableOpacity
                onPress={ loadMore }
                style={ {
                  margin: 16,
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: '#151521',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.06)',
                } }
              >
                { loadingMore ? (
                  <ActivityIndicator color="#7C5CFF" />
                ) : (
                  <Text style={ { color: '#7C5CFF', fontWeight: '600' } }>
                    Load more
                  </Text>
                ) }
              </TouchableOpacity>
            ) : null
          }
        />
      ) }

      {/* NO RESULTS */ }
      { showNoResults && (
        <View style={ { marginTop: 40, paddingHorizontal: 16 } }>
          <Text style={ { color: '#8A8A9A' } }>
            No results found
          </Text>
        </View>
      ) }

      <MiniPlayer hidden={ hideMini } />
    </View>
  );
}