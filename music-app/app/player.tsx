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
import { SafeAreaView } from 'react-native-safe-area-context';
import { NextIcon, PrevIcon, QueueIcon, ShuffleIcon } from '../components/icons';
import TabBar from '../components/TabBar';
import WaveformBars from '../components/WaveformBars';
import { C } from '../constants/theme';
import { usePlayer } from '../store/playerStore';

function formatTime(secs: number): string {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function HeartIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <Text style={ { fontSize: 22, color, lineHeight: 26 } }>
      { filled ? '♥' : '♡' }
    </Text>
  );
}

export default function PlayerScreen() {
  const router = useRouter();
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
  const upNext = currentIndex >= 0
    ? [...queue.slice(currentIndex + 1), ...queue.slice(0, currentIndex)]
    : queue;
  const nextSong = upNext[0] ?? null;

  // ── Progress bar layout measurement ──
  const onProgressLayout = useCallback((e: LayoutChangeEvent) => {
    progressBarWidth.current = e.nativeEvent.layout.width;
  }, []);

  // ── Calculate seek ratio from touch position ──
  const getTouchRatio = useCallback((e: GestureResponderEvent): number => {
    const x = e.nativeEvent.locationX;
    const ratio = Math.min(Math.max(x / progressBarWidth.current, 0), 1);
    return ratio;
  }, []);

  const handleSeekStart = useCallback((e: GestureResponderEvent) => {
    setIsSeeking(true);
    setSeekProgress(getTouchRatio(e));
  }, [getTouchRatio]);

  const handleSeekMove = useCallback((e: GestureResponderEvent) => {
    if (!isSeeking) return;
    setSeekProgress(getTouchRatio(e));
  }, [isSeeking, getTouchRatio]);

  const handleSeekEnd = useCallback(async (e: GestureResponderEvent) => {
    const ratio = getTouchRatio(e);
    setSeekProgress(ratio);
    setIsSeeking(false);
    await seekTo(ratio);
  }, [getTouchRatio, seekTo]);

  const displayProgress = isSeeking ? seekProgress : progress;
  const displayTime = isSeeking
    ? formatTime(seekProgress * totalDuration)
    : formatTime(currentTime);

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
        { isLoading ? (
          <View style={ { height: 100, alignItems: 'center', justifyContent: 'center', gap: 12 } }>
            <ActivityIndicator color={ C.purple } size="large" />
            <Text style={ { color: C.textMuted, fontSize: 12 } }>
              Finding audio stream...
            </Text>
          </View>
        ) : (
          <WaveformBars
            color={ song.color }
            bg="transparent"
            count={ 9 }
            isPlaying={ isPlaying }
            size="lg"
          />
        ) }

        {/* Title row with heart */ }
        <View
          style={ {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 6,
            paddingHorizontal: 4,
          } }
        >
          <View style={ { flex: 1 } }>
            <Text
              numberOfLines={ 1 }
              style={ { color: C.text, fontSize: 20, fontWeight: '600' } }
            >
              { song.title || 'No song selected' }
            </Text>
            <Text
              numberOfLines={ 1 }
              style={ { color: C.textMuted, fontSize: 13, marginTop: 4 } }
            >
              { song.artist }
            </Text>
            { song.album ? (
              <Text
                numberOfLines={ 1 }
                style={ { color: C.textDim, fontSize: 11, marginTop: 2 } }
              >
                { song.album }
              </Text>
            ) : null }
          </View>

          {/* ── Heart button ── */ }
          <TouchableOpacity
            onPress={ () => toggleLike(song) }
            activeOpacity={ 0.7 }
            style={ {
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 8,
              backgroundColor: liked ? C.purpleDim : 'transparent',
              borderRadius: 22,
              borderWidth: liked ? 0 : 0.5,
              borderColor: C.border,
            } }
          >
            <HeartIcon filled={ liked } color={ liked ? C.purple : C.textMuted } />
          </TouchableOpacity>
        </View>

        {/* Error */ }
        { error && (
          <View
            style={ {
              backgroundColor: '#2a1010',
              borderRadius: 10,
              padding: 12,
              width: '100%',
              gap: 6,
            } }
          >
            <Text style={ { color: C.coral, fontSize: 11, textAlign: 'center' } }>
              ⚠ { error }
            </Text>
            <TouchableOpacity
              onPress={ () => playSong(song) }
              style={ { alignItems: 'center' } }
            >
              <Text style={ { color: C.purpleLight, fontSize: 12, fontWeight: '500' } }>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) }
      </View>

      {/* ── Progress bar (tappable + draggable) ── */ }
      <View
        style={ {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 18,
          gap: 10,
          marginBottom: 26,
        } }
      >
        <Text style={ { color: isSeeking ? C.text : C.textMuted, fontSize: 11, width: 36 } }>
          { displayTime }
        </Text>

        {/* Touch area — taller than visual bar for easier tapping */ }
        <View
          style={ { flex: 1, height: 28, justifyContent: 'center' } }
          onLayout={ onProgressLayout }
          onStartShouldSetResponder={ () => true }
          onMoveShouldSetResponder={ () => true }
          onResponderGrant={ handleSeekStart }
          onResponderMove={ handleSeekMove }
          onResponderRelease={ handleSeekEnd }
        >
          {/* Track */ }
          <View
            style={ {
              height: isSeeking ? 5 : 3,
              backgroundColor: C.border,
              borderRadius: 3,
              overflow: 'hidden',
            } }
          >
            <View
              style={ {
                width: `${displayProgress * 100}%`,
                height: '100%',
                backgroundColor: isSeeking ? C.purpleLight : C.purple,
                borderRadius: 3,
              } }
            />
          </View>

          {/* Thumb dot — only visible while seeking */ }
          { isSeeking && (
            <View
              style={ {
                position: 'absolute',
                left: `${displayProgress * 100}%`,
                top: '50%',
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: C.purpleLight,
                marginLeft: -7,
                marginTop: -7,
                shadowColor: C.purple,
                shadowOpacity: 0.6,
                shadowRadius: 4,
              } }
            />
          ) }
        </View>

        <Text style={ { color: C.textMuted, fontSize: 11, width: 36, textAlign: 'right' } }>
          { formatTime(totalDuration) }
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
          onPress={ togglePlay }
          disabled={ isLoading }
          style={ {
            width: 66,
            height: 66,
            borderRadius: 33,
            backgroundColor: isLoading ? C.purpleDim : C.purple,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: C.purple,
            shadowOpacity: 0.3,
            shadowRadius: 12,
          } }
        >
          { isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : isPlaying ? (
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
          <ShuffleIcon />
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
            { showQueue ? `QUEUE · ${upNext.length} SONGS` : 'UP NEXT' }
          </Text>
          { upNext.length > 0 && (
            <TouchableOpacity onPress={ () => setShowQueue(!showQueue) }>
              <Text style={ { color: C.purpleLight, fontSize: 11, fontWeight: '500' } }>
                { showQueue ? 'collapse' : `see all ${upNext.length}` }
              </Text>
            </TouchableOpacity>
          ) }
        </View>

        { upNext.length === 0 && (
          <View style={ { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 } }>
            <Text style={ { color: C.textDim, fontSize: 12 } }>No songs in queue</Text>
            <Text style={ { color: C.textDim, fontSize: 11 } }>
              Search for music to build your queue
            </Text>
          </View>
        ) }

        { !showQueue && nextSong && (
          <TouchableOpacity
            onPress={ () => playSong(nextSong) }
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

        { showQueue && upNext.length > 0 && (
          <FlatList
            data={ upNext }
            keyExtractor={ (item) => item.id }
            showsVerticalScrollIndicator={ false }
            renderItem={ ({ item, index }) => (
              <TouchableOpacity
                onPress={ () => { playSong(item); setShowQueue(false); } }
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
                    { item.artist }{ item.album ? ` · ${item.album}` : '' }
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