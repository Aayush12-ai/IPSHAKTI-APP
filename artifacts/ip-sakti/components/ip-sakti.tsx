import React, { ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

type IconName = React.ComponentProps<typeof Feather>['name'];

export function BrandLogo({ size = 38 }: { size?: number }) {
  return (
    <Image
      source={require('@/assets/images/ip-sakti-logo.png')}
      style={{
        width: size,
        height: size,
        borderRadius: size > 40 ? 14 : 10,
        backgroundColor: '#FFFFFF',
      }}
      resizeMode="contain"
    />
  );
}

export function AppScreen({
  children,
  scroll = true,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const style = [
    styles.screenContent,
    { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 98 },
    contentStyle,
  ];

  if (!scroll) {
    return <View style={[styles.screen, { backgroundColor: colors.canvas }, style]}>{children}</View>;
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.canvas }]}
      contentContainerStyle={style}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function BrandHeader({ action }: { action?: ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.brandHeader}>
      <View style={styles.brandLockup}>
        <View style={[styles.brandMark, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }]}>
          <Image
            source={require('@/assets/images/ip-sakti-logo.png')}
            style={{ width: 36, height: 36 }}
            resizeMode="contain"
          />
        </View>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.brandName, { color: colors.foreground }]}>IP-SAKTI</Text>
            <View style={[styles.brandBadge, { backgroundColor: colors.lavenderLight }]}>
              <Text style={{ color: colors.lavenderDeep, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>
                AI SAHAYAK
              </Text>
            </View>
          </View>
          <Text style={[styles.brandSub, { color: colors.inkSubtle }]}>
            TRADITIONAL WISDOM · LEGAL CLARITY
          </Text>
        </View>
      </View>
      {action}
    </View>
  );
}

import { useTheme } from '@/hooks/useColors';

