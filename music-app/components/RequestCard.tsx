import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C } from '../constants/theme';

interface Props {
  songName?: string;
}

export default function RequestCard({ songName = 'This song' }: Props) {
  return (
    <View style={ [styles.card, { backgroundColor: C.surface, borderColor: '#2a2040' }] }>
      <View style={ styles.header }>
        <View style={ styles.clockIcon }>
          <View style={ styles.clockFace } />
        </View>
        <View style={ { flex: 1 } }>
          <Text style={ [styles.headerTitle, { color: C.text }] }>Not in Waveform yet</Text>
          <Text style={ [styles.headerSub, { color: C.textMuted }] } numberOfLines={ 1 }>
            "{ songName }"
          </Text>
        </View>
      </View>

      <View style={ styles.etaBox }>
        <View style={ styles.leftAccent } />
        <View style={ { flex: 1 } }>
          <Text style={ [styles.etaLabel, { color: C.purpleLight }] }>Expected availability</Text>
          <Text style={ [styles.etaValue, { color: C.text }] }>2–3 days</Text>
          <Text style={ [styles.etaSub, { color: C.textMuted }] }>
            We'll notify you when it's ready
          </Text>
        </View>
      </View>

      <View style={ styles.demandSection }>
        <View style={ styles.demandRow }>
          <Text style={ [styles.demandLabel, { color: C.textMuted }] }>others requesting this</Text>
          <Text style={ [styles.demandCount, { color: C.purpleLight }] }>47 listeners</Text>
        </View>
        <View style={ [styles.demandBg, { backgroundColor: C.border }] }>
          <View style={ [styles.demandFill, { backgroundColor: C.purple, width: '72%' }] } />
        </View>
      </View>

      <TouchableOpacity
        style={ [styles.requestBtn, { backgroundColor: C.purple }] }
        activeOpacity={ 0.85 }
      >
        <Text style={ [styles.requestBtnText, { color: C.text }] }>Request this song</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 0.5,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clockIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#1a1430',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockFace: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#5a4be8',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 11,
  },
  etaBox: {
    backgroundColor: '#13102a',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    borderLeftWidth: 0,
  },
  leftAccent: {
    width: 2.5,
    backgroundColor: '#5a4be8',
    borderRadius: 2,
  },
  etaLabel: {
    fontSize: 10,
    marginBottom: 3,
  },
  etaValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  etaSub: {
    fontSize: 10,
  },
  demandSection: {
    gap: 6,
  },
  demandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demandLabel: {
    fontSize: 10,
  },
  demandCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  demandBg: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  demandFill: {
    height: '100%',
  },
  requestBtn: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  requestBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});