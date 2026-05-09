import { useRouter } from 'expo-router';
import React from 'react';
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
import RequestCard from '../../components/RequestCard';
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

// ─────────────────────────────────────────────
// Result card — shows MusicBrainz song data
// ─────────────────────────────────────────────

function MBSongCard({ song, onPress }: { song: SongWithArt; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={ onPress }
      activeOpacity={ 0.75 }
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
      {/* Cover art or waveform bars fallback */ }
      { song.coverArt ? (
        <Image
          source={ { uri: song.coverArt } }
          style={ { width: 44, height: 44, borderRadius: 10 } }
        />
      ) : (
        <WaveformBars color={ song.color } bg={ song.bg } count={ 4 } size="sm" />
      ) }

      <View style={ { flex: 1 } }>
        <Text
          numberOfLines={ 1 }
          style={ { fontSize: 13, fontWeight: '500', color: C.text, marginBottom: 3 } }
        >
          { song.title }
        </Text>
        <Text
          numberOfLines={ 1 }
          style={ { fontSize: 11, color: C.textMuted } }
        >
          { song.artist }
          { song.album ? ` · ${song.album}` : '' }
        </Text>

        {/* Genre tags */ }
        { song.genres.length > 0 && (
          <View style={ { flexDirection: 'row', gap: 4, marginTop: 5, flexWrap: 'wrap' } }>
            { song.genres.slice(0, 2).map((g) => (
              <Text
                key={ g }
                style={ {
                  fontSize: 9,
                  color: song.color,
                  backgroundColor: song.bg,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 6,
                } }
              >
                { g }
              </Text>
            )) }
          </View>
        ) }
      </View>

      {/* Duration */ }
      <Text style={ { fontSize: 11, color: C.textDim } }>{ song.duration }</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────

export default function FindScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setSong } = usePlayer();
  const { query, setQuery, results, loading, noResults, clear } = useMusicBrainz();

  const showBrowse = !query;
  const showResults = !!query && results.length > 0;
  const showNoResults = noResults;
  const showLoading = loading && !!query;
  const { setQueue } = usePlayer();


  const handleSongPress = (song: SongWithArt, index: number) => {
    // Convert all results to Song shape
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

    // Set entire search results as queue, start from tapped song
    setQueue(queue, index);
    router.push('/player');
  };

  return (
    <View style={ { flex: 1, backgroundColor: C.bg } }>

      {/* ── Header ── */ }
      <View style={ { paddingTop: insets.top } }>
        <Text
          style={ {
            fontSize: 19,
            fontWeight: '500',
            color: C.text,
            marginHorizontal: 16,
            marginTop: 16,
            marginBottom: 14,
          } }
        >
          Find music
        </Text>

        {/* Search bar */ }
        <View
          style={ {
            marginHorizontal: 16,
            backgroundColor: C.card,
            borderWidth: 0.5,
            borderColor: query ? C.purple : '#2a2a3a',
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
          } }
        >
          {/* Search icon */ }
          <View
            style={ {
              width: 13,
              height: 13,
              borderRadius: 6.5,
              borderWidth: 1.2,
              borderColor: query ? C.purpleLight : C.textMuted,
            } }
          />
          <TextInput
            placeholder="Song, artist, mood..."
            placeholderTextColor={ C.textMuted }
            value={ query }
            onChangeText={ setQuery }
            autoCorrect={ false }
            autoCapitalize="none"
            style={ { flex: 1, fontSize: 13, color: C.text } }
          />
          {/* Clear button */ }
          { !!query && (
            <TouchableOpacity onPress={ clear }>
              <Text style={ { color: C.textMuted, fontSize: 16, lineHeight: 18 } }>✕</Text>
            </TouchableOpacity>
          ) }
        </View>
      </View>

      {/* ── Loading spinner ── */ }
      { showLoading && (
        <View style={ { alignItems: 'center', paddingTop: 40, gap: 12 } }>
          <ActivityIndicator color={ C.purple } size="small" />
          <Text style={ { color: C.textMuted, fontSize: 12 } }>
            Searching MusicBrainz...
          </Text>
        </View>
      ) }

      {/* ── Browse (empty state) ── */ }
      { showBrowse && (
        <ScrollView
          showsVerticalScrollIndicator={ false }
          contentContainerStyle={ { paddingHorizontal: 16, paddingBottom: 120 } }
        >
          <Text
            style={ {
              fontSize: 9,
              letterSpacing: 1.2,
              fontWeight: '600',
              color: C.textMuted,
              marginBottom: 12,
            } }
          >
            BROWSE BY TEXTURE
          </Text>

          <View
            style={ {
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 10,
              marginBottom: 24,
            } }
          >
            { textures.map((texture) => (
              <TouchableOpacity
                key={ texture.id }
                activeOpacity={ 0.8 }
                onPress={ () => setQuery(texture.genre.split(' · ')[0]) }
                style={ {
                  width: '48%',
                  backgroundColor: texture.bg,
                  borderWidth: 0.5,
                  borderColor: C.border,
                  borderRadius: 14,
                  padding: 14,
                  gap: 8,
                } }
              >
                <WaveformBars color={ texture.color } bg="transparent" count={ 5 } size="md" />
                <Text style={ { fontSize: 13, fontWeight: '500', color: C.text } }>
                  { texture.name }
                </Text>
                <Text style={ { fontSize: 10, color: C.textMuted } }>{ texture.genre }</Text>
              </TouchableOpacity>
            )) }
          </View>

          <Text
            style={ {
              fontSize: 9,
              letterSpacing: 1.2,
              fontWeight: '600',
              color: C.textMuted,
              marginBottom: 12,
            } }
          >
            SEARCH TIPS
          </Text>

          { [
            { tip: 'Try an artist name', example: 'The Weeknd' },
            { tip: 'Search by song title', example: 'Blinding Lights' },
            { tip: 'Search by mood', example: 'ambient lo-fi' },
          ].map((item) => (
            <TouchableOpacity
              key={ item.example }
              onPress={ () => setQuery(item.example) }
              activeOpacity={ 0.8 }
              style={ {
                backgroundColor: C.card,
                borderWidth: 0.5,
                borderColor: C.border,
                borderRadius: 10,
                padding: 12,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              } }
            >
              <View>
                <Text style={ { fontSize: 11, color: C.textMuted, marginBottom: 2 } }>
                  { item.tip }
                </Text>
                <Text style={ { fontSize: 13, color: C.text, fontWeight: '500' } }>
                  "{ item.example }"
                </Text>
              </View>
              <Text style={ { color: C.purple, fontSize: 18 } }>›</Text>
            </TouchableOpacity>
          )) }
        </ScrollView>
      ) }

      {/* ── Results list ── */ }
      { showResults && !showLoading && (
        <FlatList
          data={ results }
          keyExtractor={ (item) => item.id }
          showsVerticalScrollIndicator={ false }
          contentContainerStyle={ { paddingBottom: 120 } }
          renderItem={ ({ item, index }) => (
            <MBSongCard
              song={ item }
              onPress={ () => handleSongPress(item, index) }
            />
          ) }
          ListHeaderComponent={
            <Text
              style={ {
                fontSize: 9,
                letterSpacing: 1.2,
                fontWeight: '600',
                color: C.textMuted,
                marginHorizontal: 16,
                marginBottom: 10,
              } }
            >
              { results.length } RESULTS FOR "{ query.toUpperCase() }"
            </Text>
          }
        />
      ) }

      {/* ── No results → Request card ── */ }
      { showNoResults && !showLoading && (
        <ScrollView
          showsVerticalScrollIndicator={ false }
          contentContainerStyle={ { paddingBottom: 120 } }
        >
          <RequestCard songName={ query } />

          <Text
            style={ {
              fontSize: 9,
              letterSpacing: 1.2,
              fontWeight: '600',
              color: C.textMuted,
              marginHorizontal: 16,
              marginTop: 8,
              marginBottom: 12,
            } }
          >
            WHILE YOU WAIT
          </Text>

          <View style={ { flexDirection: 'row', paddingHorizontal: 16, gap: 10 } }>
            <TouchableOpacity
              activeOpacity={ 0.8 }
              style={ {
                flex: 1,
                backgroundColor: C.card,
                borderWidth: 0.5,
                borderColor: C.border,
                borderRadius: 12,
                padding: 14,
                alignItems: 'center',
                gap: 8,
              } }
            >
              <WaveformBars color={ C.purple } bg={ C.purpleDim } count={ 4 } size="sm" />
              <Text style={ { fontSize: 12, fontWeight: '500', color: C.text } }>Similar vibe</Text>
              <Text style={ { fontSize: 10, color: C.textMuted } }>4 songs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={ 0.8 }
              style={ {
                flex: 1,
                backgroundColor: C.card,
                borderWidth: 0.5,
                borderColor: C.border,
                borderRadius: 12,
                padding: 14,
                alignItems: 'center',
                gap: 8,
              } }
            >
              <WaveformBars color={ C.teal } bg={ C.tealDim } count={ 4 } size="sm" />
              <Text style={ { fontSize: 12, fontWeight: '500', color: C.text } }>Same artist</Text>
              <Text style={ { fontSize: 10, color: C.textMuted } }>6 songs</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) }

      {/* ── Mini Player ── */ }
      <View style={ { position: 'static', bottom: 50, left: 0, right: 0 } }>
        <MiniPlayer />
      </View>
    </View>
  );
}