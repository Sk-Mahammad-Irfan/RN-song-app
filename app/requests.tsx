import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MiniPlayer from '../components/MiniPlayer';
import WaveformBars from '../components/WaveformBars';
import { REQUESTS } from '../constants/mockData';
import { C } from '../constants/theme';

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Mock user requests
  const myRequests = [
    {
      id: '1',
      song: 'Blinding Lights',
      artist: 'The Weeknd',
      status: 'pending',
      eta: 2,
      progress: 65,
      requestedAt: '2h ago',
    },
    {
      id: '2',
      song: 'Starboy',
      artist: 'The Weeknd',
      status: 'ready',
      eta: 0,
      progress: 100,
      requestedAt: '1h ago',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <FlatList
        data={REQUESTS}
        keyExtractor={(item) => item.id}
        scrollEnabled
        ListHeaderComponent={
          <View>
            <View style={{ paddingTop: insets.top + 16 }}>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={[styles.backArrow, { color: C.text }]}>‹</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: C.text }]}>
                  Song Requests
                </Text>
              </View>
            </View>

            <View style={[styles.section]}>
              <Text style={[styles.sectionLabel, { color: C.textMuted }]}>
                MY REQUESTS
              </Text>
              <View
                style={[
                  styles.myRequestsCard,
                  {
                    backgroundColor: C.card,
                    borderColor: C.border,
                  },
                ]}
              >
                {myRequests.map((req, idx) => (
                  <View
                    key={req.id}
                    style={[
                      styles.myRequestRow,
                      {
                        borderBottomColor: C.border,
                        borderBottomWidth: idx === myRequests.length - 1 ? 0 : 0.5,
                      },
                    ]}
                  >
                    <View style={styles.myRequestInfo}>
                      <Text style={[styles.myRequestTitle, { color: C.text }]}>
                        {req.song}
                      </Text>
                      <Text style={[styles.myRequestArtist, { color: C.textMuted }]}>
                        {req.artist}
                      </Text>
                      <View style={styles.myRequestMeta}>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor:
                                req.status === 'pending'
                                  ? C.purpleDim
                                  : C.tealDim,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              {
                                color:
                                  req.status === 'pending'
                                    ? C.purpleLight
                                    : C.teal,
                              },
                            ]}
                          >
                            {req.status === 'pending'
                              ? '⧑ Pending'
                              : '✓ Ready'}
                          </Text>
                        </View>
                        <Text style={[styles.requestTime, { color: C.textMuted }]}>
                          {req.requestedAt}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            backgroundColor: C.border,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.progressFill,
                            {
                              backgroundColor: C.purple,
                              width: `${req.progress}%`,
                            },
                          ]}
                        />
                      </View>
                      {req.eta > 0 && (
                        <Text style={[styles.eta, { color: C.textMuted }]}>
                          ETA: {req.eta} {req.eta === 1 ? 'day' : 'days'}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: C.textMuted }]}>
              COMMUNITY REQUESTS
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.communityRow,
              {
                backgroundColor: C.card,
                borderColor: C.border,
              },
            ]}
            activeOpacity={0.8}
          >
            <WaveformBars color={item.color || C.purple} bg={item.bg || C.purpleDim} size="sm" />
            <View style={styles.communityInfo}>
              <Text style={[styles.communityTitle, { color: C.text }]}>
                {item.songName}
              </Text>
              <Text style={[styles.communityArtist, { color: C.textMuted }]}>
                {item.artist}
              </Text>
              <View
                style={[
                  styles.demandBar,
                  {
                    backgroundColor: C.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.demandFill,
                    {
                      backgroundColor: C.purpleLight,
                      width: `${(item.count / 1000) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.demandCount, { color: C.textSub }]}>
                {item.count} requests
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.upvoteButton,
                {
                  backgroundColor: C.card,
                  borderColor: C.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.upvoteText, { color: C.purpleLight }]}>
                +1
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backArrow: {
    fontSize: 28,
  },
  title: {
    fontSize: 19,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 12,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  myRequestsCard: {
    borderWidth: 0.5,
    borderRadius: 14,
    overflow: 'hidden',
  },
  myRequestRow: {
    padding: 12,
  },
  myRequestInfo: {
    gap: 6,
  },
  myRequestTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  myRequestArtist: {
    fontSize: 11,
  },
  myRequestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  requestTime: {
    fontSize: 10,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  eta: {
    fontSize: 10,
    marginTop: 4,
  },
  communityRow: {
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  communityInfo: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  communityArtist: {
    fontSize: 11,
    marginBottom: 6,
  },
  demandBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  demandFill: {
    height: '100%',
  },
  demandCount: {
    fontSize: 10,
  },
  upvoteButton: {
    borderWidth: 0.5,
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upvoteText: {
    fontSize: 12,
    fontWeight: '600',
  },
  miniPlayerWrapper: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
  },
});
