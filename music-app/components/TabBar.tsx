import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { C } from '../constants/theme';

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { key: 'index', label: 'home', route: '/' },
    { key: 'find', label: 'find', route: '/find' },
    { key: 'waves', label: 'waves', route: '/waves' },
    { key: 'me', label: 'me', route: '/me' },
  ] as const;

  return (
    <View
      style={{
        backgroundColor: '#0f0f18',
        borderTopWidth: 0.5,
        borderTopColor: C.border,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 10,
        paddingBottom: 24,
      }}
    >
      {tabs.map((tab) => {
        const isActive =
          tab.route === '/'
            ? pathname === '/' || pathname === '/index'
            : pathname.startsWith(tab.route);

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => router.push(tab.route)}
            activeOpacity={0.75}
            style={{ alignItems: 'center', gap: 4, minWidth: 60 }}
          >
            <TabIcon name={tab.key} active={isActive} />
            {isActive && (
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: C.purple,
                  marginTop: 1,
                }}
              />
            )}
            <Text
              style={{
                fontSize: 10,
                color: isActive ? C.purpleLight : C.textMuted,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? '#8b80f0' : '#3a3a4e';
  const size = 20;
  const box = {
    width: size,
    height: size,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  if (name === 'index') {
    return (
      <View style={box}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: active ? color : 'transparent',
              borderWidth: active ? 0 : 1,
              borderColor: color,
            }}
          />
        </View>
      </View>
    );
  }

  if (name === 'find') {
    return (
      <View style={box}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={{ width: 8, height: 1.5, backgroundColor: color }} />
          <View
            style={{
              width: 1.5,
              height: 8,
              backgroundColor: color,
              position: 'absolute',
            }}
          />
        </View>
      </View>
    );
  }

  if (name === 'waves') {
    return (
      <View style={{ flexDirection: 'row', gap: 3, alignItems: 'flex-end', height: size }}>
        <View
          style={{
            width: 7,
            height: 14,
            borderRadius: 2,
            backgroundColor: active ? color : 'transparent',
            borderWidth: 1.5,
            borderColor: color,
          }}
        />
        <View
          style={{
            width: 7,
            height: 10,
            borderRadius: 2,
            backgroundColor: active ? color : 'transparent',
            borderWidth: 1.5,
            borderColor: color,
          }}
        />
      </View>
    );
  }

  if (name === 'me') {
    return (
      <View style={box}>
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            borderWidth: 1.5,
            borderColor: color,
            marginBottom: 2,
          }}
        />
        <View
          style={{
            width: 14,
            height: 7,
            borderTopLeftRadius: 7,
            borderTopRightRadius: 7,
            borderWidth: 1.5,
            borderBottomWidth: 0,
            borderColor: color,
          }}
        />
      </View>
    );
  }

  return null;
}