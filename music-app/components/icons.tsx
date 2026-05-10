import React from 'react';
import { View } from 'react-native';

export function PlayIcon() {
  return (
    <View
      style={{
        width: 0,
        height: 0,
        borderTopWidth: 10,
        borderBottomWidth: 10,
        borderLeftWidth: 17,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: '#fff',
        marginLeft: 3,
      }}
    />
  );
}

export function PauseIcon() {
  return (
    <View style={{ flexDirection: 'row', gap: 5 }}>
      <View style={{ width: 4, height: 18, backgroundColor: '#fff', borderRadius: 2 }} />
      <View style={{ width: 4, height: 18, backgroundColor: '#fff', borderRadius: 2 }} />
    </View>
  );
}

export function NextIcon() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderTopWidth: 9,
          borderBottomWidth: 9,
          borderLeftWidth: 14,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: '#8b80f0',
        }}
      />
      <View style={{ width: 2.5, height: 18, backgroundColor: '#8b80f0', borderRadius: 1 }} />
    </View>
  );
}

export function PrevIcon() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <View style={{ width: 2.5, height: 18, backgroundColor: '#8b80f0', borderRadius: 1 }} />
      <View
        style={{
          width: 0,
          height: 0,
          borderTopWidth: 9,
          borderBottomWidth: 9,
          borderRightWidth: 14,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: '#8b80f0',
        }}
      />
    </View>
  );
}

export function ShuffleIcon() {
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <View style={{ width: 8, height: 1.5, backgroundColor: '#4a4a60', borderRadius: 1 }} />
          <View
            style={{
              width: 0,
              height: 0,
              borderTopWidth: 4,
              borderBottomWidth: 4,
              borderLeftWidth: 6,
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: '#4a4a60',
            }}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <View style={{ width: 8, height: 1.5, backgroundColor: '#4a4a60', borderRadius: 1 }} />
          <View
            style={{
              width: 0,
              height: 0,
              borderTopWidth: 4,
              borderBottomWidth: 4,
              borderLeftWidth: 6,
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: '#4a4a60',
            }}
          />
        </View>
      </View>
    </View>
  );
}

export function QueueIcon() {
  return (
    <View style={{ width: 22, height: 22, justifyContent: 'center', gap: 4 }}>
      <View style={{ height: 1.5, backgroundColor: '#4a4a60', borderRadius: 1 }} />
      <View style={{ height: 1.5, backgroundColor: '#4a4a60', borderRadius: 1, width: '80%' }} />
      <View style={{ height: 1.5, backgroundColor: '#4a4a60', borderRadius: 1, width: '60%' }} />
    </View>
  );
}