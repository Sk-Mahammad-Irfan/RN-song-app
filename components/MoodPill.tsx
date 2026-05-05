import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { C } from '../constants/theme';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export default function MoodPill({ label, active = false, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        borderWidth: 0.5,
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 50,
        backgroundColor: active ? C.purple : '#1e1e28',
        borderColor: active ? C.purple : '#2e2e38',
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '500',
          color: active ? '#ccc8f8' : '#6a6a7c',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}