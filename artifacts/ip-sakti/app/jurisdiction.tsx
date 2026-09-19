import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppScreen, BackHeader, PrimaryButton, StatusBadge, SurfaceCard, styles } from '@/components/ip-sakti';
import { useColors } from '@/hooks/useColors';

const countries = [
  { flag: 'IN', name: 'India', code: 'IN', note: 'Selected' },
  { flag: 'US', name: 'United States', code: 'US', note: 'FDA / USPTO' },
  { flag: 'EU', name: 'European Union', code: 'EU', note: 'EMA / EPO' },
  { flag: 'GB', name: 'United Kingdom', code: 'UK', note: 'MHRA / UKIPO' },
  { flag: 'GL', name: 'Other market', code: 'OT', note: 'Explore' },
];

export default function JurisdictionScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selected, setSelected] = useState('IN');
  return (
    <AppScreen>
      <BackHeader title="Commercialization Market" subtitle="Compare jurisdiction pathways" />
      <Text style={[styles.pageTitle, { color: colors.foreground, fontSize: 23 }]}>Where do you want to commercialize?</Text>
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>Select a market to surface the requirements that matter.</Text>
      <View style={{ marginTop: 22, gap: 9 }}>
        {countries.map((country) => (
          <SurfaceCard
            key={country.code}
            onPress={() => setSelected(country.code)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 13,
              borderColor: selected === country.code ? colors.lavenderDeep : colors.border,
              backgroundColor: selected === country.code ? colors.lavenderLight : colors.card,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 13,
                backgroundColor: selected === country.code ? colors.lavenderDeep : colors.surfaceMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: selected === country.code ? colors.primaryForeground : colors.lavenderDeep, fontSize: 11, fontWeight: '700' }}>
                {country.flag}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 11 }}>
              <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '700' }}>{country.name}</Text>
              <Text style={{ color: colors.inkSubtle, fontSize: 10, marginTop: 3 }}>{country.note}</Text>
            </View>
            {selected === country.code ? (
              <Feather name="check-circle" size={19} color={colors.lavenderDeep} />
            ) : (
              <Feather name="circle" size={19} color={colors.border} />
            )}
          </SurfaceCard>
        ))}
      </View>
      <SectionCard title="IP Requirements" icon="award" items={['Novelty and inventive step review', 'Prior-art search before filing']} />
      <SectionCard title="Regulatory Requirements" icon="layers" items={['Classify formulation under local pathway', 'Confirm claims and permitted ingredients']} />
      <SectionCard title="Traditional Knowledge / ABS" icon="globe" items={['Check TK overlap and disclosure duties', 'Document source and benefit-sharing position']} />
      <View style={{ marginTop: 10 }}>
        <PrimaryButton label="Compare Jurisdictions" icon="arrow-right" onPress={() => router.push('/simulator')} />
      </View>
    </AppScreen>
  );
}

function SectionCard({ title, icon, items }: { title: string; icon: React.ComponentProps<typeof Feather>['name']; items: string[] }) {
  const colors = useColors();
  return (
    <SurfaceCard style={{ marginTop: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 }}>
        <Feather name={icon} size={16} color={colors.lavenderDeep} />
        <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '700' }}>{title}</Text>
      </View>
      {items.map((item) => (
        <View key={item} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 8 }}>
          <Feather name="check" size={14} color={colors.success} />
          <Text style={{ color: colors.inkSubtle, fontSize: 11, lineHeight: 17, flex: 1 }}>{item}</Text>
        </View>
      ))}
      <View style={{ marginTop: 11 }}>
        <StatusBadge label="Review with expert" tone="warning" />
      </View>
    </SurfaceCard>
  );
}