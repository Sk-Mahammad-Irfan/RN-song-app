import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayer } from '../store/playerStore';
import WaveformBars from './WaveformBars';

export default function MiniPlayer({ hidden }: { hidden?: boolean }) {
  const { song, isPlaying, togglePlay } = usePlayer();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: hidden ? 120 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [hidden]);

  if (!song?.id) return null;

  return (
    <Animated.View
      style={ {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: (insets.bottom || 0) + 92,

        transform: [{ translateY }],

        backgroundColor: '#13131D',
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',

        paddingHorizontal: 14,
        paddingVertical: 12,

        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,

        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },

        elevation: 18,
      } }
    >
      {/* Glow effect */ }
      <View
        style={ {
          position: 'absolute',
          right: -40,
          top: -40,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: song.color,
          opacity: 0.08,
        } }
      />

      {/* Pressable area (opens player) */ }
      <TouchableOpacity
        activeOpacity={ 0.92 }
        onPress={ () => router.push('/player') }
        style={ {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        } }
      >
        {/* Artwork / waveform */ }
        <View
          style={ {
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: song.bg,
            alignItems: 'center',
            justifyContent: 'center',
          } }
        >
          <WaveformBars
            color={ song.color }
            bg="transparent"
            count={ 4 }
            size="sm"
            isPlaying={ isPlaying }
          />
        </View>

        {/* Song text */ }
        <View style={ { flex: 1 } }>
          <Text
            numberOfLines={ 1 }
            style={ {
              color: '#fff',
              fontWeight: '700',
              fontSize: 13,
            } }
          >
            { song.title }
          </Text>

          <Text
            numberOfLines={ 1 }
            style={ {
              color: '#7F8095',
              fontSize: 11,
            } }
          >
            { song.artist }
          </Text>
        </View>
      </TouchableOpacity>

      {/* Play / Pause button */ }
      <TouchableOpacity
        activeOpacity={ 0.85 }
        onPress={ (e) => {
          e.stopPropagation();
          togglePlay();
        } }
        style={ {
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: '#A899FF',
          alignItems: 'center',
          justifyContent: 'center',
        } }
      >
        { isPlaying ? (
          <View style={ { flexDirection: 'row', gap: 3 } }>
            <View style={ { width: 3, height: 14, backgroundColor: '#fff' } } />
            <View style={ { width: 3, height: 14, backgroundColor: '#fff' } } />
          </View>
        ) : (
          <View
            style={ {
              width: 0,
              height: 0,
              borderTopWidth: 6,
              borderBottomWidth: 6,
              borderLeftWidth: 10,
              borderLeftColor: '#fff',
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              marginLeft: 2,
            } }
          />
        ) }
      </TouchableOpacity>
    </Animated.View>
  );
}