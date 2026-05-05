import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MiniPlayer from '../components/MiniPlayer';
import WaveformBars from '../components/WaveformBars';
import { REQUESTS } from '../constants/mockData';
import { C } from '../constants/theme';

const myRequests = [
  { id: '1', song: 'Blinding Lights', artist: 'The Weeknd', status: 'pending', eta: 2, progress: 65, requestedAt: '2h ago' },
  { id: '2', song: 'Starboy', artist: 'The Weeknd', status: 'ready', eta: 0, progress: 100, requestedAt: '1h ago' },
];

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <FlatList
        data={REQUESTS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top + 16 }}>

            {/* ── Header ── */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                gap: 12,
                marginBottom: 4,
              }}
            >
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={{ fontSize: 28, color: C.text, lineHeight: 32 }}>‹</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 19, fontWeight: '600', color: C.text }}>
                Song Requests
              </Text>
            </View>

            {/* ── My Requests label ── */}
            <Text
              style={{
                fontSize: 9,
                letterSpacing: 1.2,
                fontWeight: '600',
                color: C.textMuted,
                marginHorizontal: 16,
                marginBottom: 10,
              }}
            >
              MY REQUESTS
            </Text>

            {/* ── My Requests card ── */}
            <View
              style={{
                backgroundColor: C.card,
                borderWidth: 0.5,
                borderColor: C.border,
                borderRadius: 14,
                marginHorizontal: 16,
                marginBottom: 24,
                overflow: 'hidden',
              }}
            >
              {myRequests.map((req, idx) => (
                <View
                  key={req.id}
                  style={{
                    padding: 14,
                    borderBottomWidth: idx === myRequests.length - 1 ? 0 : 0.5,
                    borderBottomColor: C.border,
                    gap: 7,
                  }}
                >
                  {/* Song + artist */}
                  <Text style={{ fontSize: 13, fontWeight: '500', color: C.text }}>
                    {req.song}
                  </Text>
                  <Text style={{ fontSize: 11, color: C.textMuted }}>
                    {req.artist}
                  </Text>

                  {/* Badge + time */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View
                      style={{
                        backgroundColor: req.status === 'pending' ? C.purpleDim : C.tealDim,
                        paddingHorizontal: 9,
                        paddingVertical: 3,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '500',
                          color: req.status === 'pending' ? C.purpleLight : C.teal,
                        }}
                      >
                        {req.status === 'pending' ? '⧑ Pending' : '✓ Ready'}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10, color: C.textMuted }}>{req.requestedAt}</Text>
                  </View>

                  {/* Progress bar */}
                  <View style={{ height: 3, backgroundColor: C.border, borderRadius: 2, overflow: 'hidden' }}>
                    <View
                      style={{
                        height: '100%',
                        backgroundColor: req.status === 'ready' ? C.teal : C.purple,
                        width: `${req.progress}%`,
                      }}
                    />
                  </View>

                  {/* ETA */}
                  {req.eta > 0 && (
                    <Text style={{ fontSize: 10, color: C.textMuted }}>
                      ETA: {req.eta} {req.eta === 1 ? 'day' : 'days'}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* ── Community Requests label ── */}
            <Text
              style={{
                fontSize: 9,
                letterSpacing: 1.2,
                fontWeight: '600',
                color: C.textMuted,
                marginHorizontal: 16,
                marginBottom: 10,
              }}
            >
              COMMUNITY REQUESTS
            </Text>
          </View>
        }

        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              backgroundColor: C.card,
              borderWidth: 0.5,
              borderColor: C.border,
              borderRadius: 12,
              padding: 12,
              marginHorizontal: 16,
              marginVertical: 5,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <WaveformBars
              color={item.color || C.purple}
              bg={item.bg || C.purpleDim}
              count={3}
              size="sm"
            />

            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: C.text }}>
                {item.songName}
              </Text>
              <Text style={{ fontSize: 11, color: C.textMuted }}>
                {item.artist}
              </Text>

              {/* Demand bar */}
              <View style={{ height: 3, backgroundColor: C.border, borderRadius: 2, overflow: 'hidden' }}>
                <View
                  style={{
                    height: '100%',
                    backgroundColor: C.purpleLight,
                    width: `${Math.min((item.count / 1000) * 100, 100)}%`,
                  }}
                />
              </View>

              <Text style={{ fontSize: 10, color: C.textSub }}>
                {item.count} requests
              </Text>
            </View>

            {/* Upvote button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: C.purpleDim,
                borderWidth: 0.5,
                borderColor: C.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.purpleLight }}>
                +1
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        ListFooterComponent={<View style={{ height: 120 }} />}
      />

      {/* ── Mini Player ── */}
      <View style={{ position: 'absolute', bottom: 50, left: 0, right: 0 }}>
        <MiniPlayer />
      </View>
    </View>
  );
}