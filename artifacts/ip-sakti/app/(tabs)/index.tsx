import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
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
  {
    icon: 'layers' as const,
    title: 'Product Classification',
    text: 'Classical vs ASU vs Aahar',
    route: '/classify' as const,
    accent: 'lavender' as const,
  },
  {
    icon: 'globe' as const,
    title: 'ABS & Biodiversity',
    text: 'BDA 2023 & NBA rules',
    route: '/abs' as const,
    accent: 'pink' as const,
  },
  {
    icon: 'package' as const,
    title: 'Formula Analyzer',
    text: 'Normalize botanicals',
    route: '/formula-analyzer' as const,
    accent: 'lavender' as const,
  },
  {
    icon: 'search' as const,
    title: 'Prior-Art Radar',
    text: 'Search TKDL & patents',
    route: '/radar' as const,
    accent: 'pink' as const,
  },
];

const promptSuggestions = [
  'Can I patent an Ashwagandha + Piperine extract in India?',
  'Does our formulation fall under FSSAI Ayurveda Aahar 2022?',
  'Are cultivated botanicals exempt from SBB ABS levies?',
  'Check Section 3(p) Traditional Knowledge exclusion',
];

const analyses = [
  {
    title: 'Ashwagandha Calm Formula',
    meta: 'Proprietary ASU  ·  India  ·  24 Aug 2026',
    status: 'Ready',
    tone: 'success' as const,
    icon: 'check-circle' as const,
  },
  {
    title: 'Neem & Turmeric Skin Balm',
    meta: 'Topical ASU  ·  EU THMPD  ·  18 Aug 2026',
    status: 'In Review',
    tone: 'warning' as const,
    icon: 'clock' as const,
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const submit = () => {
    if (!query.trim()) return;
    router.push({ pathname: '/ask-ai', params: { draft: query.trim() } });
    setQuery('');
  };

  const selectPrompt = (prompt: string) => {
    router.push({ pathname: '/ask-ai', params: { draft: prompt } });
  };

  return (
    <AppScreen>
      <BrandHeader action={<LanguagePill />} />

      <Text style={[styles.greeting, { color: colors.inkSubtle }]}>Good morning, Aayush</Text>
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>
        Make your next move{'\n'}with clarity & confidence.
      </Text>
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>
        Evidence-grounded Ayurvedic IP & regulatory decision intelligence.
      </Text>

      {/* Hero Card with Obsidian Black, glowing lavender/pink decor */}
      <View style={[styles.heroCard, { backgroundColor: colors.black }]}>
        {/* Glow Spheres */}
        <View
          style={[
            styles.heroDecor,
            {
              backgroundColor: colors.lavender,
              opacity: 0.28,
              transform: [{ scale: 1.2 }],
            },
          ]}
        />
        <View
          style={{
            position: 'absolute',
            left: -20,
            bottom: -30,
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: colors.pink,
            opacity: 0.15,
          }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.pink }} />
            <Text style={[styles.heroLabel, { color: '#E9D5FF' }]}>IP-SAKTI COPILOT</Text>
          </View>
          <Text style={{ color: colors.pink, fontSize: 10, fontWeight: '800' }}>GEMINI POWERED</Text>
        </View>

        <Text style={[styles.heroTitle, { color: '#FFFFFF' }]}>
          What formulation or patent are you developing?
        </Text>

        <QueryComposer value={query} onChangeText={setQuery} onSubmit={submit} />
      </View>

      {/* Quick Prompt Chips */}
      <View style={{ marginTop: 14 }}>
        <Text style={{ color: colors.inkSubtle, fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 }}>
          SUGGESTED EXPLORATIONS
        </Text>
        <View style={{ gap: 6 }}>
          {promptSuggestions.map((prompt) => (
            <Pressable
              key={prompt}
              onPress={() => selectPrompt(prompt)}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Feather name="arrow-right" size={13} color={colors.pink} />
              <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '600', flex: 1 }}>
                {prompt}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Quick Actions Grid */}
      <SectionTitle title="Core IP & Regulatory Tools" action="See all 9" onActionPress={() => router.push('/tools')} />
      <View style={styles.quickGrid}>
        {quickActions.map((item) => (
          <SurfaceCard
            key={item.title}
            onPress={() => router.push(item.route)}
            style={[styles.quickCard, { borderColor: colors.border }]}
          >
            <IconCircle
              icon={item.icon}
              background={item.accent === 'pink' ? colors.pinkLight : colors.lavenderLight}
              color={item.accent === 'pink' ? colors.pink : colors.lavenderDeep}
            />
            <Text style={[styles.quickTitle, { color: colors.foreground }]}>{item.title}</Text>
            <Text style={[styles.quickText, { color: colors.inkSubtle }]}>{item.text}</Text>
          </SurfaceCard>
        ))}
      </View>

      {/* Recent Workspace Analysis */}
      <SectionTitle title="Recent Analysis & History" action="My Research" onActionPress={() => router.push('/research')} />
      {analyses.map((item) => (
        <SurfaceCard
          key={item.title}
          onPress={() => router.push('/research')}
          style={styles.analysisCard}
        >
          <View
            style={[
              styles.analysisGlyph,
              {
                backgroundColor: item.tone === 'success' ? colors.lavenderLight : colors.pinkLight,
              },
            ]}
          >
            <Feather
              name={item.icon}
              size={18}
              color={item.tone === 'success' ? colors.lavenderDeep : colors.pink}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.analysisTitle, { color: colors.foreground }]}>{item.title}</Text>
            <Text style={[styles.analysisMeta, { color: colors.inkSubtle }]}>{item.meta}</Text>
          </View>
          <StatusBadge label={item.status} tone={item.tone} />
        </SurfaceCard>
      ))}

      <View style={{ height: 10 }} />
    </AppScreen>
  );
}
