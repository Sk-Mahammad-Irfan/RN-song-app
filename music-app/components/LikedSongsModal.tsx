import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import WaveformBars from './WaveformBars';
import { C } from '../constants/theme';
import { usePlayer, Song } from '../store/playerStore';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function LikedSongsModal({ visible, onClose }: Props) {
    const { setQueue, song: currentSong, isPlaying, likedSongs } = usePlayer();
    const router = useRouter();

    const handlePlay = (song: Song, index: number) => {
        setQueue(likedSongs, index);
        onClose();
        router.push('/player');
    };

    const handleShuffle = () => {
        const shuffled = [...likedSongs].sort(() => Math.random() - 0.5);
        setQueue(shuffled, 0);
        onClose();
        router.push('/player');
    };

    return (
        <Modal visible={ visible } animationType="slide" presentationStyle="pageSheet">
            <View style={ { flex: 1, backgroundColor: C.bg } }>

                {/* ── Hero ── */ }
                <View
                    style={ {
                        backgroundColor: C.purpleDim,
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
                            LIKED SONGS
                        </Text>
                        <View style={ { width: 32 } } />
                    </View>

                    {/* Waveform + title */ }
                    <View style={ { alignItems: 'center', gap: 12, paddingHorizontal: 24 } }>
                        <View style={ { flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 60 } }>
                            { [0.4, 0.7, 1, 0.8, 0.6, 0.9, 0.5, 0.75, 0.95, 0.6, 0.8, 0.45].map((h, i) => (
                                <View
                                    key={ i }
                                    style={ {
                                        width: 6,
                                        height: 60 * h,
                                        borderRadius: 3,
                                        backgroundColor: i % 2 === 0 ? C.purple : C.purpleLight,
                                        opacity: 0.7 + (i % 3) * 0.1,
                                    } }
                                />
                            )) }
                        </View>

                        <Text style={ { fontSize: 26, fontWeight: '700', color: C.text } }>
                            Liked Songs
                        </Text>

                        <Text style={ { fontSize: 12, color: C.textMuted } }>
                            { likedSongs.length > 0
                                ? `${likedSongs.length} ${likedSongs.length === 1 ? 'song' : 'songs'} you love`
                                : 'Your musical soul lives here' }
                        </Text>

                        { likedSongs.length > 0 && (
                            <View style={ { flexDirection: 'row', gap: 10, marginTop: 4 } }>
                                <TouchableOpacity
                                    onPress={ () => handlePlay(likedSongs[0], 0) }
                                    style={ {
                                        backgroundColor: C.purple,
                                        borderRadius: 24,
                                        paddingHorizontal: 24,
                                        paddingVertical: 11,
                                        flexDirection: 'row',
                                        alignItems: 'center',
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
                                    <Text style={ { color: '#fff', fontSize: 13, fontWeight: '600' } }>Play all</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={ handleShuffle }
                                    style={ {
                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                        borderRadius: 24,
                                        paddingHorizontal: 20,
                                        paddingVertical: 11,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 8,
                                        borderWidth: 0.5,
                                        borderColor: C.border,
                                    } }
                                >
                                    <Text style={ { color: C.text, fontSize: 13 } }>⇄</Text>
                                    <Text style={ { color: C.text, fontSize: 13, fontWeight: '500' } }>Shuffle</Text>
                                </TouchableOpacity>
                            </View>
                        ) }
                    </View>
                </View>

                {/* ── Empty state ── */ }
                { likedSongs.length === 0 ? (
                    <View style={ { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 40 } }>
                        <View style={ { flexDirection: 'row', gap: 5, alignItems: 'flex-end', opacity: 0.2 } }>
                            { [0.3, 0.6, 1, 0.7, 0.5, 0.8, 0.4, 0.9, 0.6, 0.3].map((h, i) => (
                                <View key={ i } style={ { width: 5, height: 50 * h, borderRadius: 3, backgroundColor: C.purple } } />
                            )) }
                        </View>

                        <View style={ { alignItems: 'center', gap: 10 } }>
                            <Text style={ { fontSize: 48, lineHeight: 56 } }>♡</Text>
                            <Text style={ { fontSize: 20, fontWeight: '700', color: C.text, textAlign: 'center' } }>
                                Nothing here yet
                            </Text>
                            <Text style={ { fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 22 } }>
                                Songs you love will live here.{ '\n' }Hit ♡ on anything that moves you.
                            </Text>
                        </View>

                        <View
                            style={ {
                                backgroundColor: C.card,
                                borderRadius: 16,
                                borderWidth: 0.5,
                                borderColor: C.border,
                                padding: 16,
                                width: '100%',
                                gap: 12,
                            } }
                        >
                            { [
                                { step: '1', text: 'Search for a song in Find' },
                                { step: '2', text: 'Tap it to open the player' },
                                { step: '3', text: 'Press ♡ to like it' },
                            ].map((item) => (
                                <View key={ item.step } style={ { flexDirection: 'row', alignItems: 'center', gap: 12 } }>
                                    <View
                                        style={ {
                                            width: 24,
                                            height: 24,
                                            borderRadius: 12,
                                            backgroundColor: C.purpleDim,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        } }
                                    >
                                        <Text style={ { fontSize: 11, color: C.purpleLight, fontWeight: '600' } }>
                                            { item.step }
                                        </Text>
                                    </View>
                                    <Text style={ { fontSize: 13, color: C.textMuted } }>{ item.text }</Text>
                                </View>
                            )) }
                        </View>

                        <TouchableOpacity
                            onPress={ onClose }
                            style={ { backgroundColor: C.purple, borderRadius: 24, paddingHorizontal: 28, paddingVertical: 12 } }
                        >
                            <Text style={ { color: '#fff', fontSize: 13, fontWeight: '600' } }>Discover music</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // ── Song list ──
                    <FlatList
                        data={ likedSongs }
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

                                    <View style={ { alignItems: 'flex-end', gap: 4 } }>
                                        <Text style={ { fontSize: 10, color: C.textDim } }>{ item.duration }</Text>
                                        <Text style={ { fontSize: 13, color: C.purple } }>♥</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        } }
                    />
                ) }
            </View>
        </Modal>
    );
}