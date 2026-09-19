import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen, BrandHeader, LanguagePill, SectionTitle, ToolCard, styles } from '@/components/ip-sakti';
import { useColors } from '@/hooks/useColors';

const tools = [
  { icon: 'package' as const, title: 'Formula Analyzer', description: 'Normalize ingredients and review evidence.', route: '/formula-analyzer' as const },
  { icon: 'award' as const, title: 'Patentability Check', description: 'Assess novelty, inventive step and exclusions.', route: '/classify' as const },
  { icon: 'search' as const, title: 'Prior-Art Radar', description: 'Find patents and classical knowledge overlap.', route: '/radar' as const },
  { icon: 'layers' as const, title: 'Product Classification', description: 'Identify the likely regulatory pathway.', route: '/classify' as const },
  { icon: 'globe' as const, title: 'ABS Checker', description: 'Review biodiversity and benefit-sharing duties.', route: '/jurisdiction' as const },
  { icon: 'map' as const, title: 'Jurisdiction Compare', description: 'Compare requirements across target markets.', route: '/jurisdiction' as const },
  { icon: 'sliders' as const, title: 'What-If Simulator', description: 'See how a product change affects your path.', route: '/simulator' as const },
  { icon: 'briefcase' as const, title: 'IP Portfolio', description: 'Keep your products and analyses together.', route: '/passport' as const },
  { icon: 'book-open' as const, title: 'Evidence Explorer', description: 'Follow every conclusion back to its source.', route: '/evidence' as const },
];

export default function ToolsScreen() {
  const colors = useColors();
  const router = useRouter();
  return (
    <AppScreen>
      <BrandHeader action={<LanguagePill />} />
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>IP Tools</Text>
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>Focused tools for every step from idea to market.</Text>
      <SectionTitle title="Your toolkit" action={`${tools.length} tools`} />
      <View style={styles.toolsGrid}>
        {tools.map((tool, index) => <ToolCard key={tool.title} {...tool} accent={index % 3 === 0 ? 'saffron' : 'sage'} onPress={() => router.push(tool.route)} />)}
      </View>
    </AppScreen>
  );
}