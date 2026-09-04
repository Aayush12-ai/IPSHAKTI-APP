import React, { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

type IconName = React.ComponentProps<typeof Feather>['name'];

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
  const style = [styles.screenContent, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 102 }, contentStyle];
  if (!scroll) return <View style={[styles.screen, { backgroundColor: colors.canvas }, style]}>{children}</View>;
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
        <View style={[styles.brandMark, { backgroundColor: colors.forest }]}>
          <Feather name="shield" size={16} color={colors.primaryForeground} />
        </View>
        <View>
          <Text style={[styles.brandName, { color: colors.foreground }]}>IP SAKTI</Text>
          <Text style={[styles.brandSub, { color: colors.inkSubtle }]}>AYURVEDIC IP COPILOT</Text>
        </View>
      </View>
      {action}
    </View>
  );
}

export function LanguagePill() {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => Haptics.selectionAsync()}
      style={({ pressed }) => [styles.languagePill, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.72 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel="Choose language"
    >
      <Ionicons name="language-outline" size={15} color={colors.forest} />
      <Text style={[styles.languageText, { color: colors.forest }]}>EN</Text>
      <Feather name="chevron-down" size={14} color={colors.inkSubtle} />
    </Pressable>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  const colors = useColors();
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action ? <Text style={[styles.sectionAction, { color: colors.forest }]}>{action}</Text> : null}
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
  const content = <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>{children}</View>;
  if (!onPress) return content;
  return (
    <Pressable
      testID={testID}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [{ opacity: pressed ? 0.78 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

export function IconCircle({ icon, color, background }: { icon: IconName; color?: string; background?: string }) {
  const colors = useColors();
  return (
    <View style={[styles.iconCircle, { backgroundColor: background ?? colors.sageLight }]}>
      <Feather name={icon} size={18} color={color ?? colors.forest} />
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
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  const colors = useColors();
  const palette = variant === 'primary'
    ? { bg: colors.forest, fg: colors.primaryForeground, border: colors.forest }
    : variant === 'secondary'
      ? { bg: colors.sageLight, fg: colors.forest, border: colors.sageLight }
      : { bg: 'transparent', fg: colors.forest, border: colors.border };
  return (
    <Pressable
      testID={`button-${label.toLowerCase().replace(/\s+/g, '-')}`}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      disabled={loading}
      style={({ pressed }) => [styles.primaryButton, { backgroundColor: palette.bg, borderColor: palette.border, opacity: pressed || loading ? 0.7 : 1 }]}
    >
      {loading ? <ActivityIndicator color={palette.fg} size="small" /> : <Text style={[styles.primaryButtonText, { color: palette.fg }]}>{label}</Text>}
      {!loading && <Feather name={icon} size={16} color={palette.fg} />}
    </Pressable>
  );
}

export function QueryComposer({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Ask about your formulation, patent or market...',
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
        <Pressable style={[styles.composerIconButton, { backgroundColor: colors.surfaceMuted }]} onPress={() => Haptics.selectionAsync()}>
          <Feather name="mic" size={17} color={colors.forest} />
        </Pressable>
        <Pressable
          testID="send-query"
          onPress={onSubmit}
          style={({ pressed }) => [styles.sendButton, { backgroundColor: colors.forest, opacity: pressed ? 0.72 : 1 }]}
        >
          <Feather name="arrow-up" size={18} color={colors.primaryForeground} />
        </Pressable>
      </View>
    </View>
  );
}

export function StatusBadge({ label, tone = 'success' }: { label: string; tone?: 'success' | 'warning' | 'attention' | 'neutral' }) {
  const colors = useColors();
  const palette = {
    success: { bg: '#E5F3EA', fg: colors.success, dot: colors.success },
    warning: { bg: colors.saffronLight, fg: colors.warning, dot: colors.saffron },
    attention: { bg: '#F9E6E4', fg: colors.destructive, dot: colors.destructive },
    neutral: { bg: colors.surfaceMuted, fg: colors.inkSubtle, dot: colors.inkSubtle },
  }[tone];
  return (
    <View style={[styles.statusBadge, { backgroundColor: palette.bg }]}>
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
  accent = 'sage',
}: {
  icon: IconName;
  title: string;
  description: string;
  onPress: () => void;
  accent?: 'sage' | 'saffron';
}) {
  const colors = useColors();
  return (
    <SurfaceCard onPress={onPress} style={styles.toolCard}>
      <IconCircle icon={icon} background={accent === 'saffron' ? colors.saffronLight : colors.sageLight} color={accent === 'saffron' ? colors.warning : colors.forest} />
      <Text style={[styles.toolTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.toolDescription, { color: colors.inkSubtle }]}>{description}</Text>
      <Feather name="arrow-up-right" size={16} color={colors.forest} style={styles.toolArrow} />
    </SurfaceCard>
  );
}

export function EvidenceCard({ title, section, version }: { title: string; section: string; version: string }) {
  const colors = useColors();
  return (
    <View style={[styles.evidenceCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
      <View style={styles.evidenceIcon}><Feather name="book-open" size={15} color={colors.forest} /></View>
      <View style={styles.evidenceCopy}>
        <Text style={[styles.evidenceTitle, { color: colors.foreground }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.evidenceMeta, { color: colors.inkSubtle }]}>{section}  ·  {version}</Text>
      </View>
      <Feather name="external-link" size={15} color={colors.inkSubtle} />
    </View>
  );
}

export function BackHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const colors = useColors();
  return (
    <View style={styles.backHeader}>
      <Pressable onPress={() => Haptics.selectionAsync()} style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="arrow-left" size={18} color={colors.foreground} />
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
  screenContent: { paddingHorizontal: 20 },
  brandHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: 16, fontWeight: '700', letterSpacing: 1.1 },
  brandSub: { fontSize: 8, fontWeight: '600', letterSpacing: 1.2, marginTop: 2 },
  languagePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  languageText: { fontSize: 12, fontWeight: '700' },
  greeting: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  pageTitle: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, lineHeight: 34 },
  pageSubtitle: { fontSize: 14, lineHeight: 21, marginTop: 7 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 27 },
  sectionTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  sectionAction: { fontSize: 12, fontWeight: '700' },
  card: { borderRadius: 18, borderWidth: 1, padding: 16 },
  heroCard: { borderRadius: 22, padding: 18, marginTop: 22, overflow: 'hidden' },
  heroLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 },
  heroTitle: { fontSize: 21, fontWeight: '700', lineHeight: 27, marginBottom: 14 },
  heroDecor: { position: 'absolute', right: -24, top: -38, width: 120, height: 120, borderRadius: 60, opacity: 0.12 },
  composer: { borderWidth: 1, borderRadius: 16, padding: 12, minHeight: 112 },
  composerInput: { minHeight: 53, fontSize: 14, lineHeight: 20, paddingHorizontal: 2, textAlignVertical: 'top' },
  composerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 7 },
  composerIconButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  sendButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 11 },
  quickGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: { width: '48.2%', minHeight: 112 },
  quickIcon: { marginBottom: 11 },
  quickTitle: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  quickText: { fontSize: 11, lineHeight: 16 },
  iconCircle: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  analysisCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  analysisGlyph: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  analysisTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  analysisMeta: { fontSize: 11 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  primaryButton: { minHeight: 46, borderRadius: 13, borderWidth: 1, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryButtonText: { fontSize: 13, fontWeight: '700' },
  toolCard: { width: '48.2%', minHeight: 170, marginBottom: 10 },
  toolTitle: { fontSize: 13, fontWeight: '700', marginTop: 14, marginBottom: 5 },
  toolDescription: { fontSize: 11, lineHeight: 16 },
  toolArrow: { position: 'absolute', right: 14, bottom: 15 },
  toolsGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  backHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  backButton: { width: 38, height: 38, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  backTitleWrap: { flex: 1 },
  backTitle: { fontSize: 20, fontWeight: '700' },
  backSubtitle: { fontSize: 12, marginTop: 3 },
  evidenceCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 13, borderWidth: 1, padding: 11, marginTop: 10 },
  evidenceIcon: { width: 29, height: 29, borderRadius: 9, backgroundColor: '#E2EFE6', alignItems: 'center', justifyContent: 'center' },
  evidenceCopy: { flex: 1 },
  evidenceTitle: { fontSize: 12, fontWeight: '700' },
  evidenceMeta: { fontSize: 10, marginTop: 3 },
});