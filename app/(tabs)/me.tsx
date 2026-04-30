import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
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

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ paddingTop: insets.top + 16 }}>
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: C.purple,
                },
              ]}
            >
              <Text style={styles.avatarText}>AH</Text>
            </View>
          </View>

          <Text style={[styles.username, { color: C.text }]}>Arjun H</Text>
          <Text style={[styles.memberSince, { color: C.textMuted }]}>
            Member since 2024
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: C.text }]}>214</Text>
              <Text style={[styles.statLabel, { color: C.textMuted }]}>
                Songs liked
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: C.text }]}>3</Text>
              <Text style={[styles.statLabel, { color: C.textMuted }]}>
                Playlists
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: C.text }]}>6</Text>
              <Text style={[styles.statLabel, { color: C.textMuted }]}>
                Requested
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: C.textMuted }]}>
            MY ACTIVITY
          </Text>
          {SONGS.slice(0, 3).map((song) => (
            <TouchableOpacity
              key={song.id}
              style={[
                styles.activityRow,
                {
                  backgroundColor: C.card,
                  borderColor: C.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <WaveformBars color={song.color} bg={song.bg} size="sm" />
              <View style={styles.activityInfo}>
                <Text style={[styles.activityTitle, { color: C.text }]}>
                  {song.title}
                </Text>
                <Text style={[styles.activityArtist, { color: C.textMuted }]}>
                  {song.artist}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={() => router.push('/requests')}
            style={[
              styles.shortcutCard,
              {
                backgroundColor: C.purple,
              },
            ]}
            activeOpacity={0.8}
          >
            <View>
              <Text style={[styles.shortcutTitle, { color: C.text }]}>
                Song Requests
              </Text>
              <Text style={[styles.shortcutSub, { color: C.textSub }]}>
                Track your requests
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: C.text }}>›</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionLabel, { color: C.textMuted, marginTop: 24 }]}>
            SETTINGS
          </Text>

          <View
            style={[
              styles.settingRow,
              {
                backgroundColor: C.card,
                borderColor: C.border,
              },
            ]}
          >
            <Text style={[styles.settingLabel, { color: C.text }]}>
              Notifications
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: C.border, true: C.purple }}
              thumbColor={notificationsEnabled ? C.purpleLight : C.textMuted}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.settingRow,
              {
                backgroundColor: C.card,
                borderColor: C.border,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.settingLabel, { color: C.text }]}>
              Audio quality
            </Text>
            <Text style={[styles.settingValue, { color: C.textMuted }]}>
              High ›
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingRow,
              {
                backgroundColor: C.card,
                borderColor: C.border,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.settingLabel, { color: C.text }]}>About</Text>
            <Text style={[styles.settingValue, { color: C.textMuted }]}>
              v1.0.0 ›
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.miniPlayerWrapper}>
        <MiniPlayer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
  },
  sectionLabel: {
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 12,
    fontWeight: '600',
  },
  activityRow: {
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityArtist: {
    fontSize: 10,
  },
  shortcutCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shortcutTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  shortcutSub: {
    fontSize: 11,
  },
  settingRow: {
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 12,
  },
  miniPlayerWrapper: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
  },
});
