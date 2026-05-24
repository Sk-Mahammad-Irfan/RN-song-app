import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MiniPlayer from '../../components/MiniPlayer';
import WaveformBars from '../../components/WaveformBars';
import { C } from '../../constants/theme';
import { useRequests } from '../../hooks/useRequests';
import { usePlayer } from '../../store/playerStore';
import { searchSongs } from '../../services/musicBrainz';

type SearchState =
  | 'idle'
  | 'searching'
  | 'found'
  | 'not_found'
  | 'requesting'
  | 'requested';

export default function MeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setQueue } = usePlayer();
  const {
    pendingRequests,
    readyRequests,
    loading,
    upvote,
    upvotedIds,
    refresh,
    request,
    hasRequested,
  } = useRequests();

  const [activeTab, setActiveTab] = useState<'pending' | 'ready'>('pending');

  // ── Form state ──
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [foundSong, setFoundSong] = useState<any>(null);
  const [formError, setFormError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const displayRequests =
    activeTab === 'pending' ? pendingRequests : readyRequests;

  const resetForm = () => {
    setSongName('');
    setArtistName('');
    setSearchState('idle');
    setFoundSong(null);
    setFormError('');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!songName.trim()) {
      setFormError('Please enter a song name');
      return;
    }
    if (!artistName.trim()) {
      setFormError('Please enter an artist name');
      return;
    }

    Keyboard.dismiss();
    setFormError('');
    setSearchState('searching');
    setFoundSong(null);

    try {
      const { songs } = await searchSongs(
        `${songName.trim()} ${artistName.trim()}`,
        5,
        0
      );

      const match =
        songs.find(
          (s) =>
            s.title.toLowerCase().includes(songName.trim().toLowerCase()) &&
            s.artist.toLowerCase().includes(artistName.trim().toLowerCase())
        ) ?? songs[0];

      if (match) {
        setFoundSong(match);
        setSearchState('found');
      } else {
        setSearchState('not_found');
      }
    } catch {
      setSearchState('not_found');
    }
  };

  const handlePlayFound = () => {
    if (!foundSong) return;
    setQueue(
      [{
        id: foundSong.id,
        title: foundSong.title,
        artist: foundSong.artist,
        duration: foundSong.duration,
        color: '#5a4be8',
        bg: '#13102a',
        album: foundSong.album,
      }],
      0
    );
    router.push('/player');
  };

  const handleRequest = async () => {
    // Check device-level block first
    if (hasRequested(songName, artistName)) {
      setSearchState('requested');
      return;
    }

    setSearchState('requesting');
    const result = await request(songName.trim(), artistName.trim());

    if (result?.alreadyRequested) {
      setSearchState('requested');
    } else {
      setSearchState('requested');
    }
  };

  return (
    <View style={ { flex: 1, backgroundColor: C.bg } }>
      <FlatList
        data={ displayRequests }
        keyExtractor={ (item) => String(item.id) }
        showsVerticalScrollIndicator={ false }
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={ refreshing }
            onRefresh={ onRefresh }
            tintColor={ C.purple }
            colors={ [C.purple] }
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
                marginBottom: 6,
              } }
            >
              Song Requests
            </Text>
            <Text
              style={ {
                fontSize: 12,
                color: C.textMuted,
                marginHorizontal: 16,
                marginBottom: 24,
              } }
            >
              Search a song — play it if found, request it if not.
            </Text>

            {/* ── Request form ── */ }
            <View
              style={ {
                backgroundColor: C.card,
                borderWidth: 0.5,
                borderColor: C.border,
                borderRadius: 16,
                padding: 16,
                marginHorizontal: 16,
                marginBottom: 24,
                gap: 12,
              } }
            >

              {/* Song name input */ }
              <View>
                <Text style={ { fontSize: 11, color: C.textMuted, marginBottom: 6 } }>
                  Song name
                </Text>
                <View
                  style={ {
                    backgroundColor: C.surface,
                    borderWidth: 0.5,
                    borderColor: songName ? C.purple : C.border,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 11,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  } }
                >
                  <Text style={ { fontSize: 14, color: C.textMuted } }>♪</Text>
                  <TextInput
                    placeholder="e.g. Blinding Lights"
                    placeholderTextColor={ C.textDim }
                    value={ songName }
                    onChangeText={ (t) => {
                      setSongName(t);
                      setSearchState('idle');
                      setFoundSong(null);
                      setFormError('');
                    } }
                    style={ { flex: 1, fontSize: 13, color: C.text } }
                    returnKeyType="next"
                  />
                  { !!songName && (
                    <TouchableOpacity onPress={ () => setSongName('') }>
                      <Text style={ { color: C.textMuted, fontSize: 14 } }>✕</Text>
                    </TouchableOpacity>
                  ) }
                </View>
              </View>

              {/* Artist name input */ }
              <View>
                <Text style={ { fontSize: 11, color: C.textMuted, marginBottom: 6 } }>
                  Artist name
                </Text>
                <View
                  style={ {
                    backgroundColor: C.surface,
                    borderWidth: 0.5,
                    borderColor: artistName ? C.purple : C.border,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 11,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  } }
                >
                  <Text style={ { fontSize: 14, color: C.textMuted } }>👤</Text>
                  <TextInput
                    placeholder="e.g. The Weeknd"
                    placeholderTextColor={ C.textDim }
                    value={ artistName }
                    onChangeText={ (t) => {
                      setArtistName(t);
                      setSearchState('idle');
                      setFoundSong(null);
                      setFormError('');
                    } }
                    style={ { flex: 1, fontSize: 13, color: C.text } }
                    returnKeyType="search"
                    onSubmitEditing={ handleSearch }
                  />
                  { !!artistName && (
                    <TouchableOpacity onPress={ () => setArtistName('') }>
                      <Text style={ { color: C.textMuted, fontSize: 14 } }>✕</Text>
                    </TouchableOpacity>
                  ) }
                </View>
              </View>

              {/* Form error */ }
              { !!formError && (
                <Text style={ { fontSize: 12, color: C.coral } }>
                  { formError }
                </Text>
              ) }

              {/* ── Search button ── */ }
              { (searchState === 'idle' || searchState === 'searching') && (
                <TouchableOpacity
                  onPress={ handleSearch }
                  disabled={ searchState === 'searching' }
                  style={ {
                    backgroundColor: C.purple,
                    borderRadius: 10,
                    paddingVertical: 13,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8,
                  } }
                >
                  { searchState === 'searching' ? (
                    <>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={ { color: '#fff', fontSize: 13, fontWeight: '600' } }>
                        Searching...
                      </Text>
                    </>
                  ) : (
                    <Text style={ { color: '#fff', fontSize: 13, fontWeight: '600' } }>
                      Search
                    </Text>
                  ) }
                </TouchableOpacity>
              ) }

              {/* ── Found ── */ }
              { searchState === 'found' && foundSong && (
                <View style={ { gap: 10 } }>
                  <View
                    style={ {
                      backgroundColor: C.tealDim,
                      borderWidth: 0.5,
                      borderColor: C.teal,
                      borderRadius: 12,
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    } }
                  >
                    <WaveformBars
                      color={ C.teal }
                      bg="transparent"
                      count={ 3 }
                      size="sm"
                      isPlaying={ false }
                    />
                    <View style={ { flex: 1 } }>
                      <Text style={ { fontSize: 10, color: C.teal, letterSpacing: 1, marginBottom: 4 } }>
                        ✓ FOUND IN WAVEFORM
                      </Text>
                      <Text numberOfLines={ 1 } style={ { fontSize: 13, fontWeight: '500', color: C.text } }>
                        { foundSong.title }
                      </Text>
                      <Text style={ { fontSize: 11, color: C.textMuted, marginTop: 2 } }>
                        { foundSong.artist }
                        { foundSong.album ? ` · ${foundSong.album}` : '' }
                      </Text>
                    </View>
                    <Text style={ { fontSize: 11, color: C.textDim } }>
                      { foundSong.duration }
                    </Text>
                  </View>

                  {/* Play button */ }
                  <TouchableOpacity
                    onPress={ handlePlayFound }
                    style={ {
                      backgroundColor: C.teal,
                      borderRadius: 10,
                      paddingVertical: 13,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                    } }
                  >
                    <View
                      style={ {
                        width: 0, height: 0,
                        borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 8,
                        borderTopColor: 'transparent', borderBottomColor: 'transparent',
                        borderLeftColor: '#fff',
                      } }
                    />
                    <Text style={ { color: '#fff', fontSize: 13, fontWeight: '600' } }>
                      Play now
                    </Text>
                  </TouchableOpacity>

                  {/* Wrong result option */ }
                  <TouchableOpacity
                    onPress={ () => setSearchState('not_found') }
                    style={ {
                      alignItems: 'center',
                      paddingVertical: 8,
                      borderRadius: 10,
                      borderWidth: 0.5,
                      borderColor: C.border,
                    } }
                  >
                    <Text style={ { fontSize: 12, color: C.textMuted } }>
                      Wrong result? Request instead
                    </Text>
                  </TouchableOpacity>
                </View>
              ) }

              {/* ── Not found ── */ }
              { searchState === 'not_found' && (
                <View style={ { gap: 10 } }>
                  <View
                    style={ {
                      backgroundColor: '#1a1020',
                      borderWidth: 0.5,
                      borderColor: '#2a2040',
                      borderRadius: 12,
                      padding: 14,
                      gap: 10,
                    } }
                  >
                    <Text style={ { fontSize: 13, fontWeight: '500', color: C.text } }>
                      "{ songName }" — { artistName }
                    </Text>
                    <Text style={ { fontSize: 12, color: C.textMuted } }>
                      Not found in Waveform. Request it and we'll add it within 2–3 days.
                    </Text>
                    <View style={ { flexDirection: 'row', alignItems: 'center', gap: 10 } }>
                      <View style={ { width: 2.5, height: 32, backgroundColor: C.purple, borderRadius: 2 } } />
                      <View>
                        <Text style={ { fontSize: 10, color: C.purpleLight } }>Expected availability</Text>
                        <Text style={ { fontSize: 15, fontWeight: '600', color: C.text } }>2–3 days</Text>
                      </View>
                    </View>
                  </View>

                  {/* ── Blocked or available ── */ }
                  { hasRequested(songName, artistName) ? (
                    <View
                      style={ {
                        backgroundColor: C.purpleDim,
                        borderWidth: 0.5,
                        borderColor: C.purple,
                        borderRadius: 10,
                        paddingVertical: 13,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 6,
                      } }
                    >
                      <Text style={ { fontSize: 13, color: C.purpleLight } }>✓</Text>
                      <Text style={ { fontSize: 13, fontWeight: '500', color: C.purpleLight } }>
                        Already requested from this device
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={ handleRequest }
                      style={ {
                        backgroundColor: C.purple,
                        borderRadius: 10,
                        paddingVertical: 13,
                        alignItems: 'center',
                      } }
                    >
                      <Text style={ { color: '#fff', fontSize: 13, fontWeight: '600' } }>
                        Request this song
                      </Text>
                    </TouchableOpacity>
                  ) }

                  <TouchableOpacity
                    onPress={ resetForm }
                    style={ {
                      alignItems: 'center',
                      paddingVertical: 8,
                      borderRadius: 10,
                      borderWidth: 0.5,
                      borderColor: C.border,
                    } }
                  >
                    <Text style={ { fontSize: 12, color: C.textMuted } }>Try a different song</Text>
                  </TouchableOpacity>
                </View>
              ) }

              {/* ── Requesting ── */ }
              { searchState === 'requesting' && (
                <View style={ { alignItems: 'center', paddingVertical: 12, gap: 8 } }>
                  <ActivityIndicator color={ C.purple } />
                  <Text style={ { color: C.textMuted, fontSize: 12 } }>
                    Submitting request...
                  </Text>
                </View>
              ) }

              {/* ── Requested success ── */ }
              { searchState === 'requested' && (
                <View style={ { gap: 10 } }>
                  <View
                    style={ {
                      backgroundColor: C.purpleDim,
                      borderWidth: 0.5,
                      borderColor: C.purple,
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center',
                      gap: 8,
                    } }
                  >
                    <Text style={ { fontSize: 28 } }>✓</Text>
                    <Text style={ { fontSize: 15, fontWeight: '600', color: C.text } }>
                      Request submitted!
                    </Text>
                    <Text
                      style={ {
                        fontSize: 12,
                        color: C.textMuted,
                        textAlign: 'center',
                        lineHeight: 18,
                      } }
                    >
                      "{ songName }" by { artistName } has been added to the community requests below.
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={ resetForm }
                    style={ {
                      borderRadius: 10,
                      paddingVertical: 13,
                      alignItems: 'center',
                      borderWidth: 0.5,
                      borderColor: C.border,
                    } }
                  >
                    <Text style={ { color: C.textMuted, fontSize: 13 } }>
                      Request another song
                    </Text>
                  </TouchableOpacity>
                </View>
              ) }
            </View>

            {/* ── Community Requests ── */ }
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
              COMMUNITY REQUESTS
            </Text>

            {/* Pending / Ready toggle */ }
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
                    { tab === 'pending'
                      ? `Pending (${pendingRequests.length})`
                      : `Ready (${readyRequests.length})` }
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
                No { activeTab } requests yet
              </Text>
              <Text style={ { fontSize: 13, color: C.textMuted, textAlign: 'center', lineHeight: 20 } }>
                { activeTab === 'pending'
                  ? 'Use the form above to request a song.'
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