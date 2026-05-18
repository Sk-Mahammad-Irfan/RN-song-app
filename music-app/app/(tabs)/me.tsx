import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MiniPlayer from '../../components/MiniPlayer';
import WaveformBars from '../../components/WaveformBars';
import { C } from '../../constants/theme';
import { useRequests } from '../../hooks/useRequests';
import { usePlayer } from '../../store/playerStore';

export default function MeScreen() {
  const insets = useSafeAreaInsets();
  const { song, queue, likedSongs, recentlyPlayed } = usePlayer();
  const {
    pendingRequests,
    readyRequests,
    requests,
    loading,
    upvote,
    upvotedIds,
    refresh,
  } = useRequests();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'ready'>('pending');

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const displayRequests = activeTab === 'pending' ? pendingRequests : readyRequests;

  return (
    <View style={ { flex: 1, backgroundColor: C.bg } }>
      <FlatList
        data={ displayRequests }
        keyExtractor={ (item) => String(item.id) }
        showsVerticalScrollIndicator={ false }
        refreshControl={
          <RefreshControl
            refreshing={ refreshing }
            onRefresh={ onRefresh }
            tintColor={ C.purple }
          />
        }
        ListHeaderComponent={
          <View style={ { paddingTop: insets.top + 16 } }>

            {/* ── Title ── */ }
            <Text
              style={ {
                fontSize: 19,
                fontWeight: '500',
                color: C.text,
                marginHorizontal: 16,
                marginBottom: 20,
              } }
            >
              Your space
            </Text>

            {/* ── Stats row ── */ }
            <Text
              style={ {
                fontSize: 9,
                letterSpacing: 1.2,
                fontWeight: '600',
                color: C.textMuted,
                marginHorizontal: 16,
                marginBottom: 12,
              } }
            >
              LISTENING STATS
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={ false }
              contentContainerStyle={ { paddingHorizontal: 16, gap: 10, marginBottom: 24 } }
            >
              {/* Songs played */ }
              <View
                style={ {
                  backgroundColor: C.card,
                  borderWidth: 0.5,
                  borderColor: C.border,
                  borderRadius: 16,
                  padding: 16,
                  width: 130,
                  gap: 10,
                } }
              >
                <WaveformBars color={ C.purple } bg={ C.purpleDim } count={ 4 } size="sm" isPlaying={ false } />
                <Text style={ { fontSize: 26, fontWeight: '700', color: C.text } }>
                  { recentlyPlayed.length }
                </Text>
                <Text style={ { fontSize: 11, color: C.textMuted } }>Songs played</Text>
              </View>

              {/* Liked songs */ }
              <View
                style={ {
                  backgroundColor: C.card,
                  borderWidth: 0.5,
                  borderColor: C.border,
                  borderRadius: 16,
                  padding: 16,
                  width: 130,
                  gap: 10,
                } }
              >
                <Text style={ { fontSize: 28, lineHeight: 36 } }>♥</Text>
                <Text style={ { fontSize: 26, fontWeight: '700', color: C.text } }>
                  { likedSongs.length }
                </Text>
                <Text style={ { fontSize: 11, color: C.textMuted } }>Liked songs</Text>
              </View>

              {/* Queue size */ }
              <View
                style={ {
                  backgroundColor: C.card,
                  borderWidth: 0.5,
                  borderColor: C.border,
                  borderRadius: 16,
                  padding: 16,
                  width: 130,
                  gap: 10,
                } }
              >
                <WaveformBars
                  color={ C.teal }
                  bg={ C.tealDim }
                  count={ 4 }
                  size="sm"
                  isPlaying={ false }
                />
                <Text style={ { fontSize: 26, fontWeight: '700', color: C.text } }>
                  { queue.length }
                </Text>
                <Text style={ { fontSize: 11, color: C.textMuted } }>In queue</Text>
              </View>

              {/* Requests made */ }
              <View
                style={ {
                  backgroundColor: C.card,
                  borderWidth: 0.5,
                  borderColor: C.border,
                  borderRadius: 16,
                  padding: 16,
                  width: 130,
                  gap: 10,
                } }
              >
                <WaveformBars
                  color={ C.amber }
                  bg={ C.amberDim }
                  count={ 4 }
                  size="sm"
                  isPlaying={ false }
                />
                <Text style={ { fontSize: 26, fontWeight: '700', color: C.text } }>
                  { requests.length }
                </Text>
                <Text style={ { fontSize: 11, color: C.textMuted } }>Requests</Text>
              </View>
            </ScrollView>

            {/* ── Now playing strip ── */ }
            { song.id ? (
              <View
                style={ {
                  backgroundColor: C.purpleDim,
                  borderWidth: 0.5,
                  borderColor: C.purple,
                  borderRadius: 14,
                  padding: 14,
                  marginHorizontal: 16,
                  marginBottom: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                } }
              >
                <WaveformBars
                  color={ song.color }
                  bg="transparent"
                  count={ 4 }
                  size="sm"
                  isPlaying={ true }
                />
                <View style={ { flex: 1 } }>
                  <Text style={ { fontSize: 10, color: C.purpleLight, letterSpacing: 1, marginBottom: 4 } }>
                    NOW PLAYING
                  </Text>
                  <Text numberOfLines={ 1 } style={ { fontSize: 13, fontWeight: '500', color: C.text } }>
                    { song.title }
                  </Text>
                  <Text style={ { fontSize: 11, color: C.textMuted, marginTop: 2 } }>
                    { song.artist }
                  </Text>
                </View>
              </View>
            ) : null }

            {/* ── Recently played ── */ }
            { recentlyPlayed.length > 0 && (
              <View style={ { marginBottom: 24 } }>
                <Text
                  style={ {
                    fontSize: 9,
                    letterSpacing: 1.2,
                    fontWeight: '600',
                    color: C.textMuted,
                    marginHorizontal: 16,
                    marginBottom: 12,
                  } }
                >
                  RECENTLY PLAYED
                </Text>
                { recentlyPlayed.slice(0, 5).map((s, index) => (
                  <View
                    key={ `${s.id}-${index}` }
                    style={ {
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      gap: 12,
                    } }
                  >
                    <Text style={ { fontSize: 11, color: C.textDim, width: 16 } }>
                      { index + 1 }
                    </Text>
                    <WaveformBars color={ s.color } bg={ s.bg } count={ 3 } size="sm" isPlaying={ false } />
                    <View style={ { flex: 1 } }>
                      <Text numberOfLines={ 1 } style={ { fontSize: 13, fontWeight: '500', color: C.text, marginBottom: 2 } }>
                        { s.title }
                      </Text>
                      <Text style={ { fontSize: 11, color: C.textMuted } }>{ s.artist }</Text>
                    </View>
                  </View>
                )) }
              </View>
            ) }

            {/* ── Song Requests ── */ }
            <Text
              style={ {
                fontSize: 9,
                letterSpacing: 1.2,
                fontWeight: '600',
                color: C.textMuted,
                marginHorizontal: 16,
                marginBottom: 12,
              } }
            >
              SONG REQUESTS
            </Text>

            {/* Tab toggle */ }
            <View
              style={ {
                flexDirection: 'row',
                marginHorizontal: 16,
                marginBottom: 14,
                backgroundColor: C.card,
                borderRadius: 10,
                borderWidth: 0.5,
                borderColor: C.border,
                padding: 3,
                gap: 3,
              } }
            >
              { (['pending', 'ready'] as const).map((tab) => (
                <TouchableOpacity
                  key={ tab }
                  onPress={ () => setActiveTab(tab) }
                  style={ {
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    backgroundColor: activeTab === tab ? C.purple : 'transparent',
                  } }
                >
                  <Text
                    style={ {
                      fontSize: 12,
                      fontWeight: '500',
                      color: activeTab === tab ? '#fff' : C.textMuted,
                    } }
                  >
                    { tab === 'pending' ? `Pending (${pendingRequests.length})` : `Ready (${readyRequests.length})` }
                  </Text>
                </TouchableOpacity>
              )) }
            </View>
          </View>
        }

        renderItem={ ({ item }) => {
          const hasUpvoted = upvotedIds.has(item.id);
          const demandPercent = Math.min((item.count / 100) * 100, 100);

          return (
            <View
              style={ {
                backgroundColor: C.card,
                borderWidth: 0.5,
                borderColor: item.status === 'ready' ? C.teal : C.border,
                borderRadius: 14,
                padding: 14,
                marginHorizontal: 16,
                marginVertical: 5,
                gap: 10,
              } }
            >
              {/* Song info row */ }
              <View style={ { flexDirection: 'row', alignItems: 'center', gap: 12 } }>
                <WaveformBars
                  color={ item.status === 'ready' ? C.teal : C.purple }
                  bg={ item.status === 'ready' ? C.tealDim : C.purpleDim }
                  count={ 3 }
                  size="sm"
                  isPlaying={ false }
                />
                <View style={ { flex: 1 } }>
                  <Text numberOfLines={ 1 } style={ { fontSize: 13, fontWeight: '500', color: C.text, marginBottom: 3 } }>
                    { item.song_name }
                  </Text>
                  <Text style={ { fontSize: 11, color: C.textMuted } }>{ item.artist }</Text>
                </View>

                {/* Status badge */ }
                <View
                  style={ {
                    backgroundColor: item.status === 'ready' ? C.tealDim : C.purpleDim,
                    borderRadius: 20,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  } }
                >
                  <Text
                    style={ {
                      fontSize: 10,
                      fontWeight: '600',
                      color: item.status === 'ready' ? C.teal : C.purpleLight,
                    } }
                  >
                    { item.status === 'ready' ? '✓ Ready' : '⧑ Pending' }
                  </Text>
                </View>
              </View>

              {/* Demand bar */ }
              <View>
                <View style={ { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 } }>
                  <Text style={ { fontSize: 10, color: C.textMuted } }>
                    { item.count } { item.count === 1 ? 'request' : 'requests' }
                  </Text>
                  { item.status === 'pending' && (
                    <Text style={ { fontSize: 10, color: C.textMuted } }>
                      ETA: { item.eta_days } { item.eta_days === 1 ? 'day' : 'days' }
                    </Text>
                  ) }
                </View>
                <View style={ { height: 3, backgroundColor: C.border, borderRadius: 2, overflow: 'hidden' } }>
                  <View
                    style={ {
                      height: '100%',
                      width: `${demandPercent}%`,
                      backgroundColor: item.status === 'ready' ? C.teal : C.purple,
                      borderRadius: 2,
                    } }
                  />
                </View>
              </View>

              {/* Upvote button — only for pending */ }
              { item.status === 'pending' && (
                <TouchableOpacity
                  onPress={ () => upvote(item.id) }
                  disabled={ hasUpvoted }
                  style={ {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: hasUpvoted ? C.purpleDim : 'transparent',
                    borderWidth: 0.5,
                    borderColor: hasUpvoted ? C.purple : C.border,
                  } }
                >
                  <Text style={ { fontSize: 13, color: hasUpvoted ? C.purple : C.textMuted } }>
                    { hasUpvoted ? '♥' : '♡' }
                  </Text>
                  <Text
                    style={ {
                      fontSize: 12,
                      fontWeight: '500',
                      color: hasUpvoted ? C.purpleLight : C.textMuted,
                    } }
                  >
                    { hasUpvoted ? 'Requested' : 'Want this too' }
                  </Text>
                </TouchableOpacity>
              ) }
            </View>
          );
        } }

        ListEmptyComponent={
          loading ? (
            <View style={ { alignItems: 'center', paddingTop: 40, gap: 12 } }>
              <ActivityIndicator color={ C.purple } />
              <Text style={ { color: C.textMuted, fontSize: 12 } }>Loading requests...</Text>
            </View>
          ) : (
            <View style={ { alignItems: 'center', paddingTop: 40, gap: 12, paddingHorizontal: 40 } }>
              <Text style={ { fontSize: 32 } }>🎵</Text>
              <Text style={ { fontSize: 16, fontWeight: '600', color: C.text, textAlign: 'center' } }>
                No { activeTab } requests
              </Text>
              <Text style={ { fontSize: 13, color: C.textMuted, textAlign: 'center', lineHeight: 20 } }>
                { activeTab === 'pending'
                  ? 'When a song can\'t be found, request it from the Find tab.'
                  : 'No songs have been fulfilled yet.' }
              </Text>
            </View>
          )
        }

        ListFooterComponent={ <View style={ { height: 120 } } /> }
      />

      <MiniPlayer />
    </View>
  );
}