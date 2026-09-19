import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  AppScreen,
  BrandHeader,
  HeaderActions,
  LanguagePill,
  PrimaryButton,
  SectionTitle,
  StatusBadge,
  SurfaceCard,
  styles,
} from '@/components/ip-sakti';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/hooks/useLanguage';

const rows = [
  ['Patent readiness & novelty', 'Ready', 'success', 'award'],
  ['Prior-art risk (TKDL)', 'In Review', 'warning', 'search'],
  ['Traditional knowledge (Sec 3p)', 'Attention', 'attention', 'book-open'],
  ['ABS & Biodiversity clearance', 'Ready', 'success', 'globe'],
  ['Regulatory classification (ASU)', 'In Review', 'warning', 'layers'],
  ['International compliance (FDA/EMA)', 'Ready', 'success', 'map'],
] as const;

export default function PassportScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <AppScreen>
      <BrandHeader action={<HeaderActions />} />
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>{t('passportTitle', 'IP Readiness Passport')}</Text>
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>
        Ashwagandha Calm Formula · {t('passportSubtitle', 'Comprehensive IP & Statutory Diagnostic')}
      </Text>

      {/* Readiness Score Gauge */}
      <SurfaceCard style={{ marginTop: 20, alignItems: 'center', paddingVertical: 24, borderColor: colors.lavenderBorder }}>
        <View
          style={{
            width: 132,
            height: 132,
            borderRadius: 66,
            borderWidth: 12,
            borderColor: colors.lavenderLight,
            borderTopColor: colors.lavenderDeep,
            borderRightColor: colors.pink,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 36, fontWeight: '800', color: colors.foreground }}>78</Text>
          <Text style={{ fontSize: 9.5, fontWeight: '800', color: colors.pink, letterSpacing: 0.8 }}>
            OUT OF 100
          </Text>
        </View>

        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '800', marginTop: 16 }}>
          Strong Foundation · 2 Reviews Required
        </Text>
        <Text style={{ color: colors.inkSubtle, fontSize: 11.5, marginTop: 4 }}>
          Last automated statutory scan: 24 Aug 2026
        </Text>
      </SurfaceCard>

      <SectionTitle title="Readiness Overview" />
      <SurfaceCard style={{ paddingVertical: 4 }}>
        {rows.map(([label, status, tone, icon], index) => (
          <View
            key={label}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 13,
              borderBottomWidth: index === rows.length - 1 ? 0 : 1,
              borderBottomColor: colors.border,
            }}
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
              <Feather name={icon} size={15} color={colors.lavenderDeep} />
            </View>
            <Text style={{ color: colors.foreground, fontSize: 12.5, fontWeight: '600', flex: 1 }}>
              {label}
            </Text>
            <StatusBadge label={status} tone={tone} />
          </View>
        ))}
      </SurfaceCard>

      <SectionTitle title="Recommended Next Actions" />
      {[
        { title: 'Evaluate Product Classification (Rule 158B)', route: '/classify' as const },
        { title: 'Verify ABS & Biodiversity Obligations (Form I/III)', route: '/abs' as const },
        { title: 'Search Traditional Knowledge Radar (TKDL)', route: '/radar' as const },
      ].map((action, index) => (
        <SurfaceCard
          key={action.title}
          onPress={() => router.push(action.route)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 9 }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: index === 0 ? colors.pinkLight : colors.lavenderLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: index === 0 ? colors.pink : colors.lavenderDeep,
                fontSize: 12,
                fontWeight: '800',
              }}
            >
              {index + 1}
            </Text>
          </View>
          <Text style={{ color: colors.foreground, fontSize: 12.5, fontWeight: '600', flex: 1 }}>
            {action.title}
          </Text>
          <Feather name="chevron-right" size={16} color={colors.inkSubtle} />
        </SurfaceCard>
      ))}

      <View style={{ marginTop: 12 }}>
        <PrimaryButton
          label="Explore Evidence Chain"
          icon="arrow-right"
          variant="noir"
          onPress={() => router.push('/evidence')}
        />
      </View>
      <View style={{ height: 10 }} />
    </AppScreen>
  );
}