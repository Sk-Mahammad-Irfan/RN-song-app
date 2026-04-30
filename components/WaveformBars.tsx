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
    Array.from({ length: count }, (_, i) => new Animated.Value(0.25 + (i % 3) * 0.2))
  ).current;

  useEffect(() => {
    if (!isPlaying) {
      anims.forEach((a, i) => {
        Animated.timing(a, {
          toValue: 0.25 + (i % 3) * 0.2,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
      return;
    }

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

    return () => loops.forEach((l) => l.stop());
  }, [isPlaying]);

  return (
    <View
      style={{
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
      }}
    >
      {anims.map((a, i) => (
        <Animated.View
          key={i}
          style={{
            width: d.bar,
            borderRadius: d.bar / 2,
            backgroundColor: color,
            height: a.interpolate({
              inputRange: [0, 1],
              outputRange: ['10%', '100%'],
            }),
          }}
        />
      ))}
    </View>
  );
}