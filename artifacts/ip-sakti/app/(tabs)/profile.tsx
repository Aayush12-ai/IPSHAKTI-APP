import React from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import {
  AppScreen,
  BrandHeader,
  HeaderActions,
  LanguagePill,
  SectionTitle,
  StatusBadge,
  SurfaceCard,
  styles,
} from '@/components/ip-sakti';
import { useColors, useTheme } from '@/hooks/useColors';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const colors = useColors();
  const { theme, setTheme } = useTheme();
  const { t, languageInfo, openLanguageModal } = useLanguage();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const performLogout = async () => {
      await logout();
      router.replace('/login' as any);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out of IP-SAKTI?')) {
        performLogout();
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out of IP-SAKTI?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: performLogout,
          },
        ],
        { cancelable: true }
      );
    }
  };

  const items = [
    ['user', 'My Profile & Credentials', 'Ayurvedic Practitioner & Innovator'],
    ['globe', t('languageTitle', 'Preferred Language'), `${languageInfo.nativeName} (${languageInfo.name})`],
    ['briefcase', 'My Research Workspace', 'Projects, findings & grounded memory'],
    ['bookmark', 'Saved Analyses & Citations', '4 active items'],
    ['package', 'My Ayurvedic Products', '2 registered drafts'],
    ['shield', 'IP Readiness Portfolio', '1 active passport (78/100)'],
    ['bell', 'Regulatory Notifications', 'Up to date with AYUSH & FSSAI'],
  ];

  return (
    <AppScreen>
      <BrandHeader action={<HeaderActions />} />
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>{t('profileTitle', 'Innovator Profile')}</Text>
      <Text style={[styles.pageSubtitle, { color: colors.inkSubtle }]}>
        {t('profileSubtitle', 'Your dedicated workspace for responsible Ayurvedic innovation.')}
      </Text>

      {/* User Header Card */}
      <SurfaceCard style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderColor: colors.lavenderBorder }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 16,
            backgroundColor: colors.lavenderDeep,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: colors.lavenderBorder,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800' }}>
            {user?.avatarInitials || 'AJ'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground, fontSize: 15.5, fontWeight: '800' }}>
            {user?.name || 'Aayush Jaiswal'}
          </Text>
          <Text style={{ color: colors.pink, fontSize: 11, fontWeight: '700', marginTop: 2 }}>
            {user?.role || 'Registered Innovator · India AYUSH'}
          </Text>
          <Text style={{ color: colors.inkSubtle, fontSize: 10, marginTop: 1 }}>
            ID: #{user?.id || '123'} · {user?.email || 'innovator123@ipsakti.gov.in'}
          </Text>
        </View>
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.lavenderLight, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="shield" size={15} color={colors.lavenderDeep} />
        </View>
      </SurfaceCard>

      {/* Language Selector Card */}
      <SectionTitle title={t('languageTitle', 'Language & Script (भाषा)')} />
      <SurfaceCard
        onPress={() => {
          Haptics.selectionAsync();
          openLanguageModal();
        }}
        style={{
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: colors.lavenderLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="language" size={20} color={colors.lavenderDeep} />
          </View>
          <View>
            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '800' }}>
              {languageInfo.nativeName} ({languageInfo.name})
            </Text>
            <Text style={{ color: colors.inkSubtle, fontSize: 11, marginTop: 1 }}>
              {languageInfo.ayurvedicTradition} · {languageInfo.region}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 9,
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor: colors.surfaceMuted,
          }}
        >
          <Text style={{ color: colors.lavenderDeep, fontSize: 11, fontWeight: '800' }}>
            {languageInfo.badge}
          </Text>
          <Feather name="chevron-right" size={13} color={colors.lavenderDeep} />
        </View>
      </SurfaceCard>

      {/* Theme Appearance Selector Card */}
      <SectionTitle title={t('appearanceTitle', 'App Appearance & Theme')} />
      <SurfaceCard style={{ padding: 14 }}>
        <Text style={{ color: colors.inkSubtle, fontSize: 11, marginBottom: 10, fontWeight: '600' }}>
          Select your preferred visual aesthetic:
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { id: 'light', label: 'Lavender White', icon: 'sun', sub: 'Clean & Sharp' },
            { id: 'dark', label: 'Midnight Obsidian', icon: 'moon', sub: 'Dark OLED' },
            { id: 'herbal', label: 'Ayurveda Gold', icon: 'feather', sub: 'Classical' },
          ].map((mode) => {
            const isSelected = theme === mode.id;
            return (
              <Pressable
                key={mode.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setTheme(mode.id as never);
                }}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    padding: 10,
                    borderRadius: 12,
                    borderWidth: isSelected ? 1.5 : 1,
                    borderColor: isSelected ? colors.lavenderDeep : colors.border,
                    backgroundColor: isSelected ? colors.lavenderLight : colors.card,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <Feather
                  name={mode.icon as never}
                  size={16}
                  color={isSelected ? colors.lavenderDeep : colors.inkSubtle}
                />
                <Text
                  style={{
                    color: isSelected ? colors.lavenderDeep : colors.foreground,
                    fontSize: 11,
                    fontWeight: isSelected ? '800' : '600',
                    marginTop: 4,
                    textAlign: 'center',
                  }}
                >
                  {mode.label}
                </Text>
              </Pressable>
            );
          })}
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

      {/* Session Management & Logout Button */}
      <SectionTitle title="Account Session & Security" />
      <SurfaceCard style={{ padding: 14, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View>
            <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '700' }}>
              Authenticated Session
            </Text>
            <Text style={{ color: colors.inkSubtle, fontSize: 11, marginTop: 2 }}>
              Logged in as Practitioner ID #{user?.id || '123'}
            </Text>
          </View>
          <StatusBadge label="Active" tone="success" />
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#FECDD3',
              backgroundColor: '#FFF1F2',
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <Feather name="log-out" size={16} color="#E11D48" />
          <Text style={{ color: '#E11D48', fontSize: 13, fontWeight: '800' }}>
            Sign Out of IP-SAKTI
          </Text>
        </Pressable>
      </SurfaceCard>

      <Text style={{ color: colors.inkSubtle, fontSize: 10, textAlign: 'center', marginTop: 10, marginBottom: 16 }}>
        IP-SAKTI Sahayak v1.0 · Designed for Evidence-Grounded Innovation
      </Text>
    </AppScreen>
  );
}