import { Audio, AVPlaybackStatus } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NextIcon, PrevIcon, QueueIcon, ShuffleIcon } from '../components/icons';
import TabBar from '../components/TabBar';
import WaveformBars from '../components/WaveformBars';
import { C } from '../constants/theme';
import { getStreamUrl } from '../services/stream';
import { usePlayer } from '../store/playerStore';

function formatTime(secs: number): string {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerScreen() {
  const router = useRouter();
  const {
    song,
    queue,
    isPlaying,
    progress,
    setSong,
    setIsPlaying,
    setProgress,
    next,
    prev,
  } = usePlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [loadingStream, setLoadingStream] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const soundRef = useRef<Audio.Sound | null>(null);
  const currentSongIdRef = useRef<string>('');

  // Real queue — songs after current, wrapped around
  const currentIndex = queue.findIndex((s) => s.id === song.id);
  const upNext = currentIndex >= 0
    ? [...queue.slice(currentIndex + 1), ...queue.slice(0, currentIndex)]
    : queue;
  const nextSong = upNext[0] ?? null;

  // ── Playback status callback ──
  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;

      const pos = (status.positionMillis ?? 0) / 1000;
      const dur = (status.durationMillis ?? 0) / 1000;

      setCurrentTime(pos);
      setTotalDuration(dur);
      setProgress(dur > 0 ? pos / dur : 0);

      // Auto advance to next song
      if (status.didJustFinish && nextSong) {
        setSong(nextSong);
      }
    },
    [nextSong]
  );

  // ── Load and play ──
  const loadAndPlay = useCallback(async (songTitle: string, songArtist: string, songId: string) => {
    // Prevent double-loading same song
    if (currentSongIdRef.current === songId) return;
    currentSongIdRef.current = songId;

    try {
      // Stop and unload previous
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => { });
        await soundRef.current.unloadAsync().catch(() => { });
        soundRef.current = null;
      }

      setLoadingStream(true);
      setStreamError(null);
      setCurrentTime(0);
      setTotalDuration(0);
      setProgress(0);

      // Set audio mode for background + silent mode support
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Get stream URL from backend
      const streamUrl = await getStreamUrl(songTitle, songArtist);

      // Guard — song may have changed while we were fetching
      if (currentSongIdRef.current !== songId) return;

      // Create and play sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: streamUrl },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setLoadingStream(false);
      setIsPlaying(true);

    } catch (err: any) {
      if (currentSongIdRef.current !== songId) return;
      console.error('[Player] Error:', err.message);
      setStreamError(err.message || 'Could not load audio');
      setLoadingStream(false);
      setIsPlaying(false);
    }
  }, [onPlaybackStatusUpdate]);

  // ── Trigger load when song changes ──
  useEffect(() => {
    if (song?.id && song?.title) {
      loadAndPlay(song.title, song.artist, song.id);
    }
    return () => {
      soundRef.current?.unloadAsync().catch(() => { });
    };
  }, [song?.id]);

  // ── Toggle play / pause ──
  const handleToggle = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('[Player] Toggle error:', err);
    }
  }, [isPlaying]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => { });
    };
  }, []);

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
        { loadingStream ? (
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

        {/* Error state */ }
        { streamError && (
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
              ⚠ { streamError }
            </Text>
            <TouchableOpacity
              onPress={ () => {
                currentSongIdRef.current = '';
                loadAndPlay(song.title, song.artist, song.id);
              } }
              style={ { alignItems: 'center' } }
            >
              <Text style={ { color: C.purpleLight, fontSize: 12, fontWeight: '500' } }>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) }
      </View>

      {/* ── Progress bar ── */ }
      <View
        style={ {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 18,
          gap: 10,
          marginBottom: 26,
        } }
      >
        <Text style={ { color: C.textMuted, fontSize: 11, width: 36 } }>
          { formatTime(currentTime) }
        </Text>
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
            style={ {
              width: `${progress * 100}%`,
              height: 3,
              backgroundColor: C.purple,
            } }
          />
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
          onPress={ handleToggle }
          disabled={ loadingStream }
          style={ {
            width: 66,
            height: 66,
            borderRadius: 33,
            backgroundColor: loadingStream ? C.purpleDim : C.purple,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: C.purple,
            shadowOpacity: 0.3,
            shadowRadius: 12,
          } }
        >
          { loadingStream ? (
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

        {/* Empty queue */ }
        { upNext.length === 0 && (
          <View style={ { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 } }>
            <Text style={ { color: C.textDim, fontSize: 12 } }>No songs in queue</Text>
            <Text style={ { color: C.textDim, fontSize: 11 } }>
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