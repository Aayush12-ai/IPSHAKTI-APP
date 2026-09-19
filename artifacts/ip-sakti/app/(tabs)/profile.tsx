import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppScreen, BrandHeader, LanguagePill, SectionTitle, SurfaceCard, styles } from '@/components/ip-sakti';
import { useColors } from '@/hooks/useColors';

const items = [
  ['user', 'My profile', 'Practitioner & innovator'],
  ['globe', 'Preferred language', 'English'],
  ['briefcase', 'My Research', 'Projects & research history'],
  ['bookmark', 'Saved analyses', '4 saved'],
  ['package', 'My products', '2 products'],
  ['briefcase', 'IP portfolio', '1 active passport'],
  ['bell', 'Notifications', 'Up to date'],
];

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  return (
    <AppScreen>
      <BrandHeader action={<LanguagePill />} />
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>Profile</Text>
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>Your workspace for Ayurvedic innovation.</Text>
      <SurfaceCard style={{ marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 13 }}>
        <View style={{ width: 48, height: 48, borderRadius: 17, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.primaryForeground, fontSize: 17, fontWeight: '700' }}>AJ</Text></View>
        <View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontSize: 15, fontWeight: '700' }}>Aayush Jaiswal</Text><Text style={{ color: colors.inkSubtle, fontSize: 11, marginTop: 3 }}>Independent practitioner</Text></View>
        <Feather name="edit-2" size={16} color={colors.forest} />
      </SurfaceCard>
      <SectionTitle title="Workspace" />
      <SurfaceCard style={{ paddingVertical: 3 }}>
        {items.map(([icon, title, subtitle], index) => (
          <Pressable key={title} onPress={() => title === 'My Research' && router.push('/research')} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: index === items.length - 1 ? 0 : 1, borderBottomColor: colors.border, opacity: pressed ? 0.65 : 1 }]}>
            <Feather name={icon as never} size={17} color={colors.forest} style={{ width: 31 }} />
            <View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '600' }}>{title}</Text><Text style={{ color: colors.inkSubtle, fontSize: 11, marginTop: 2 }}>{subtitle}</Text></View>
            <Feather name="chevron-right" size={16} color={colors.inkSubtle} />
          </Pressable>
        ))}
      </SurfaceCard>
      <SectionTitle title="Support & safety" />
      {['Privacy & security', 'Connect with an expert'].map((item) => (
        <SurfaceCard key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <Feather name={item.startsWith('Privacy') ? 'lock' : 'headphones'} size={17} color={colors.forest} />
          <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '600', flex: 1 }}>{item}</Text>
          <Feather name="arrow-up-right" size={16} color={colors.inkSubtle} />
        </SurfaceCard>
      ))}
      <Text style={{ color: colors.inkSubtle, fontSize: 10, textAlign: 'center', marginTop: 18 }}>IP SAKTI v0.1  ·  Built for responsible innovation</Text>
    </AppScreen>
  );
}