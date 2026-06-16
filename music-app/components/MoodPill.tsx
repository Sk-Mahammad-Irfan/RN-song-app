import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export default function MoodPill({
  label,
  active = false,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        overflow: 'hidden',

        borderRadius: 999,

        backgroundColor: active
          ? 'rgba(168,153,255,0.15)'
          : 'rgba(255,255,255,0.03)',

        borderWidth: 1,

        borderColor: active
          ? 'rgba(168,153,255,0.35)'
          : 'rgba(255,255,255,0.06)',

        paddingHorizontal: 18,
        paddingVertical: 10,

        shadowColor: active ? '#A899FF' : '#000',

        shadowOpacity: active ? 0.35 : 0.15,

        shadowRadius: active ? 12 : 8,

        shadowOffset: {
          width: 0,
          height: 4,
        },

        elevation: active ? 8 : 2,
      }}
    >
      {/* Glow */}
      {active && (
        <View
          style={{
            position: 'absolute',

            top: -10,
            right: -10,

            width: 40,
            height: 40,

            borderRadius: 20,

            backgroundColor: '#A899FF',

            opacity: 0.12,
          }}
        />
      )}

      <Text
        style={{
          color: active ? '#F5F3FF' : '#8A8AA0',

          fontSize: 13,

          fontWeight: active ? '700' : '600',

          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}