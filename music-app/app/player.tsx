import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  GestureResponderEvent,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NextIcon, PrevIcon, QueueIcon, ShuffleIcon } from '../components/icons';
import TabBar from '../components/TabBar';
import WaveformBars from '../components/WaveformBars';
import { C } from '../constants/theme';
import { usePlayer } from '../store/playerStore';

function formatTime(secs: number) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    song,
    queue,
    isPlaying,
    isLoading,
    error,
    progress,
    currentTime,
    totalDuration,
    togglePlay,
    next,
    prev,
    playSong,
    seekTo,
    toggleLike,
  } = usePlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekProgress, setSeekProgress] = useState(0);

  const progressBarWidth = useRef(0);

  const liked = usePlayer((state) =>
    state.likedSongs.some((s) => s.id === song.id)
  );

  const currentIndex = queue.findIndex((s) => s.id === song.id);

  const upNext =
    currentIndex >= 0
      ? [...queue.slice(currentIndex + 1), ...queue.slice(0, currentIndex)]
      : queue;

  const nextSong = upNext[0] ?? null;

  const displayProgress = isSeeking ? seekProgress : progress;

  const getTouchRatio = useCallback((e: GestureResponderEvent) => {
    const x = e.nativeEvent.locationX;
    return Math.min(Math.max(x / progressBarWidth.current, 0), 1);
  }, []);

  const format = (s: number) => formatTime(s);

  return (
    <View style={ { flex: 1, backgroundColor: '#0B0B12' } }>

      {/* safe top */ }
      <View style={ { paddingTop: insets.top } } />

      {/* HEADER */ }
      <View
        style={ {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 18,
          marginBottom: 10,
        } }
      >
        <TouchableOpacity onPress={ () => router.back() }>
          <Text style={ { color: '#9A9AAF', fontSize: 20 } }>‹</Text>
        </TouchableOpacity>

        <Text style={ { color: '#9A9AAF', fontSize: 11, letterSpacing: 1 } }>
          NOW PLAYING
        </Text>

        <TouchableOpacity onPress={ () => setShowQueue(!showQueue) }>
          <QueueIcon />
        </TouchableOpacity>
      </View>

      {/* MAIN CARD */ }
      <View
        style={ {
          marginHorizontal: 16,
          borderRadius: 28,
          backgroundColor: 'rgba(20,20,32,0.95)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
          paddingVertical: 34,
          paddingHorizontal: 20,
          alignItems: 'center',
        } }
      >
        { isLoading ? (
          <View style={ { paddingVertical: 40 } }>
            <ActivityIndicator color={ C.purple } />
            <Text style={ { color: '#8A8AA3', marginTop: 10, fontSize: 11 } }>
              Loading audio…
            </Text>
          </View>
        ) : (
          <WaveformBars
            color={ song.color }
            bg="transparent"
            count={ 10 }
            isPlaying={ isPlaying }
            size="lg"
          />
        ) }

        {/* TITLE */ }
        <View style={ { marginTop: 18, width: '100%' } }>
          <Text
            numberOfLines={ 1 }
            style={ {
              color: '#fff',
              fontSize: 22,
              fontWeight: '600',
              textAlign: 'center',
            } }
          >
            { song.title }
          </Text>

          <Text
            numberOfLines={ 1 }
            style={ {
              color: '#8A8AA3',
              fontSize: 13,
              textAlign: 'center',
              marginTop: 6,
            } }
          >
            { song.artist }
          </Text>
        </View>

        {/* LIKE */ }
        <TouchableOpacity
          onPress={ () => toggleLike(song) }
          style={ {
            marginTop: 16,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: liked
              ? 'rgba(139,128,240,0.4)'
              : 'rgba(255,255,255,0.06)',
            backgroundColor: liked
              ? 'rgba(139,128,240,0.15)'
              : 'transparent',
          } }
        >
          <Text style={ { color: liked ? C.purple : '#777', fontSize: 16 } }>
            { liked ? '♥' : '♡' }
          </Text>
        </TouchableOpacity>
      </View>

      {/* PROGRESS BAR */ }
      <View
        style={ {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 18,
          marginTop: 24,
          gap: 10,
        } }
      >
        <Text style={ { color: '#8A8AA3', fontSize: 11, width: 42 } }>
          { format(currentTime) }
        </Text>

        <View
          style={ { flex: 1, height: 30, justifyContent: 'center' } }
          onLayout={ (e: LayoutChangeEvent) => {
            progressBarWidth.current = e.nativeEvent.layout.width;
          } }
          onStartShouldSetResponder={ () => true }
          onMoveShouldSetResponder={ () => true }
          onResponderGrant={ (e) => {
            setIsSeeking(true);
            setSeekProgress(getTouchRatio(e));
          } }
          onResponderMove={ (e) => {
            if (!isSeeking) return;
            setSeekProgress(getTouchRatio(e));
          } }
          onResponderRelease={ async (e) => {
            const ratio = getTouchRatio(e);
            setSeekProgress(ratio);
            setIsSeeking(false);
            await seekTo(ratio);
          } }
        >
          <View
            style={ {
              height: isSeeking ? 5 : 3,
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 3,
              overflow: 'hidden',
            } }
          >
            <View
              style={ {
                width: `${displayProgress * 100}%`,
                height: '100%',
                backgroundColor: isSeeking ? C.purpleLight : C.purple,
              } }
            />
          </View>
        </View>

        <Text
          style={ {
            color: '#8A8AA3',
            fontSize: 11,
            width: 42,
            textAlign: 'right',
          } }
        >
          { format(totalDuration) }
        </Text>
      </View>

      {/* CONTROLS */ }
      <View
        style={ {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 26,
          marginTop: 28,
        } }
      >
        <TouchableOpacity><ShuffleIcon /></TouchableOpacity>
        <TouchableOpacity onPress={ prev }><PrevIcon /></TouchableOpacity>

        <TouchableOpacity
          onPress={ togglePlay }
          style={ {
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: C.purple,
            alignItems: 'center',
            justifyContent: 'center',
          } }
        >
          { isPlaying ? (
            <View style={ { flexDirection: 'row', gap: 4 } }>
              <View style={ { width: 4, height: 18, backgroundColor: '#fff' } } />
              <View style={ { width: 4, height: 18, backgroundColor: '#fff' } } />
            </View>
          ) : (
            <Text style={ { color: '#fff', fontSize: 18 } }>▶</Text>
          ) }
        </TouchableOpacity>

        <TouchableOpacity onPress={ next }><NextIcon /></TouchableOpacity>
        <View style={ { width: 30 } } />
      </View>

      {/* QUEUE */ }
      <View
        style={ {
          marginHorizontal: 16,
          marginTop: 24,
          flex: 1,
          borderRadius: 20,
          backgroundColor: '#141420',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        } }
      >
        <Text
          style={ {
            color: '#8A8AA3',
            fontSize: 10,
            letterSpacing: 1.2,
            padding: 14,
          } }
        >
          UP NEXT
        </Text>

        { nextSong && (
          <TouchableOpacity
            onPress={ () => playSong(nextSong) }
            style={ {
              flexDirection: 'row',
              alignItems: 'center',
              padding: 14,
              gap: 12,
            } }
          >
            <WaveformBars
              color={ nextSong.color }
              bg={ nextSong.bg }
              count={ 3 }
              size="sm"
              isPlaying={ false }
            />

            <View style={ { flex: 1 } }>
              <Text style={ { color: '#fff', fontSize: 13 } }>
                { nextSong.title }
              </Text>
              <Text style={ { color: '#777', fontSize: 11 } }>
                { nextSong.artist }
              </Text>
            </View>
          </TouchableOpacity>
        ) }
      </View>

      {/* bottom spacing for tab bar */ }
      <View style={ { height: insets.bottom + 80 } } />

      <TabBar />
    </View>
  );
}