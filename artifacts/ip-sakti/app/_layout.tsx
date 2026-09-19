import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { setBaseUrl } from '@workspace/api-client-react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveApiBaseUrl(): string {
  const customApiUrl = process.env.EXPO_PUBLIC_API_URL;
  const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;

  if (apiDomain) {
    return `https://${apiDomain}`;
  }

  // When running on physical device in Expo Go, resolve development machine LAN IP
  if (Platform.OS !== 'web') {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest?.debuggerHost ||
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

    if (hostUri) {
      const hostIp = hostUri.split(':')[0];
      if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
        return `http://${hostIp}:3000`;
      }
    }
  }

  if (customApiUrl) {
    return customApiUrl.replace(/\/+$/, '');
  }

  return 'http://localhost:3000';
}

const resolvedBaseUrl = resolveApiBaseUrl();
setBaseUrl(resolvedBaseUrl);

const queryClient = new QueryClient();

import { ThemeProvider } from '@/hooks/useColors';
import { LanguageProvider } from '@/hooks/useLanguage';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LanguageModal } from '@/components/LanguageModal';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const firstSegment = segments[0] as string | undefined;
    const inLogin = firstSegment === 'login';

    if (!isAuthenticated && !inLogin) {
      router.replace('/login' as any);
    } else if (isAuthenticated && inLogin) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="research" options={{ headerShown: false }} />
      <Stack.Screen name="formula-analyzer" options={{ headerShown: false }} />
      <Stack.Screen name="classify" options={{ headerShown: false }} />
      <Stack.Screen name="abs" options={{ headerShown: false }} />
      <Stack.Screen name="jurisdiction" options={{ headerShown: false }} />
      <Stack.Screen name="radar" options={{ headerShown: false }} />
      <Stack.Screen name="simulator" options={{ headerShown: false }} />
      <Stack.Screen name="evidence" options={{ headerShown: false }} />
    </Stack>
  );
}


export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            <ErrorBoundary>
              <QueryClientProvider client={queryClient}>
                <GestureHandlerRootView>
                  <KeyboardProvider>
                    <RootLayoutNav />
                    <LanguageModal />
                  </KeyboardProvider>
                </GestureHandlerRootView>
              </QueryClientProvider>
            </ErrorBoundary>
          </SafeAreaProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

