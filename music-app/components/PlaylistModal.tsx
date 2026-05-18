import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import WaveformBars from './WaveformBars';
import { C } from '../constants/theme';
import { usePlayer, Song } from '../store/playerStore';
import { WavePlaylist, AutoPlaylist } from '../hooks/useWavesSongs';

interface Props {
    playlist: WavePlaylist | AutoPlaylist | null;
    visible: boolean;
    onClose: () => void;
}

export default function PlaylistModal({ playlist, visible, onClose }: Props) {
    const { setQueue, song: currentSong, isPlaying } = usePlayer();
    const router = useRouter();

    if (!playlist) return null;

    const songs = playlist.songs;

    const handlePlay = (song: Song, index: number) => {
        setQueue(songs, index);
        onClose();
        router.push('/player');
    };

    return (
        <Modal visible={ visible } animationType="slide" presentationStyle="pageSheet">
            <View style={ { flex: 1, backgroundColor: C.bg } }>

                {/* ── Hero ── */ }
                <View
                    style={ {
                        backgroundColor: playlist.bg,
                        paddingBottom: 24,
                        borderBottomWidth: 0.5,
                        borderBottomColor: C.border,
                    } }
                >
                    {/* Top row */ }
                    <View
                        style={ {
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: 20,
                            paddingTop: 28,
                            marginBottom: 20,
                        } }
                    >
                        <TouchableOpacity
                            onPress={ onClose }
                            style={ {
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            } }
                        >
                            <Text style={ { fontSize: 20, color: C.text, lineHeight: 24 } }>✕</Text>
                        </TouchableOpacity>
                        <Text style={ { fontSize: 12, color: C.textMuted, letterSpacing: 1 } }>
                            { playlist.name.toUpperCase() }
                        </Text>
                        <View style={ { width: 32 } } />
                    </View>

                    {/* Info */ }
                    <View style={ { alignItems: 'center', gap: 10, paddingHorizontal: 24 } }>
                        <WaveformBars color={ playlist.color } bg="transparent" count={ 7 } size="lg" isPlaying={ false } />

                        <Text style={ { fontSize: 22, fontWeight: '700', color: C.text } }>
                            { playlist.name }
                        </Text>

                        <Text style={ { fontSize: 12, color: C.textMuted } }>
                            { songs.length > 0 ? `${songs.length} songs` : 'Loading...' }
                        </Text>

                        { 'tags' in playlist && (
                            <View style={ { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' } }>
                                { (playlist as WavePlaylist).tags.map((tag) => (
                                    <Text
                                        key={ tag }
                                        style={ {
                                            fontSize: 9,
                                            color: C.textMuted,
                                            backgroundColor: 'rgba(255,255,255,0.08)',
                                            paddingHorizontal: 10,
                                            paddingVertical: 4,
                                            borderRadius: 10,
                                        } }
                                    >
                                        { tag }
                                    </Text>
                                )) }
                            </View>
                        ) }

                        { songs.length > 0 && (
                            <TouchableOpacity
                                onPress={ () => handlePlay(songs[0], 0) }
                                style={ {
                                    backgroundColor: playlist.color,
                                    borderRadius: 24,
                                    paddingHorizontal: 28,
                                    paddingVertical: 11,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginTop: 4,
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
                                <Text style={ { color: '#fff', fontSize: 13, fontWeight: '600' } }>Play all</Text>
                            </TouchableOpacity>
                        ) }
                    </View>
                </View>

                {/* ── Song list or loading ── */ }
                { songs.length === 0 ? (
                    <View style={ { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 } }>
                        <ActivityIndicator color={ C.purple } />
                        <Text style={ { color: C.textMuted, fontSize: 12 } }>Loading songs...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={ songs }
                        keyExtractor={ (item) => item.id }
                        showsVerticalScrollIndicator={ false }
                        contentContainerStyle={ { paddingBottom: 40, paddingTop: 8 } }
                        renderItem={ ({ item, index }) => {
                            const isActive = currentSong.id === item.id;
                            return (
                                <TouchableOpacity
                                    onPress={ () => handlePlay(item, index) }
                                    activeOpacity={ 0.75 }
                                    style={ {
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 20,
                                        paddingVertical: 11,
                                        gap: 12,
                                        backgroundColor: isActive ? '#16162a' : 'transparent',
                                        borderBottomWidth: 0.5,
                                        borderBottomColor: C.border,
                                    } }
                                >
                                    <View style={ { width: 22, alignItems: 'center', justifyContent: 'center' } }>
                                        { isActive && isPlaying ? (
                                            <View style={ { flexDirection: 'row', gap: 1.5, alignItems: 'flex-end', height: 14 } }>
                                                { [0.6, 1, 0.7].map((h, i) => (
                                                    <View key={ i } style={ { width: 3, height: 14 * h, backgroundColor: C.purple, borderRadius: 1.5 } } />
                                                )) }
                                            </View>
                                        ) : (
                                            <Text style={ { fontSize: 11, color: isActive ? C.purpleLight : C.textDim } }>
                                                { index + 1 }
                                            </Text>
                                        ) }
                                    </View>

                                    <WaveformBars color={ item.color } bg={ item.bg } count={ 3 } isPlaying={ isActive && isPlaying } size="sm" />

                                    <View style={ { flex: 1 } }>
                                        <Text numberOfLines={ 1 } style={ { fontSize: 13, fontWeight: '500', color: isActive ? C.purpleLight : C.text, marginBottom: 3 } }>
                                            { item.title }
                                        </Text>
                                        <Text style={ { fontSize: 11, color: C.textMuted } }>
                                            { item.artist }{ item.album ? ` · ${item.album}` : '' }
                                        </Text>
                                    </View>

                                    <Text style={ { fontSize: 10, color: C.textDim } }>{ item.duration }</Text>
                                </TouchableOpacity>
                            );
                        } }
                    />
                ) }
            </View>
        </Modal>
    );
}