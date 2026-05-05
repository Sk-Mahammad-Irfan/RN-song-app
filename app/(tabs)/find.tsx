import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
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
  { id: '1', name: 'Deep focus', genre: 'ambient · lo-fi', color: '#5a4be8', bg: '#13102a' },
  { id: '2', name: 'Morning flow', genre: 'acoustic · indie', color: '#1d9e75', bg: '#0e1f1a' },
  { id: '3', name: 'Electric rush', genre: 'alt · electronic', color: '#d85a30', bg: '#1e1010' },
  { id: '4', name: 'Late night', genre: 'jazz · soul', color: '#888780', bg: '#101018' },
];

export default function FindScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filteredSongs = SONGS.filter(
    (song) =>
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.artist.toLowerCase().includes(search.toLowerCase())
  );

  const showBrowse = !search;
  const showResults = !!search && filteredSongs.length > 0;
  const showNoResults = !!search && filteredSongs.length === 0;

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
            borderColor: '#2a2a3a',
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 22,
          } }
        >
          {/* Search icon */ }
          <View
            style={ {
              width: 14,
              height: 14,
              borderRadius: 7,
              borderWidth: 1.2,
              borderColor: C.textMuted,
            } }
          />
          <TextInput
            placeholder="Song, artist, mood..."
            placeholderTextColor={ C.textMuted }
            value={ search }
            onChangeText={ setSearch }
            style={ {
              flex: 1,
              fontSize: 13,
              color: C.text,
            } }
          />
        </View>
      </View>

      {/* ── Browse (empty search) ── */ }
      { showBrowse && (
        <ScrollView
          showsVerticalScrollIndicator={ false }
          contentContainerStyle={ { paddingHorizontal: 16, paddingBottom: 120 } }
        >
          {/* Browse by texture label */ }
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

          {/* 2-col grid */ }
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
                <Text style={ { fontSize: 10, color: C.textMuted } }>
                  { texture.genre }
                </Text>
              </TouchableOpacity>
            )) }
          </View>

          {/* Rising this week label */ }
          <Text
            style={ {
              fontSize: 9,
              letterSpacing: 1.2,
              fontWeight: '600',
              color: C.textMuted,
              marginBottom: 12,
            } }
          >
            RISING THIS WEEK
          </Text>

          {/* Horizontal scroll */ }
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={ false }
            contentContainerStyle={ { gap: 10, paddingRight: 4 } }
          >
            { SONGS.slice(0, 3).map((song) => (
              <TouchableOpacity
                key={ song.id }
                activeOpacity={ 0.8 }
                style={ {
                  backgroundColor: C.card,
                  borderWidth: 0.5,
                  borderColor: C.border,
                  borderRadius: 12,
                  padding: 12,
                  alignItems: 'center',
                  width: 110,
                  gap: 6,
                } }
              >
                <WaveformBars color={ song.color } bg={ song.bg } count={ 4 } size="sm" />
                <Text
                  style={ {
                    fontSize: 11,
                    fontWeight: '500',
                    color: C.text,
                    textAlign: 'center',
                  } }
                  numberOfLines={ 2 }
                >
                  { song.title }
                </Text>
                <Text
                  style={ { fontSize: 9, color: C.textMuted, textAlign: 'center' } }
                  numberOfLines={ 1 }
                >
                  { song.artist }
                </Text>
              </TouchableOpacity>
            )) }
          </ScrollView>
        </ScrollView>
      ) }

      {/* ── Search results ── */ }
      { showResults && (
        <FlatList
          data={ filteredSongs }
          keyExtractor={ (item) => item.id }
          renderItem={ ({ item, index }) => <SongCard song={ item } index={ index } /> }
          contentContainerStyle={ { paddingBottom: 120 } }
          showsVerticalScrollIndicator={ false }
        />
      ) }

      {/* ── No results → Request card ── */ }
      { showNoResults && (
        <ScrollView
          showsVerticalScrollIndicator={ false }
          contentContainerStyle={ { paddingBottom: 120 } }
        >
          <RequestCard songName={ search } />

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

          <View
            style={ {
              flexDirection: 'row',
              paddingHorizontal: 16,
              gap: 10,
            } }
          >
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
              <Text style={ { fontSize: 12, fontWeight: '500', color: C.text } }>
                Similar vibe
              </Text>
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
              <Text style={ { fontSize: 12, fontWeight: '500', color: C.text } }>
                Same artist
              </Text>
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