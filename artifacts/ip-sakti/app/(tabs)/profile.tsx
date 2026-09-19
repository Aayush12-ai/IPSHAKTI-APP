import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  AppScreen,
  BrandHeader,
  LanguagePill,
  SectionTitle,
  SurfaceCard,
  styles,
} from '@/components/ip-sakti';
import { useColors } from '@/hooks/useColors';

const items = [
  ['user', 'My Profile & Credentials', 'Ayurvedic Practitioner & Innovator'],
  ['globe', 'Preferred Language', 'English (UK / IN)'],
  ['briefcase', 'My Research Workspace', 'Projects, findings & grounded memory'],
  ['bookmark', 'Saved Analyses & Citations', '4 active items'],
  ['package', 'My Ayurvedic Products', '2 registered drafts'],
  ['shield', 'IP Readiness Portfolio', '1 active passport (78/100)'],
  ['bell', 'Regulatory Notifications', 'Up to date with AYUSH & FSSAI'],
];

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <AppScreen>
      <BrandHeader action={<LanguagePill />} />
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>Innovator Profile</Text>
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>
        Your dedicated workspace for responsible Ayurvedic innovation.
      </Text>

      {/* User Header Card */}
      <SurfaceCard style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderColor: colors.lavenderBorder }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 16,
            backgroundColor: colors.black,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: colors.pink,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800' }}>AJ</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground, fontSize: 15.5, fontWeight: '800' }}>
            Aayush Jaiswal
          </Text>
          <Text style={{ color: colors.pink, fontSize: 11, fontWeight: '700', marginTop: 2 }}>
            Registered Innovator · India AYUSH
          </Text>
        </View>
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.lavenderLight, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="edit-2" size={15} color={colors.lavenderDeep} />
        </View>
      </SurfaceCard>

      <SectionTitle title="Workspace & Portfolio" />
      <SurfaceCard style={{ paddingVertical: 3 }}>
        {items.map(([icon, title, subtitle], index) => (
          <Pressable
            key={title}
            onPress={() => {
              if (title.includes('Research')) router.push('/research');
              if (title.includes('Portfolio')) router.push('/passport');
            }}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: index === items.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
                opacity: pressed ? 0.65 : 1,
              },
            ]}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                backgroundColor: colors.lavenderLight,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 11,
              }}
            >
              <Feather name={icon as never} size={15} color={colors.lavenderDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 12.5, fontWeight: '700' }}>
                {title}
              </Text>
              <Text style={{ color: colors.inkSubtle, fontSize: 10.5, marginTop: 2 }}>
                {subtitle}
              </Text>
            </View>
            <Feather name="chevron-right" size={15} color={colors.inkSubtle} />
          </Pressable>
        ))}
      </SurfaceCard>

      <SectionTitle title="Expert Support & Safety" />
      {['Privacy & Confidentiality Protocols', 'Connect with Registered AYUSH IP Attorney'].map((item) => (
        <SurfaceCard
          key={item}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 9 }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              backgroundColor: colors.pinkLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather
              name={item.startsWith('Privacy') ? 'lock' : 'headphones'}
              size={15}
              color={colors.pink}
            />
          </View>
          <Text style={{ color: colors.foreground, fontSize: 12.5, fontWeight: '700', flex: 1 }}>
            {item}
          </Text>
          <Feather name="arrow-up-right" size={15} color={colors.inkSubtle} />
        </SurfaceCard>
      ))}

      <Text style={{ color: colors.inkSubtle, fontSize: 10, textAlign: 'center', marginTop: 18, marginBottom: 10 }}>
        IP-SAKTI Sahayak v1.0 · Designed for Evidence-Grounded Innovation
      </Text>
    </AppScreen>
  );
}