import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors, useTheme } from '@/hooks/useColors';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { LanguagePill, ThemeTogglePill } from '@/components/ip-sakti';

export default function LoginScreen() {
  const colors = useColors();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (idToUse?: string, passToUse?: string) => {
    const id = idToUse !== undefined ? idToUse : userId;
    const pass = passToUse !== undefined ? passToUse : password;

    setErrorMessage('');
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await login(id, pass);
      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrorMessage(res.error || 'Invalid credentials.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    Haptics.selectionAsync();
    setUserId('123');
    setPassword('123');
    setErrorMessage('');
  };

  const handleDemoOneTapLogin = () => {
    setUserId('123');
    setPassword('123');
    handleLogin('123', '123');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      {/* Background Decorative Gradient Blobs */}
      <View
        style={[
          styles.glowBlob1,
          {
            backgroundColor: colors.lavenderDeep,
            opacity: theme === 'dark' ? 0.35 : 0.12,
          },
        ]}
      />
      <View
        style={[
          styles.glowBlob2,
          {
            backgroundColor: colors.pink,
            opacity: theme === 'dark' ? 0.25 : 0.1,
          },
        ]}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 30 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Controls */}
          <View style={styles.topBar}>
            <View style={styles.brandBadgeSmall}>
              <View style={[styles.statusDot, { backgroundColor: colors.lavender }]} />
              <Text style={[styles.badgeText, { color: colors.lavenderDeep }]}>
                AYUSH IP GATEWAY
              </Text>
            </View>
            <View style={styles.topActions}>
              <ThemeTogglePill />
              <LanguagePill />
            </View>
          </View>

          {/* Hero Branding Lockup */}
          <View style={styles.heroSection}>
            <View
              style={[
                styles.logoCard,
                {
                  backgroundColor: '#FFFFFF',
                  borderColor: colors.lavenderBorder,
                  shadowColor: colors.lavenderDeep,
                },
              ]}
            >
              <Image
                source={require('@/assets/images/ip-sakti-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <Text style={[styles.brandTitle, { color: colors.foreground }]}>IP-SAKTI</Text>
            <View style={[styles.sahayakPill, { backgroundColor: colors.lavenderLight }]}>
              <Ionicons name="sparkles" size={13} color={colors.lavenderDeep} />
              <Text style={[styles.sahayakText, { color: colors.lavenderDeep }]}>
                {t('aiSahayak', 'AI SAHAYAK PORTAL')}
              </Text>
            </View>

            <Text style={[styles.tagline, { color: colors.inkSubtle }]}>
              Traditional Ayurvedic Wisdom Meets Modern IP & Regulatory Intelligence
            </Text>
          </View>

          {/* Main Login Card */}
          <View
            style={[
              styles.authCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: '#1A0B2E',
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Innovator Login</Text>
              <Text style={[styles.cardSubtitle, { color: colors.inkSubtle }]}>
                Sign in with your registered AYUSH Practitioner ID
              </Text>
            </View>

            {/* Error Banner */}
            {errorMessage ? (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: colors.destructiveForeground ? '#FEF2F2' : '#450A0A',
                    borderColor: '#FCA5A5',
                  },
                ]}
              >
                <Feather name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Input: User ID */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.foreground }]}>User ID</Text>
              <View
                style={[
                  styles.inputFieldWrap,
                  {
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="user" size={17} color={colors.lavender} style={styles.inputIcon} />
                <TextInput
                  testID="login-userid-input"
                  style={[styles.textInput, { color: colors.foreground }]}
                  placeholder="Enter ID (e.g. 123)"
                  placeholderTextColor={colors.inkSubtle}
                  value={userId}
                  onChangeText={(text) => {
                    setUserId(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Input: Password */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>Password</Text>
              </View>
              <View
                style={[
                  styles.inputFieldWrap,
                  {
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="lock" size={17} color={colors.lavender} style={styles.inputIcon} />
                <TextInput
                  testID="login-password-input"
                  style={[styles.textInput, { color: colors.foreground }]}
                  placeholder="Enter Password (e.g. 123)"
                  placeholderTextColor={colors.inkSubtle}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={() => handleLogin()}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                  style={styles.eyeIconWrap}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={17}
                    color={colors.inkSubtle}
                  />
                </Pressable>
              </View>
            </View>

            {/* Demo Credentials Helper Pill */}
            <View
              style={[
                styles.demoHelperBox,
                { backgroundColor: colors.lavenderLight, borderColor: colors.lavenderBorder },
              ]}
            >
              <View style={styles.demoHelperLeft}>
                <Feather name="key" size={15} color={colors.lavenderDeep} />
                <View>
                  <Text style={[styles.demoHelperTitle, { color: colors.lavenderDeep }]}>
                    Active Testing Credentials
                  </Text>
                  <Text style={[styles.demoHelperCode, { color: colors.foreground }]}>
                    ID: <Text style={{ fontWeight: '800' }}>123</Text> · Pass:{' '}
                    <Text style={{ fontWeight: '800' }}>123</Text>
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={fillDemoCredentials}
                style={({ pressed }) => [
                  styles.fillButton,
                  { backgroundColor: colors.card, opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <Text style={[styles.fillButtonText, { color: colors.lavenderDeep }]}>Auto Fill</Text>
              </Pressable>
            </View>

            {/* Login Submit Button */}
            <Pressable
              testID="login-submit-button"
              onPress={() => handleLogin()}
              disabled={loading}
              style={({ pressed }) => [
                styles.loginButton,
                {
                  backgroundColor: colors.lavenderDeep,
                  borderColor: colors.lavenderBorder,
                  opacity: pressed || loading ? 0.82 : 1,
                  transform: [{ scale: pressed && !loading ? 0.985 : 1 }],
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Sign In to IP-SAKTI</Text>
                  <Feather name="arrow-right" size={17} color="#FFFFFF" />
                </>
              )}
            </Pressable>

            {/* 1-Tap Quick Demo Action */}
            <Pressable
              onPress={handleDemoOneTapLogin}
              style={({ pressed }) => [
                styles.oneTapDemoBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceMuted,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Ionicons name="flash-outline" size={15} color={colors.pink} />
              <Text style={[styles.oneTapDemoText, { color: colors.foreground }]}>
                1-Tap Instant Demo Access (123 / 123)
              </Text>
            </Pressable>
          </View>

          {/* Security & Feature Badges */}
          <View style={styles.featurePillsWrap}>
            <View
              style={[
                styles.featurePill,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Feather name="shield" size={13} color={colors.success} />
              <Text style={[styles.featurePillText, { color: colors.inkSubtle }]}>
                256-bit Encrypted
              </Text>
            </View>
            <View
              style={[
                styles.featurePill,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <MaterialCommunityIcons name="leaf" size={14} color={colors.lavender} />
              <Text style={[styles.featurePillText, { color: colors.inkSubtle }]}>
                TKDL & AYUSH Ready
              </Text>
            </View>
            <View
              style={[
                styles.featurePill,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Feather name="lock" size={13} color={colors.pink} />
              <Text style={[styles.featurePillText, { color: colors.inkSubtle }]}>
                Protected Workspace
              </Text>
            </View>
          </View>

          {/* Footer Note */}
          <Text style={[styles.footerNote, { color: colors.inkSubtle }]}>
            IP-SAKTI Sahayak v1.0 · Dedicated to Ayurvedic Innovation & Evidence-Grounded IP Protection
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowBlob1: {
    position: 'absolute',
    top: -80,
    right: -70,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  glowBlob2: {
    position: 'absolute',
    top: 250,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCard: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  logoImage: {
    width: 58,
    height: 58,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sahayakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  sahayakText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  tagline: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 290,
  },
  authCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputFieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 10,
  },
  eyeIconWrap: {
    padding: 6,
  },
  demoHelperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 16,
  },
  demoHelperLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  demoHelperTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  demoHelperCode: {
    fontSize: 12,
    marginTop: 1,
  },
  fillButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  fillButtonText: {
    fontSize: 11,
    fontWeight: '800',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  oneTapDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 1,
  },
  oneTapDemoText: {
    fontSize: 12,
    fontWeight: '700',
  },
  featurePillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
    marginBottom: 14,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  featurePillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  footerNote: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 6,
    maxWidth: 320,
  },
});
