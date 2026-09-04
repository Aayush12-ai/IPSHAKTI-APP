import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppScreen, BrandHeader, LanguagePill, PrimaryButton, SectionTitle, StatusBadge, SurfaceCard, styles } from '@/components/ip-sakti';
import { useColors } from '@/hooks/useColors';

const rows = [
  ['Patent readiness', 'Ready', 'success', 'award'],
  ['Prior-art risk', 'Review', 'warning', 'search'],
  ['Traditional knowledge risk', 'Attention', 'attention', 'book-open'],
  ['ABS status', 'Ready', 'success', 'globe'],
  ['Regulatory readiness', 'Review', 'warning', 'layers'],
  ['International readiness', 'Ready', 'success', 'map'],
] as const;

export default function PassportScreen() {
  const colors = useColors();
  const router = useRouter();
  return (
    <AppScreen>
      <BrandHeader action={<LanguagePill />} />
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>IP readiness passport</Text>
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>Ashwagandha Calm Formula  ·  Draft assessment</Text>
      <SurfaceCard style={{ marginTop: 22, alignItems: 'center', paddingVertical: 22 }}>
        <View style={{ width: 128, height: 128, borderRadius: 64, borderWidth: 12, borderColor: colors.sageLight, borderTopColor: colors.forest, borderRightColor: colors.forest, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 34, fontWeight: '700', color: colors.forest }}>72</Text>
          <Text style={{ fontSize: 10, fontWeight: '700', color: colors.inkSubtle, letterSpacing: 0.7 }}>OUT OF 100</Text>
        </View>
        <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '700', marginTop: 15 }}>Good foundation, a few reviews needed</Text>
        <Text style={{ color: colors.inkSubtle, fontSize: 12, marginTop: 5 }}>Last updated 24 Aug 2026</Text>
      </SurfaceCard>
      <SectionTitle title="Readiness overview" />
      <SurfaceCard style={{ paddingVertical: 4 }}>
        {rows.map(([label, status, tone, icon], index) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: index === rows.length - 1 ? 0 : 1, borderBottomColor: colors.border }}>
            <Feather name={icon} size={16} color={colors.forest} style={{ width: 27 }} />
            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '600', flex: 1 }}>{label}</Text>
            <StatusBadge label={status} tone={tone} />
          </View>
        ))}
      </SurfaceCard>
      <SectionTitle title="Recommended actions" />
      {['Complete prior-art search', 'Review regulatory classification', 'Verify ABS obligations'].map((action, index) => (
        <SurfaceCard key={action} onPress={() => router.push(index === 0 ? '/radar' : index === 1 ? '/classify' : '/jurisdiction')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: colors.saffronLight, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.warning, fontSize: 12, fontWeight: '700' }}>{index + 1}</Text></View>
          <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '600', flex: 1 }}>{action}</Text>
          <Feather name="chevron-right" size={17} color={colors.inkSubtle} />
        </SurfaceCard>
      ))}
      <PrimaryButton label="Explore evidence chain" icon="arrow-right" onPress={() => router.push('/evidence')} />
    </AppScreen>
  );
}