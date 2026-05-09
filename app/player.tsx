import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NextIcon, PrevIcon, QueueIcon, ShuffleIcon } from '../components/icons';
import TabBar from '../components/TabBar';
import WaveformBars from '../components/WaveformBars';
import { C } from '../constants/theme';
import { usePlayer } from '../store/playerStore';

export default function PlayerScreen() {
  const router = useRouter();
  const { song, queue, isPlaying, toggle, next, prev, progress, setSong } = usePlayer();
  const [showQueue, setShowQueue] = useState(false);

  // Real queue from store — songs after current, then wrap
  const currentIndex = queue.findIndex((s) => s.id === song.id);
  const upNext = currentIndex >= 0
    ? [...queue.slice(currentIndex + 1), ...queue.slice(0, currentIndex)]
    : queue;

  const nextSong = upNext[0] ?? null;

  return (
    <View style={ { flex: 1, backgroundColor: C.bg } }>
      <SafeAreaView style={ { backgroundColor: C.bg } } />

      {/* ── Header ── */ }
      <View
        style={ {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 18,
          marginBottom: 18,
        } }
      >
        <TouchableOpacity
          onPress={ () => router.back() }
          style={ { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' } }
        >
          <View
            style={ {
              width: 9,
              height: 9,
              borderLeftWidth: 2,
              borderBottomWidth: 2,
              borderColor: C.textMuted,
              transform: [{ rotate: '45deg' }],
            } }
          />
        </TouchableOpacity>

        <Text style={ { color: C.textMuted, fontSize: 12, letterSpacing: 0.5 } }>
          now playing
        </Text>

        <TouchableOpacity
          onPress={ () => setShowQueue(!showQueue) }
          style={ {
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: showQueue ? C.purpleDim : 'transparent',
            borderRadius: 8,
          } }
        >
          <QueueIcon />
        </TouchableOpacity>
      </View>

      {/* ── Main card ── */ }
      <View
        style={ {
          marginHorizontal: 16,
          backgroundColor: C.card,
          borderRadius: 26,
          borderWidth: 0.5,
          borderColor: C.border,
          alignItems: 'center',
          paddingVertical: 34,
          paddingHorizontal: 22,
          marginBottom: 22,
          gap: 14,
        } }
      >
        <WaveformBars
          color={ song.color }
          bg="transparent"
          count={ 9 }
          isPlaying={ isPlaying }
          size="lg"
        />
        <Text
          style={ {
            color: C.text,
            fontSize: 20,
            fontWeight: '600',
            textAlign: 'center',
            marginTop: 6,
          } }
        >
          { song.title || 'No song selected' }
        </Text>
        <Text style={ { color: C.textMuted, fontSize: 13, textAlign: 'center' } }>
          { song.artist }
        </Text>
        { song.album ? (
          <Text style={ { color: C.textDim, fontSize: 11, textAlign: 'center' } }>
            { song.album }
          </Text>
        ) : null }
      </View>

      {/* ── Progress ── */ }
      <View
        style={ {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 18,
          gap: 10,
          marginBottom: 26,
        } }
      >
        <Text style={ { color: C.textMuted, fontSize: 11, width: 36 } }>1:21</Text>
        <View
          style={ {
            flex: 1,
            height: 3,
            backgroundColor: C.border,
            borderRadius: 2,
            overflow: 'hidden',
          } }
        >
          <View
            style={ { width: `${progress * 100}%`, height: 3, backgroundColor: C.purple } }
          />
        </View>
        <Text style={ { color: C.textMuted, fontSize: 11, width: 36, textAlign: 'right' } }>
          { song.duration }
        </Text>
      </View>

      {/* ── Controls ── */ }
      <View
        style={ {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 26,
          marginBottom: 24,
        } }
      >
        <TouchableOpacity
          style={ { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' } }
        >
          <ShuffleIcon />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={ prev }
          style={ { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' } }
        >
          <PrevIcon />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={ toggle }
          style={ {
            width: 66,
            height: 66,
            borderRadius: 33,
            backgroundColor: C.purple,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: C.purple,
            shadowOpacity: 0.3,
            shadowRadius: 12,
          } }
        >
          { isPlaying ? (
            <View style={ { flexDirection: 'row', gap: 5 } }>
              <View style={ { width: 4, height: 18, backgroundColor: '#fff', borderRadius: 2 } } />
              <View style={ { width: 4, height: 18, backgroundColor: '#fff', borderRadius: 2 } } />
            </View>
          ) : (
            <View
              style={ {
                width: 0,
                height: 0,
                borderTopWidth: 10,
                borderBottomWidth: 10,
                borderLeftWidth: 17,
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: '#fff',
                marginLeft: 3,
              } }
            />
          ) }
        </TouchableOpacity>

        <TouchableOpacity
          onPress={ next }
          style={ { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' } }
        >
          <NextIcon />
        </TouchableOpacity>

        <TouchableOpacity
          style={ { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' } }
        >
          <QueueIcon />
        </TouchableOpacity>
      </View>

      {/* ── Up Next / Queue card ── */ }
      <View
        style={ {
          marginHorizontal: 16,
          backgroundColor: C.card,
          borderRadius: 16,
          borderWidth: 0.5,
          borderColor: C.border,
          flex: 1,
          overflow: 'hidden',
          marginBottom: 14,
        } }
      >
        {/* Card header */ }
        <View
          style={ {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 14,
            borderBottomWidth: 0.5,
            borderBottomColor: C.border,
          } }
        >
          <Text style={ { color: C.textMuted, fontSize: 10, letterSpacing: 1.2 } }>
            { showQueue
              ? `QUEUE · ${upNext.length} SONGS`
              : 'UP NEXT' }
          </Text>
          { upNext.length > 0 && (
            <TouchableOpacity onPress={ () => setShowQueue(!showQueue) }>
              <Text style={ { color: C.purpleLight, fontSize: 11, fontWeight: '500' } }>
                { showQueue ? 'collapse' : `see all ${upNext.length}` }
              </Text>
            </TouchableOpacity>
          ) }
        </View>

        {/* Empty queue */ }
        { upNext.length === 0 && (
          <View style={ { flex: 1, alignItems: 'center', justifyContent: 'center' } }>
            <Text style={ { color: C.textDim, fontSize: 12 } }>No songs in queue</Text>
            <Text style={ { color: C.textDim, fontSize: 11, marginTop: 4 } }>
              Search for music to build your queue
            </Text>
          </View>
        ) }

        {/* Collapsed — just next song */ }
        { !showQueue && nextSong && (
          <TouchableOpacity
            onPress={ () => setSong(nextSong) }
            activeOpacity={ 0.75 }
            style={ {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
            } }
          >
            <WaveformBars
              color={ nextSong.color }
              bg={ nextSong.bg }
              count={ 3 }
              isPlaying={ false }
              size="sm"
            />
            <View style={ { flex: 1 } }>
              <Text style={ { color: '#c8c8d8', fontSize: 13, fontWeight: '500' } }>
                { nextSong.title }
              </Text>
              <Text style={ { color: C.textMuted, fontSize: 11, marginTop: 2 } }>
                { nextSong.artist }
              </Text>
            </View>
            <Text style={ { color: C.textDim, fontSize: 11 } }>{ nextSong.duration }</Text>
          </TouchableOpacity>
        ) }

        {/* Expanded — full scrollable queue */ }
        { showQueue && upNext.length > 0 && (
          <FlatList
            data={ upNext }
            keyExtractor={ (item) => item.id }
            showsVerticalScrollIndicator={ false }
            renderItem={ ({ item, index }) => (
              <TouchableOpacity
                onPress={ () => {
                  setSong(item);
                  setShowQueue(false);
                } }
                activeOpacity={ 0.75 }
                style={ {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderBottomWidth: index === upNext.length - 1 ? 0 : 0.5,
                  borderBottomColor: C.border,
                  backgroundColor: index === 0 ? '#16162a' : 'transparent',
                } }
              >
                <Text
                  style={ {
                    fontSize: 11,
                    color: index === 0 ? C.purpleLight : C.textDim,
                    width: 20,
                    textAlign: 'center',
                  } }
                >
                  { index + 1 }
                </Text>

                <WaveformBars
                  color={ item.color }
                  bg={ item.bg }
                  count={ 3 }
                  isPlaying={ false }
                  size="sm"
                />

                <View style={ { flex: 1 } }>
                  <Text
                    numberOfLines={ 1 }
                    style={ {
                      fontSize: 12,
                      fontWeight: index === 0 ? '500' : '400',
                      color: index === 0 ? C.text : '#c8c8d8',
                      marginBottom: 2,
                    } }
                  >
                    { item.title }
                  </Text>
                  <Text style={ { fontSize: 10, color: C.textMuted } }>
                    { item.artist }
                    { item.album ? ` · ${item.album}` : '' }
                  </Text>
                </View>

                <Text style={ { fontSize: 10, color: C.textDim } }>{ item.duration }</Text>
              </TouchableOpacity>
            ) }
          />
        ) }
      </View>

      <TabBar />
    </View>
  );
}