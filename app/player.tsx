import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NextIcon, PrevIcon, QueueIcon, ShuffleIcon } from '@/components/icons';
// import TabBar from '../components/TabBar';
import TabBar from '../components/TabBar';
import WaveformBars from '../components/WaveformBars';
import { SONGS } from '../constants/mockData';
import { usePlayer } from '../store/playerStore';

export default function PlayerScreen({ navigation }: any) {
  const { song, isPlaying, toggle, next, prev, progress } = usePlayer();

  const nextSong =
    SONGS[(SONGS.findIndex((s) => s.id === song.id) + 1) % SONGS.length];

  return (
    <View style={ { flex: 1, backgroundColor: '#0d0d0f' } }>
      <SafeAreaView style={ { backgroundColor: '#0d0d0f' } } />

      {/* HEADER */ }
      <View
        style={ {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 18,
          marginBottom: 18,
        } }
      >
        <TouchableOpacity
          onPress={ () => navigation?.goBack() }
          style={ {
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
          } }
        >
          <View
            style={ {
              width: 9,
              height: 9,
              borderLeftWidth: 2,
              borderBottomWidth: 2,
              borderColor: '#5a5a6e',
              transform: [{ rotate: '45deg' }],
            } }
          />
        </TouchableOpacity>

        <Text style={ { color: '#5a5a6e', fontSize: 12, letterSpacing: 0.5 } }>
          now playing
        </Text>

        <View style={ { width: 36 } } />
      </View>

      {/* MAIN CARD */ }
      <View
        style={ {
          marginHorizontal: 16,
          backgroundColor: '#12121e',
          borderRadius: 26,
          borderWidth: 0.5,
          borderColor: '#1e1e2e',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 34,
          paddingHorizontal: 22,
          marginBottom: 22,
          gap: 14,
        } }
      >
        <WaveformBars
          color={ song.color }
          bg="transparent"
          count={ 9 }
          isPlaying={ isPlaying }
          size="lg"
        />

        <Text
          style={ {
            color: '#f0f0f8',
            fontSize: 20,
            fontWeight: '600',
            textAlign: 'center',
            marginTop: 6,
          } }
        >
          { song.title }
        </Text>

        <Text
          style={ {
            color: '#5a5a6e',
            fontSize: 13,
            textAlign: 'center',
          } }
        >
          { song.artist }
        </Text>
      </View>

      {/* PROGRESS */ }
      <View
        style={ {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 18,
          gap: 10,
          marginBottom: 26,
        } }
      >
        <Text style={ { color: '#5a5a6e', fontSize: 11, width: 36 } }>
          1:21
        </Text>

        <View
          style={ {
            flex: 1,
            height: 3,
            backgroundColor: '#1e1e2e',
            borderRadius: 2,
            overflow: 'hidden',
          } }
        >
          <View
            style={ {
              width: `${progress * 100}%`,
              height: 3,
              backgroundColor: '#5a4be8',
            } }
          />
        </View>

        <Text style={ { color: '#5a5a6e', fontSize: 11, width: 36, textAlign: 'right' } }>
          { song.duration }
        </Text>
      </View>

      {/* CONTROLS */ }
      <View
        style={ {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 26,
          marginBottom: 24,
        } }
      >
        <TouchableOpacity style={ { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' } }>
          <ShuffleIcon />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={ prev }
          style={ { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' } }
        >
          <PrevIcon />
        </TouchableOpacity>

        {/* PLAY BUTTON (refined glow feel) */ }
        <TouchableOpacity
          onPress={ toggle }
          style={ {
            width: 66,
            height: 66,
            borderRadius: 33,
            backgroundColor: '#5a4be8',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#5a4be8',
            shadowOpacity: 0.3,
            shadowRadius: 12,
          } }
        >
          { isPlaying ? (
            <View style={ { flexDirection: 'row', gap: 5 } }>
              <View style={ { width: 4, height: 18, backgroundColor: '#fff', borderRadius: 2 } } />
              <View style={ { width: 4, height: 18, backgroundColor: '#fff', borderRadius: 2 } } />
            </View>
          ) : (
            <View
              style={ {
                width: 0,
                height: 0,
                borderTopWidth: 10,
                borderBottomWidth: 10,
                borderLeftWidth: 17,
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: '#fff',
                marginLeft: 3,
              } }
            />
          ) }
        </TouchableOpacity>

        <TouchableOpacity
          onPress={ next }
          style={ { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' } }
        >
          <NextIcon />
        </TouchableOpacity>

        <TouchableOpacity style={ { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' } }>
          <QueueIcon />
        </TouchableOpacity>
      </View>

      {/* UP NEXT */ }
      <View
        style={ {
          marginHorizontal: 16,
          backgroundColor: '#12121e',
          borderRadius: 16,
          borderWidth: 0.5,
          borderColor: '#1e1e2e',
          padding: 14,
          marginBottom: 14,
        } }
      >
        <Text
          style={ {
            color: '#5a5a6e',
            fontSize: 10,
            letterSpacing: 1.2,
            marginBottom: 10,
          } }
        >
          UP NEXT
        </Text>

        <View style={ { flexDirection: 'row', alignItems: 'center', gap: 12 } }>
          <WaveformBars
            color={ nextSong.color }
            bg={ nextSong.bg }
            count={ 3 }
            isPlaying={ false }
            size="sm"
          />

          <View style={ { flex: 1 } }>
            <Text style={ { color: '#c8c8d8', fontSize: 13 } }>
              { nextSong.title }
            </Text>
            <Text style={ { color: '#5a5a6e', fontSize: 11, marginTop: 2 } }>
              { nextSong.artist }
            </Text>
          </View>
        </View>
      </View>

      {/* TAB BAR */ }
      <TabBar active="waves" navigation={ navigation } />
    </View>
  );
}