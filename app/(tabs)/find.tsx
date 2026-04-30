import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MiniPlayer from '../../components/MiniPlayer';
import RequestCard from '../../components/RequestCard';
import SongCard from '../../components/SongCard';
import WaveformBars from '../../components/WaveformBars';
import { SONGS } from '../../constants/mockData';
import { C } from '../../constants/theme';

const textures = [
  { id: '1', name: 'Deep focus', genre: 'Ambient', color: '#5a4be8', bg: '#13102a' },
  { id: '2', name: 'Morning flow', genre: 'Lo-fi', color: '#1d9e75', bg: '#0e1f1a' },
  { id: '3', name: 'Electric rush', genre: 'Electronic', color: '#d85a30', bg: '#1e1010' },
  { id: '4', name: 'Late night', genre: 'Chillwave', color: '#888780', bg: '#101018' },
];

export default function FindScreen() {
  const [currentSong, setCurrentSong] = useState(SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filteredSongs = SONGS.filter(
    (song) =>
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.artist.toLowerCase().includes(search.toLowerCase())
  );

  const showBrowse = !search;
  const showResults = search && filteredSongs.length > 0;
  const showNoResults = search && filteredSongs.length === 0;

  return (
    <View style={ [styles.container, { backgroundColor: C.bg }] }>
      <View style={ { paddingTop: insets.top } }>
        <Text style={ [styles.title, { color: C.text }] }>Find music</Text>

        <View
          style={ [
            styles.searchInput,
            {
              backgroundColor: C.card,
              borderColor: C.border,
            },
          ] }
        >
          <TextInput
            placeholder="Song, artist, mood..."
            placeholderTextColor={ C.textMuted }
            value={ search }
            onChangeText={ setSearch }
            style={ [styles.searchField, { color: C.text }] }
          />
        </View>
      </View>

      { showBrowse && (
        <ScrollView contentContainerStyle={ styles.browseContent }>
          <Text style={ [styles.sectionLabel, { color: C.textMuted }] }>
            BROWSE BY TEXTURE
          </Text>
          <View style={ styles.gridContainer }>
            { textures.map((texture) => (
              <TouchableOpacity
                key={ texture.id }
                style={ [
                  styles.textureCard,
                  {
                    backgroundColor: C.card,
                    borderColor: C.border,
                  },
                ] }
              >
                <WaveformBars color={ texture.color } bg={ texture.bg } size="md" />
                <Text style={ [styles.textureName, { color: C.text }] }>
                  { texture.name }
                </Text>
                <Text style={ [styles.genreTag, { color: C.purple }] }>
                  { texture.genre }
                </Text>
              </TouchableOpacity>
            )) }
          </View>

          <Text style={ [styles.sectionLabel, { color: C.textMuted, marginTop: 24 }] }>
            RISING THIS WEEK
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={ false }
            contentContainerStyle={ styles.risingContent }
          >
            { SONGS.slice(0, 3).map((song) => (
              <View
                key={ song.id }
                style={ [
                  styles.risingCard,
                  {
                    backgroundColor: C.card,
                    borderColor: C.border,
                  },
                ] }
              >
                <WaveformBars color={ song.color } bg={ song.bg } size="sm" />
                <Text style={ [styles.smallSongTitle, { color: C.text }] }>
                  { song.title }
                </Text>
                <Text style={ [styles.smallArtist, { color: C.textMuted }] }>
                  { song.artist }
                </Text>
              </View>
            )) }
          </ScrollView>

          <View style={ { height: 100 } } />
        </ScrollView>
      ) }

      { showResults && (
        <FlatList
          data={ filteredSongs }
          keyExtractor={ (item) => item.id }
          renderItem={ ({ item, index }) => (
            <SongCard song={ item } index={ index } />
          ) }
          ListFooterComponent={ <View style={ { height: 100 } } /> }
        />
      ) }

      { showNoResults && (
        <ScrollView contentContainerStyle={ styles.noResultsContent }>
          <RequestCard showHeader={ false } />
          <Text style={ [styles.sectionLabel, { color: C.textMuted, marginTop: 24 }] }>
            WHILE YOU WAIT
          </Text>
          <View style={ styles.alternativeCards }>
            <View
              style={ [
                styles.alternativeCard,
                {
                  backgroundColor: C.card,
                  borderColor: C.border,
                },
              ] }
            >
              <WaveformBars color={ C.purple } bg={ C.purpleDim } size="sm" />
              <Text style={ [styles.altTitle, { color: C.text }] }>Similar vibe</Text>
            </View>
            <View
              style={ [
                styles.alternativeCard,
                {
                  backgroundColor: C.card,
                  borderColor: C.border,
                },
              ] }
            >
              <WaveformBars color={ C.teal } bg={ C.tealDim } size="sm" />
              <Text style={ [styles.altTitle, { color: C.text }] }>Same artist</Text>
            </View>
          </View>
          <View style={ { height: 100 } } />
        </ScrollView>
      ) }

      <View style={ styles.miniPlayerWrapper }>
        <MiniPlayer
          song={ currentSong }
          isPlaying={ isPlaying }
          onToggle={ () => setIsPlaying(!isPlaying) }
          onPress={ () => console.log('open player') }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: '500',
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 16,
  },
  searchInput: {
    marginHorizontal: 16,
    borderWidth: 0.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 24,
  },
  searchField: {
    fontSize: 13,
  },
  browseContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  noResultsContent: {
    paddingHorizontal: 0,
    paddingBottom: 100,
  },
  sectionLabel: {
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 12,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  textureCard: {
    width: '48%',
    borderWidth: 0.5,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  textureName: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  genreTag: {
    fontSize: 10,
    marginTop: 4,
  },
  risingContent: {
    paddingRight: 16,
  },
  risingCard: {
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    alignItems: 'center',
    width: 100,
  },
  smallSongTitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  smallArtist: {
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  alternativeCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  alternativeCard: {
    flex: 1,
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  altTitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  miniPlayerWrapper: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
  },
});
