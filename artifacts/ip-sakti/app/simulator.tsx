import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppScreen, BackHeader, PrimaryButton, SectionTitle, SurfaceCard, styles } from '@/components/ip-sakti';
import { useColors } from '@/hooks/useColors';

const parameters = [
  ['Ingredient', 'Add Brahmi', 'plus-circle'],
  ['Formulation', 'Liquid extract', 'droplet'],
  ['Claim', 'Stress support', 'edit-3'],
  ['Preparation method', 'Classical decoction', 'activity'],
  ['Target country', 'India', 'map-pin'],
] as const;

export default function SimulatorScreen() {
  const colors = useColors();
  const router = useRouter();
  const [active, setActive] = useState(0);
  return (
    <AppScreen>
      <BackHeader title="What if?" subtitle="Model a product change" />
      <Text style={[styles.pageTitle, { color: colors.foreground, fontSize: 23 }]}>See how changes affect your path.</Text>
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>Change one parameter to compare the likely IP, regulatory and ABS impact.</Text>
      <SectionTitle title="Edit a parameter" />
      <View style={{ gap: 8 }}>
        {parameters.map(([label, value, icon], index) => (
          <Pressable key={label} onPress={() => setActive(index)} style={{ flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 14, backgroundColor: active === index ? colors.sageLight : colors.card, borderWidth: 1, borderColor: active === index ? colors.forest : colors.border }}>
            <Feather name={icon} size={17} color={active === index ? colors.forest : colors.inkSubtle} />
            <View style={{ flex: 1, marginLeft: 11 }}><Text style={{ color: colors.inkSubtle, fontSize: 10, fontWeight: '700' }}>{label.toUpperCase()}</Text><Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '600', marginTop: 3 }}>{value}</Text></View>
            <Feather name="chevron-right" size={16} color={colors.inkSubtle} />
          </Pressable>
        ))}
      </View>
      <SectionTitle title="Impact preview" action="Updated now" />
      <SurfaceCard>
        <Text style={{ color: colors.inkSubtle, fontSize: 10, fontWeight: '700', letterSpacing: 0.7 }}>CURRENT PATH</Text>
        <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '700', marginTop: 6 }}>Proprietary medicine · India</Text>
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 15 }} />
        <Text style={{ color: colors.forest, fontSize: 10, fontWeight: '700', letterSpacing: 0.7 }}>MODIFIED PATH</Text>
        <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '700', marginTop: 6 }}>Proprietary medicine + Brahmi review</Text>
        <View style={{ flexDirection: 'row', gap: 7, marginTop: 14 }}><Impact label="IP" value="Review" tone="warning" /><Impact label="REGULATORY" value="No change" tone="success" /><Impact label="ABS" value="Check" tone="warning" /></View>
      </SurfaceCard>
      <View style={{ marginTop: 18 }}><PrimaryButton label="Save this scenario" icon="bookmark" onPress={() => router.replace('/passport')} /></View>
    </AppScreen>
  );
}

function Impact({ label, value, tone }: { label: string; value: string; tone: 'warning' | 'success' }) {
  const colors = useColors();
  return <View style={{ flex: 1, backgroundColor: tone === 'success' ? '#E5F3EA' : colors.saffronLight, borderRadius: 10, padding: 9 }}><Text style={{ color: colors.inkSubtle, fontSize: 8, fontWeight: '700' }}>{label}</Text><Text style={{ color: tone === 'success' ? colors.success : colors.warning, fontSize: 10, fontWeight: '700', marginTop: 4 }}>{value}</Text></View>;
}