export function ThemeTogglePill() {
  const colors = useColors();
  const { theme, toggleTheme } = useTheme();

  const iconName: React.ComponentProps<typeof Feather>['name'] =
    theme === 'dark' ? 'moon' : theme === 'herbal' ? 'sun' : 'sun';

  const themeLabel =
    theme === 'dark' ? 'Dark' : theme === 'herbal' ? 'Herbal' : 'Light';

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        toggleTheme();
      }}
      style={({ pressed }) => [
        styles.languagePill,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Current theme: ${themeLabel}. Tap to change theme.`}
    >
      <Feather
        name={iconName}
        size={13}
        color={theme === 'dark' ? colors.lavender : theme === 'herbal' ? colors.success : colors.pink}
      />
      <Text style={[styles.languageText, { color: colors.foreground }]}>{themeLabel}</Text>
    </Pressable>
  );
}

export function HeaderActions() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <ThemeTogglePill />
      <LanguagePill />
    </View>
  );
}

export function LanguagePill() {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => Haptics.selectionAsync()}
      style={({ pressed }) => [
        styles.languagePill,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Choose language"
    >
      <Ionicons name="language-outline" size={14} color={colors.lavender} />
      <Text style={[styles.languageText, { color: colors.foreground }]}>EN</Text>
    </Pressable>
  );
}

export function SectionTitle({
  title,
  action,
  onActionPress,
}: {
  title: string;
  action?: string;
  onActionPress?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action ? (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <Text style={[styles.sectionAction, { color: colors.pink }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function SurfaceCard({
  children,
  style,
  onPress,
  testID,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  testID?: string;
}) {
  const colors = useColors();
  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    style,
  ];

  if (!onPress) return <View style={cardStyle}>{children}</View>;

  return (
    <Pressable
      testID={testID}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [...cardStyle, { opacity: pressed ? 0.82 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }]}
    >
      {children}
    </Pressable>
  );
}

export function IconCircle({
  icon,
  color,
  background,
}: {
  icon: IconName;
  color?: string;
  background?: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.iconCircle, { backgroundColor: background ?? colors.lavenderLight }]}>
      <Feather name={icon} size={18} color={color ?? colors.lavenderDeep} />
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon = 'arrow-up-right',
  loading = false,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  loading?: boolean;
  variant?: 'primary' | 'pink' | 'secondary' | 'ghost' | 'noir';
}) {
  const colors = useColors();
  const palette =
    variant === 'pink'
      ? { bg: colors.pink, fg: '#FFFFFF', border: colors.pink }
      : variant === 'noir'
        ? { bg: colors.black, fg: '#FFFFFF', border: colors.black }
        : variant === 'secondary'
          ? { bg: colors.lavenderLight, fg: colors.lavenderDeep, border: colors.lavenderBorder }
          : variant === 'ghost'
            ? { bg: 'transparent', fg: colors.lavenderDeep, border: colors.border }
            : { bg: colors.lavenderDeep, fg: '#FFFFFF', border: colors.lavenderDeep };

  return (
    <Pressable
      testID={`button-${label.toLowerCase().replace(/\s+/g, '-')}`}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      disabled={loading}
      style={({ pressed }) => [
        styles.primaryButton,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: pressed || loading ? 0.8 : 1,
          transform: [{ scale: pressed && !loading ? 0.985 : 1 }],
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} size="small" />
      ) : (
        <Text style={[styles.primaryButtonText, { color: palette.fg }]}>{label}</Text>
      )}
      {!loading && <Feather name={icon} size={15} color={palette.fg} />}
    </Pressable>
  );
}

export function QueryComposer({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Ask anything on Ayurvedic IP, formulations, patents or ABS...',
}: {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.composer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TextInput
        testID="query-input"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkSubtle}
        multiline
        style={[styles.composerInput, { color: colors.foreground }]}
        returnKeyType="send"
        onSubmitEditing={onSubmit}
      />
      <View style={styles.composerFooter}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Pressable
            style={[styles.composerIconButton, { backgroundColor: colors.lavenderLight }]}
            onPress={() => Haptics.selectionAsync()}
          >
            <Feather name="mic" size={15} color={colors.lavenderDeep} />
          </Pressable>
          <Pressable
            style={[styles.composerIconButton, { backgroundColor: colors.pinkLight }]}
            onPress={() => Haptics.selectionAsync()}
          >
            <Ionicons name="sparkles" size={14} color={colors.pink} />
          </Pressable>
        </View>
        <Pressable
          testID="send-query"
          onPress={onSubmit}
          style={({ pressed }) => [
            styles.sendButton,
            { backgroundColor: colors.black, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Feather name="arrow-up" size={17} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

export function StatusBadge({
  label,
  tone = 'success',
}: {
  label: string;
  tone?: 'success' | 'warning' | 'attention' | 'lavender' | 'pink' | 'neutral';
}) {
  const colors = useColors();
  const palette = {
    success: { bg: '#ECFDF5', fg: '#059669', dot: '#10B981', border: '#A7F3D0' },
    warning: { bg: '#FFFBEB', fg: '#D97706', dot: '#F59E0B', border: '#FDE68A' },
    attention: { bg: '#FFF1F2', fg: '#E11D48', dot: '#F43F5E', border: '#FECDD3' },
    lavender: { bg: colors.lavenderLight, fg: colors.lavenderDeep, dot: colors.lavender, border: colors.lavenderBorder },
    pink: { bg: colors.pinkLight, fg: colors.pink, dot: colors.pink, border: colors.pinkBorder },
    neutral: { bg: colors.surfaceMuted, fg: colors.inkSubtle, dot: colors.inkSubtle, border: colors.border },
  }[tone];

  return (
    <View style={[styles.statusBadge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <View style={[styles.statusDot, { backgroundColor: palette.dot }]} />
      <Text style={[styles.statusText, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

export function ToolCard({
  icon,
  title,
  description,
  onPress,
  accent = 'lavender',
}: {
  icon: IconName;
  title: string;
  description: string;
  onPress: () => void;
  accent?: 'lavender' | 'pink' | 'sage' | 'saffron';
}) {
  const colors = useColors();
  const isPink = accent === 'pink' || accent === 'saffron';
  const iconBg = isPink ? colors.pinkLight : colors.lavenderLight;
  const iconFg = isPink ? colors.pink : colors.lavenderDeep;

  return (
    <SurfaceCard onPress={onPress} style={styles.toolCard}>
      <IconCircle icon={icon} background={iconBg} color={iconFg} />
      <Text style={[styles.toolTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.toolDescription, { color: colors.inkSubtle }]}>{description}</Text>
      <View style={[styles.toolArrowWrap, { backgroundColor: iconBg }]}>
        <Feather name="arrow-up-right" size={13} color={iconFg} />
      </View>
    </SurfaceCard>
  );
}

export function EvidenceCard({
  title,
  section,
  version,
}: {
  title: string;
  section: string;
  version: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.evidenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.evidenceIcon, { backgroundColor: colors.lavenderLight }]}>
        <Feather name="book-open" size={14} color={colors.lavenderDeep} />
      </View>
      <View style={styles.evidenceCopy}>
        <Text style={[styles.evidenceTitle, { color: colors.foreground }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.evidenceMeta, { color: colors.inkSubtle }]}>
          {section}  ·  {version}
        </Text>
      </View>
      <Feather name="external-link" size={14} color={colors.inkSubtle} />
    </View>
  );
}

export function BackHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const colors = useColors();
  return (
    <View style={styles.backHeader}>
      <Pressable
        onPress={() => Haptics.selectionAsync()}
        style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Feather name="arrow-left" size={17} color={colors.foreground} />
      </Pressable>
      <View style={styles.backTitleWrap}>
        <Text style={[styles.backTitle, { color: colors.foreground }]}>{title}</Text>
        {subtitle ? <Text style={[styles.backSubtitle, { color: colors.inkSubtle }]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenContent: { paddingHorizontal: 18 },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 16, fontWeight: '800', letterSpacing: 0.8 },
  brandBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  brandSub: { fontSize: 8.5, fontWeight: '700', letterSpacing: 1.1, marginTop: 2 },
  languagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  languageText: { fontSize: 11.5, fontWeight: '700' },
  greeting: { fontSize: 12.5, fontWeight: '600', marginBottom: 4 },
  pageTitle: { fontSize: 27, fontWeight: '800', letterSpacing: -0.6, lineHeight: 33 },
  pageSubtitle: { fontSize: 13.5, lineHeight: 20, marginTop: 6 },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
    marginTop: 24,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  sectionAction: { fontSize: 12, fontWeight: '700' },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 15,
    shadowColor: '#1A0B2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  heroCard: {
    borderRadius: 20,
    padding: 18,
    marginTop: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#262438',
  },
  heroLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginBottom: 7 },
  heroTitle: { fontSize: 20, fontWeight: '800', lineHeight: 26, marginBottom: 14 },
  heroDecor: {
    position: 'absolute',
    right: -25,
    top: -35,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  composer: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 12,
    minHeight: 110,
  },
  composerInput: {
    minHeight: 52,
    fontSize: 13.5,
    lineHeight: 19,
    paddingHorizontal: 2,
    textAlignVertical: 'top',
  },
  composerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  composerIconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  sendButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  quickGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  quickCard: { width: '48.5%', minHeight: 110 },
  quickTitle: { fontSize: 12.5, fontWeight: '700', marginTop: 10, marginBottom: 2 },
  quickText: { fontSize: 10.5, lineHeight: 15 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 9,
  },
  analysisGlyph: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisTitle: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  analysisMeta: { fontSize: 10.5 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 9.5, fontWeight: '800' },
  primaryButton: {
    minHeight: 46,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  primaryButtonText: { fontSize: 13, fontWeight: '700' },
  toolCard: { width: '48.5%', minHeight: 165, marginBottom: 9 },
  toolTitle: { fontSize: 12.5, fontWeight: '800', marginTop: 12, marginBottom: 4 },
  toolDescription: { fontSize: 10.5, lineHeight: 15 },
  toolArrowWrap: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  backHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 20 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backTitleWrap: { flex: 1 },
  backTitle: { fontSize: 19, fontWeight: '800' },
  backSubtitle: { fontSize: 11.5, marginTop: 2 },
  evidenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 13,
    borderWidth: 1,
    padding: 11,
    marginTop: 9,
  },
  evidenceIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceCopy: { flex: 1 },
  evidenceTitle: { fontSize: 12, fontWeight: '700' },
  evidenceMeta: { fontSize: 10, marginTop: 2 },
});