import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

interface Props {
  color: string;
  bg?: string;
  count?: number;
  isPlaying?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function WaveformBars({
  color,
  bg = '#12121e',
  count = 5,
  isPlaying = false,
  size = 'md',
}: Props) {
  const d = {
    sm: { box: 32, bar: 3, gap: 2 },
    md: { box: 44, bar: 4, gap: 2.5 },
    lg: { box: 100, bar: 7, gap: 4 },
  }[size];

  const anims = useRef(
    Array.from({ length: count }, (_, i) =>
      new Animated.Value(0.25 + (i % 3) * 0.2)
    )
  ).current;

  // Glow opacity — pulses when playing
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPlaying) {
      // Stop glow
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }).start();

      // Reset bars to static positions
      anims.forEach((a, i) => {
        Animated.timing(a, {
          toValue: 0.25 + (i % 3) * 0.2,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
      return;
    }

    // Start glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Animate bars
    const loops = anims.map((a) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(a, {
            toValue: 0.1 + Math.random() * 0.9,
            duration: 200 + Math.random() * 400,
            useNativeDriver: false,
          }),
          Animated.timing(a, {
            toValue: 0.1 + Math.random() * 0.9,
            duration: 200 + Math.random() * 400,
            useNativeDriver: false,
          }),
        ])
      );
      loop.start();
      return loop;
    });

    return () => {
      loops.forEach((l) => l.stop());
      glowAnim.stopAnimation();
    };
  }, [isPlaying]);

  // Interpolate glow opacity
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.85],
  });

  const glowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size === 'lg' ? 14 : size === 'md' ? 8 : 5],
  });

  return (
    <View
      style={ {
        width: d.box,
        height: d.box,
        backgroundColor: bg,
        borderRadius: size === 'lg' ? 18 : 10,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingHorizontal: size === 'lg' ? 12 : 6,
        paddingVertical: size === 'lg' ? 12 : 6,
        gap: d.gap,
      } }
    >
      { anims.map((a, i) => (
        <Animated.View
          key={ i }
          style={ {
            width: d.bar,
            borderRadius: d.bar / 2,
            backgroundColor: color,
            height: a.interpolate({
              inputRange: [0, 1],
              outputRange: ['10%', '100%'],
            }),

            // ── Glow on each bar ──
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isPlaying ? glowOpacity : 0,
            shadowRadius: isPlaying ? glowRadius : 0,

            // Android glow per bar
            elevation: isPlaying ? (size === 'lg' ? 8 : 4) : 0,
          } }
        />
      )) }
    </View>
  );
}