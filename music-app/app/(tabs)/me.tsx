import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MiniPlayer from '../../components/MiniPlayer';
import WaveformBars from '../../components/WaveformBars';
import { SONGS } from '../../constants/mockData';
import { C } from '../../constants/theme';

export default function MeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const settingRow = {
    backgroundColor: C.card,
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top + 16,
          paddingBottom: 120,
        }}
      >

        {/* ── Avatar ── */}
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <View
            style={{
              width: 68,
              height: 68,
              borderRadius: 34,
              backgroundColor: C.purple,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: C.text, fontSize: 22, fontWeight: '600' }}>
              SI
            </Text>
          </View>
        </View>

        {/* ── Name & since ── */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: C.text,
            textAlign: 'center',
            marginBottom: 4,
          }}
        >
          Sk Mahammad Irfan
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: C.textMuted,
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          Member since 2024
        </Text>

        {/* ── Stats row ── */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 28,
          }}
        >
          {[
            { value: '214', label: 'Songs liked' },
            { value: '3', label: 'Playlists' },
            { value: '6', label: 'Requested' },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                alignItems: 'center',
                backgroundColor: C.card,
                borderWidth: 0.5,
                borderColor: C.border,
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 20,
                flex: 1,
                marginHorizontal: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: C.text,
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </Text>
              <Text style={{ fontSize: 10, color: C.textMuted, textAlign: 'center' }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ── My Activity ── */}
        <Text
          style={{
            fontSize: 9,
            letterSpacing: 1.2,
            fontWeight: '600',
            color: C.textMuted,
            marginBottom: 12,
          }}
        >
          MY ACTIVITY
        </Text>

        {SONGS.slice(0, 3).map((song) => (
          <TouchableOpacity
            key={song.id}
            activeOpacity={0.8}
            style={{
              backgroundColor: C.card,
              borderWidth: 0.5,
              borderColor: C.border,
              borderRadius: 12,
              padding: 10,
              marginBottom: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <WaveformBars color={song.color} bg={song.bg} size="sm" />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '500',
                  color: C.text,
                  marginBottom: 3,
                }}
              >
                {song.title}
              </Text>
              <Text style={{ fontSize: 11, color: C.textMuted }}>
                {song.artist}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: C.textDim }}>{song.duration}</Text>
          </TouchableOpacity>
        ))}

        {/* ── Song Requests shortcut ── */}
        <TouchableOpacity
          onPress={() => router.push('/requests')}
          activeOpacity={0.85}
          style={{
            backgroundColor: C.purple,
            borderRadius: 14,
            padding: 16,
            marginTop: 8,
            marginBottom: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: C.text,
                marginBottom: 3,
              }}
            >
              Song Requests
            </Text>
            <Text style={{ fontSize: 11, color: C.textSub }}>
              Track your requests
            </Text>
          </View>
          <Text style={{ fontSize: 20, color: C.text }}>›</Text>
        </TouchableOpacity>

        {/* ── Settings ── */}
        <Text
          style={{
            fontSize: 9,
            letterSpacing: 1.2,
            fontWeight: '600',
            color: C.textMuted,
            marginBottom: 12,
          }}
        >
          SETTINGS
        </Text>

        {/* Notifications toggle */}
        <View style={settingRow}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: C.text }}>
            Notifications
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: C.border, true: C.purple }}
            thumbColor={notificationsEnabled ? C.purpleLight : C.textMuted}
          />
        </View>

        {/* Audio quality */}
        <TouchableOpacity activeOpacity={0.8} style={settingRow}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: C.text }}>
            Audio quality
          </Text>
          <Text style={{ fontSize: 12, color: C.textMuted }}>High ›</Text>
        </TouchableOpacity>

        {/* About */}
        <TouchableOpacity activeOpacity={0.8} style={settingRow}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: C.text }}>
            About
          </Text>
          <Text style={{ fontSize: 12, color: C.textMuted }}>v1.0.0 ›</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Mini Player ── */}
      <View style={{ position: 'static', bottom: 50, left: 0, right: 0 }}>
        <MiniPlayer />
      </View>
    </View>
  );
}