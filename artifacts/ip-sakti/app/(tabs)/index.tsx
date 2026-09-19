import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  AppScreen,
  BrandHeader,
  IconCircle,
  LanguagePill,
  QueryComposer,
  SectionTitle,
  StatusBadge,
  SurfaceCard,
  styles,
} from '@/components/ip-sakti';
import { useColors } from '@/hooks/useColors';

const quickActions = [
  { icon: 'package' as const, title: 'Formula Analyzer', text: 'Normalize a formula', route: '/formula-analyzer' as const },
  { icon: 'award' as const, title: 'Patentability', text: 'Check IP potential', route: '/classify' as const },
  { icon: 'layers' as const, title: 'Classification', text: 'Find your pathway', route: '/classify' as const },
  { icon: 'globe' as const, title: 'ABS Check', text: 'Review biodiversity', route: '/jurisdiction' as const },
  { icon: 'search' as const, title: 'Prior-Art Radar', text: 'Search knowledge', route: '/radar' as const },
];

const analyses = [
  { title: 'Ashwagandha Calm Formula', meta: 'India  ·  24 Aug 2026', status: 'Ready', tone: 'success' as const, icon: 'check-circle' as const },
  { title: 'Neem & Turmeric Skin Balm', meta: 'EU  ·  18 Aug 2026', status: 'Review', tone: 'warning' as const, icon: 'clock' as const },
];

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const submit = () => {
    router.push({ pathname: '/ask-ai', params: { draft: query } });
    setQuery('');
  };
  return (
    <AppScreen>
      <BrandHeader action={<LanguagePill />} />
      <Text style={[styles.greeting, { color: colors.inkSubtle }]}>Good morning, Aayush</Text>
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>Make your next move{'\n'}with clarity.</Text>
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>Your Ayurvedic IP & regulatory copilot.</Text>

      <View style={[styles.heroCard, { backgroundColor: colors.forest }]}>
        <View style={[styles.heroDecor, { backgroundColor: colors.saffron }]} />
        <Text style={[styles.heroLabel, { color: '#B9D8C5' }]}>IP SAKTI AI</Text>
        <Text style={[styles.heroTitle, { color: colors.primaryForeground }]}>What are you working on?</Text>
        <QueryComposer value={query} onChangeText={setQuery} onSubmit={submit} />
      </View>

      <SectionTitle title="Quick actions" action="See all" />
      <View style={styles.quickGrid}>
        {quickActions.map((item) => (
          <SurfaceCard key={item.title} onPress={() => router.push(item.route)} style={[styles.quickCard, { borderColor: colors.border }]}>
            <IconCircle icon={item.icon} />
            <Text style={[styles.quickTitle, { color: colors.foreground }]}>{item.title}</Text>
            <Text style={[styles.quickText, { color: colors.inkSubtle }]}>{item.text}</Text>
          </SurfaceCard>
        ))}
      </View>

      <SectionTitle title="Recent analysis" action="My Research" />
      {analyses.map((item) => (
        <SurfaceCard key={item.title} onPress={() => router.push('/research')} style={styles.analysisCard}>
          <View style={[styles.analysisGlyph, { backgroundColor: item.tone === 'success' ? colors.sageLight : colors.saffronLight }]}>
            <Feather name={item.icon} size={19} color={item.tone === 'success' ? colors.forest : colors.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.analysisTitle, { color: colors.foreground }]}>{item.title}</Text>
            <Text style={[styles.analysisMeta, { color: colors.inkSubtle }]}>{item.meta}</Text>
          </View>
          <StatusBadge label={item.status} tone={item.tone} />
        </SurfaceCard>
      ))}
      <View style={{ height: 6 }} />
    </AppScreen>
  );
}
