import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppScreen, BackHeader, PrimaryButton, SurfaceCard, styles } from '@/components/ip-sakti';
import { useColors } from '@/hooks/useColors';

const chain = [
  ['AI claim', 'Your Ashwagandha formulation may face novelty risk', 'zap'],
  ['Source', 'Traditional Knowledge Digital Library', 'database'],
  ['Section / article', 'Ashwagandha · stress support · formulation record', 'bookmark'],
  ['Version / effective date', 'Knowledge record updated · 2024', 'calendar'],
  ['Conclusion', 'Prior-art and TK review recommended before filing', 'check-circle'],
] as const;

export default function EvidenceScreen() {
  const colors = useColors();
  return (
    <AppScreen>
      <BackHeader title="Evidence chain" subtitle="Why this guidance was shown" />
      <Text style={[styles.pageTitle, { color: colors.foreground, fontSize: 23 }]}>Trace the conclusion.</Text>
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>IP SAKTI connects guidance to sources so you can decide what to verify next.</Text>
      <View style={{ marginTop: 25 }}>
        {chain.map(([label, value, icon], index) => (
          <View key={label} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center', width: 26 }}>
              <View style={{ width: 26, height: 26, borderRadius: 9, backgroundColor: index === chain.length - 1 ? colors.forest : colors.saffronLight, alignItems: 'center', justifyContent: 'center' }}><Feather name={icon} size={13} color={index === chain.length - 1 ? colors.primaryForeground : colors.warning} /></View>
              {index < chain.length - 1 ? <View style={{ width: 1, height: 55, backgroundColor: colors.border }} /> : null}
            </View>
            <SurfaceCard style={{ flex: 1, marginBottom: 12, padding: 13 }}>
              <Text style={{ color: colors.forest, fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>{label}</Text>
              <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18, fontWeight: '600', marginTop: 5 }}>{value}</Text>
              {index === 1 || index === 2 ? <Text style={{ color: colors.forest, fontSize: 10, fontWeight: '700', marginTop: 9 }}>Open source  →</Text> : null}
            </SurfaceCard>
          </View>
        ))}
      </View>
      <PrimaryButton label="View source context" icon="external-link" onPress={() => {}} />
      <Text style={{ color: colors.inkSubtle, fontSize: 10, textAlign: 'center', lineHeight: 15, marginTop: 15 }}>Sources are provided for verification. This is AI-generated guidance, not legal advice.</Text>
    </AppScreen>
  );
}