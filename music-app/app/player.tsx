import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  GestureResponderEvent,
  LayoutChangeEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import { NextIcon, PrevIcon, QueueIcon, ShuffleIcon } from '../components/icons';
import TabBar from '../components/TabBar';
import WaveformBars from '../components/WaveformBars';
import { C } from '../constants/theme';
import { usePlayer } from '../store/playerStore';
import { useSongRecommendations } from '../hooks/useSongRecommendations';

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
  const { sections: recoSections, loading: recoLoading } = useSongRecommendations(song);

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

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B12' }}>

      {/* ── Header ── */}
      <View style={{ paddingTop: insets.top }} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 18,
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 36, height: 36, justifyContent: 'center' }}
        >
          <Text style={{ color: '#9A9AAF', fontSize: 32, lineHeight: 32 }}>‹</Text>
        </TouchableOpacity>

        <Text style={{ color: '#9A9AAF', fontSize: 11, letterSpacing: 1.2, fontWeight: '600' }}>
          NOW PLAYING
        </Text>

        <TouchableOpacity
          onPress={() => setShowQueue(!showQueue)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: showQueue ? 'rgba(139,128,240,0.18)' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <QueueIcon />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      >
        {/* ── Main card ── */}
        <BlurView
          intensity={25}
          tint="dark"
          style={{
            overflow: 'hidden',
            marginHorizontal: 16,
            borderRadius: 28,
            backgroundColor: '#181827',
            shadowColor: '#000',
            shadowOpacity: 0.35,
            shadowRadius: 25,
            shadowOffset: { width: 0, height: 15 },
            elevation: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
            paddingVertical: 36,
            paddingHorizontal: 28,
            alignItems: 'center',
          }}
        >
          {isLoading ? (
            <View style={{ paddingVertical: 36, alignItems: 'center', gap: 10 }}>
              <ActivityIndicator color={C.purple} />
              <Text style={{ color: '#8A8AA3', fontSize: 11 }}>
                Loading audio…
              </Text>
            </View>
          ) : (
            <WaveformBars
              color={song.color}
              bg="transparent"
              count={18}
              isPlaying={isPlaying}
              size="lg"
            />
          )}

          {/* Title */}
          <View style={{ marginTop: 22, width: '100%' }}>
            <Text
              numberOfLines={1}
              style={{
                color: '#fff',
                fontSize: 26,
                fontWeight: '700',
                textAlign: 'center',
                letterSpacing: -0.5,
              }}
            >
              {song.title || 'No song selected'}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: '#A8A8B8',
                fontSize: 14,
                textAlign: 'center',
                marginTop: 6,
              }}
            >
              {song.artist}
            </Text>
            {song.album ? (
              <Text
                numberOfLines={1}
                style={{
                  color: '#5e5e72',
                  fontSize: 11,
                  textAlign: 'center',
                  marginTop: 3,
                }}
              >
                {song.album}
              </Text>
            ) : null}
          </View>

          {/* Error */}
          {error && (
            <View
              style={{
                backgroundColor: 'rgba(216,90,48,0.12)',
                borderWidth: 0.5,
                borderColor: '#d85a30',
                borderRadius: 12,
                padding: 12,
                width: '100%',
                marginTop: 18,
                gap: 6,
              }}
            >
              <Text style={{ color: '#e08a6c', fontSize: 11, textAlign: 'center' }}>
                ⚠ {error}
              </Text>
              <TouchableOpacity onPress={() => playSong(song)} style={{ alignItems: 'center' }}>
                <Text style={{ color: C.purpleLight, fontSize: 12, fontWeight: '600' }}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Like */}
          <TouchableOpacity
            onPress={() => toggleLike(song)}
            activeOpacity={0.8}
            style={{
              marginTop: 22,
              width: 52,
              height: 52,
              borderRadius: 26,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: liked ? '#7E5BFF' : '#222232',
              shadowColor: liked ? '#7E5BFF' : 'transparent',
              shadowOpacity: liked ? 0.5 : 0,
              shadowRadius: 14,
            }}
          >
            <Text style={{ color: liked ? '#fff' : '#777', fontSize: 22 }}>
              {liked ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </BlurView>

        {/* ── Progress bar ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 18,
            marginTop: 24,
            gap: 10,
          }}
        >
          <Text style={{ color: isSeeking ? '#fff' : '#8A8AA3', fontSize: 11, width: 38 }}>
            {formatTime(isSeeking ? seekProgress * totalDuration : currentTime)}
          </Text>

          <View
            style={{ flex: 1, height: 30, justifyContent: 'center' }}
            onLayout={(e: LayoutChangeEvent) => {
              progressBarWidth.current = e.nativeEvent.layout.width;
            }}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(e) => {
              setIsSeeking(true);
              setSeekProgress(getTouchRatio(e));
            }}
            onResponderMove={(e) => {
              if (!isSeeking) return;
              setSeekProgress(getTouchRatio(e));
            }}
            onResponderRelease={async (e) => {
              const ratio = getTouchRatio(e);
              setSeekProgress(ratio);
              setIsSeeking(false);
              await seekTo(ratio);
            }}
          >
            <View
              style={{
                height: isSeeking ? 10 : 6,
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 10,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <View
                style={{
                  width: `${displayProgress * 100}%`,
                  height: '100%',
                  backgroundColor: isSeeking ? C.purpleLight : C.purple,
                  borderRadius: 10,
                }}
              />
            </View>
          </View>

          <Text style={{ color: '#8A8AA3', fontSize: 11, width: 38, textAlign: 'right' }}>
            {formatTime(totalDuration)}
          </Text>
        </View>

        {/* ── Controls ── */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            paddingHorizontal: 26,
            marginTop: 28,
          }}
        >
          <TouchableOpacity style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <ShuffleIcon />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={prev}
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: '#1F1F2C',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PrevIcon />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlay}
            disabled={isLoading}
            activeOpacity={0.85}
            style={{
              width: 82,
              height: 82,
              borderRadius: 41,
              backgroundColor: isLoading ? '#3a3a52' : '#8B80F0',
              shadowColor: '#8B80F0',
              shadowOpacity: isLoading ? 0 : 0.45,
              shadowRadius: 25,
              shadowOffset: { width: 0, height: 8 },
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : isPlaying ? (
              <View style={{ flexDirection: 'row', gap: 5 }}>
                <View style={{ width: 4, height: 18, backgroundColor: '#fff', borderRadius: 2 }} />
                <View style={{ width: 4, height: 18, backgroundColor: '#fff', borderRadius: 2 }} />
              </View>
            ) : (
              <View
                style={{
                  width: 0,
                  height: 0,
                  borderTopWidth: 10,
                  borderBottomWidth: 10,
                  borderLeftWidth: 16,
                  borderTopColor: 'transparent',
                  borderBottomColor: 'transparent',
                  borderLeftColor: '#fff',
                  marginLeft: 4,
                }}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={next}
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: '#1F1F2C',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <NextIcon />
          </TouchableOpacity>

          <View style={{ width: 40 }} />
        </View>

        {/* ── Queue ── */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 28,
            borderRadius: 24,
            backgroundColor: '#181827',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 16,
              paddingHorizontal: 18,
              borderBottomWidth: upNext.length > 0 ? 1 : 0,
              borderBottomColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <Text
              style={{
                color: '#8A8AA3',
                fontSize: 10,
                letterSpacing: 1.2,
                fontWeight: '700',
              }}
            >
              {showQueue ? `QUEUE · ${upNext.length}` : 'UP NEXT'}
            </Text>
            {upNext.length > 0 && (
              <TouchableOpacity onPress={() => setShowQueue(!showQueue)}>
                <Text style={{ color: C.purpleLight, fontSize: 11, fontWeight: '600' }}>
                  {showQueue ? 'collapse' : `see all ${upNext.length}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {upNext.length === 0 && (
            <View style={{ paddingVertical: 28, alignItems: 'center', gap: 4 }}>
              <Text style={{ color: '#5e5e72', fontSize: 12 }}>No songs in queue</Text>
              <Text style={{ color: '#444458', fontSize: 11 }}>
                Search for music to build your queue
              </Text>
            </View>
          )}

          {!showQueue && nextSong && (
            <TouchableOpacity
              onPress={() => playSong(nextSong)}
              activeOpacity={0.75}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 14,
                paddingHorizontal: 18,
              }}
            >
              <WaveformBars
                color={nextSong.color}
                bg={nextSong.bg}
                count={3}
                size="sm"
                isPlaying={false}
              />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ color: '#e8e8ee', fontSize: 13, fontWeight: '500' }}>
                  {nextSong.title}
                </Text>
                <Text numberOfLines={1} style={{ color: '#777', fontSize: 11, marginTop: 2 }}>
                  {nextSong.artist}
                </Text>
              </View>
              <Text style={{ color: '#5e5e72', fontSize: 10 }}>{nextSong.duration}</Text>
            </TouchableOpacity>
          )}

          {showQueue && upNext.length > 0 && (
            <FlatList
              data={upNext}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => { playSong(item); setShowQueue(false); }}
                  activeOpacity={0.75}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 18,
                    paddingVertical: 11,
                    borderTopWidth: index === 0 ? 0 : 0.5,
                    borderTopColor: 'rgba(255,255,255,0.04)',
                    backgroundColor: index === 0 ? 'rgba(139,128,240,0.08)' : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: index === 0 ? C.purpleLight : '#5e5e72',
                      width: 20,
                      textAlign: 'center',
                    }}
                  >
                    {index + 1}
                  </Text>
                  <WaveformBars color={item.color} bg={item.bg} count={3} size="sm" isPlaying={false} />
                  <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 12,
                        fontWeight: index === 0 ? '600' : '400',
                        color: index === 0 ? '#fff' : '#c8c8d8',
                        marginBottom: 2,
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#777' }}>
                      {item.artist}{item.album ? ` · ${item.album}` : ''}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 10, color: '#5e5e72' }}>{item.duration}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* ── Recommendations ── */}
        {!showQueue && (recoSections.length > 0 || recoLoading) && (
          <View style={{ marginTop: 28 }}>
            {recoLoading && recoSections.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24, gap: 10 }}>
                <ActivityIndicator color={C.purple} size="small" />
                <Text style={{ color: '#5e5e72', fontSize: 11 }}>
                  Finding similar songs...
                </Text>
              </View>
            ) : (
              recoSections.map((section) => (
                <View key={section.id} style={{ marginBottom: 22 }}>
                  <View style={{ paddingHorizontal: 18, marginBottom: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
                      {section.title}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#5e5e72', marginTop: 3 }}>
                      {section.reason}
                    </Text>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 18, gap: 10 }}
                  >
                    {section.songs.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        onPress={() => playSong(s)}
                        activeOpacity={0.8}
                        style={{
                          width: 122,
                          backgroundColor: s.bg,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.06)',
                          padding: 12,
                          gap: 9,
                        }}
                      >
                        <WaveformBars
                          color={s.color}
                          bg="transparent"
                          count={3}
                          isPlaying={false}
                          size="sm"
                        />
                        <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>
                          {s.title}
                        </Text>
                        <Text numberOfLines={1} style={{ fontSize: 9, color: '#777' }}>
                          {s.artist}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <TabBar />
    </View>
  );
}