import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppScreen, BackHeader, EvidenceCard, PrimaryButton, StatusBadge, SurfaceCard, styles } from '@/components/ip-sakti';
import { useColors } from '@/hooks/useColors';

const results = [
  { title: 'Withania somnifera composition for stress support', source: 'Indian Patent Office', relevance: '86%', jurisdiction: 'India', date: '2022', tone: 'attention' as const },
  { title: 'Ashwagandha formulations in classical texts', source: 'TKDL knowledge record', relevance: '74%', jurisdiction: 'India', date: '2024', tone: 'warning' as const },
  { title: 'Botanical adaptogen compositions', source: 'WIPO Patentscope', relevance: '61%', jurisdiction: 'International', date: '2021', tone: 'neutral' as const },
];

export default function RadarScreen() {
  const colors = useColors();
  const router = useRouter();
  const [query, setQuery] = useState('Ashwagandha stress formulation');
  return (
    <AppScreen>
      <BackHeader title="Prior-art radar" subtitle="Search patents and knowledge" />
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle, marginTop: -8 }]}>Potential overlaps are signals to investigate, not legal conclusions.</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 21 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, borderRadius: 13, paddingHorizontal: 12, minHeight: 48 }}><Feather name="search" size={17} color={colors.inkSubtle} /><TextInput value={query} onChangeText={setQuery} placeholderTextColor={colors.inkSubtle} style={{ color: colors.foreground, flex: 1, marginLeft: 9, fontSize: 12 }} /></View>
        <Pressable style={{ width: 48, height: 48, borderRadius: 13, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' }}><Feather name="sliders" size={17} color={colors.primaryForeground} /></Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: 7, marginTop: 18, marginBottom: 6 }}><StatusBadge label="3 patent matches" tone="attention" /><StatusBadge label="2 TK matches" tone="warning" /></View>
      {results.map((result) => (
        <SurfaceCard key={result.title} style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}><Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 18, fontWeight: '700', flex: 1 }}>{result.title}</Text><Text style={{ color: result.tone === 'attention' ? colors.destructive : result.tone === 'warning' ? colors.warning : colors.inkSubtle, fontSize: 14, fontWeight: '700' }}>{result.relevance}</Text></View>
          <Text style={{ color: colors.inkSubtle, fontSize: 11, marginTop: 8 }}>{result.source}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 13 }}><Text style={{ color: colors.inkSubtle, fontSize: 10 }}>{result.jurisdiction}  ·  {result.date}</Text><Pressable onPress={() => router.push('/evidence')}><Text style={{ color: colors.forest, fontSize: 11, fontWeight: '700' }}>View evidence</Text></Pressable></View>
          {result.tone === 'attention' ? <EvidenceCard title="Patents Act, 1970" section="Potential overlap" version="Current" /> : null}
        </SurfaceCard>
      ))}
      <View style={{ marginTop: 18 }}><PrimaryButton label="Explore knowledge graph" icon="arrow-right" onPress={() => router.push('/evidence')} /></View>
    </AppScreen>
  );
}