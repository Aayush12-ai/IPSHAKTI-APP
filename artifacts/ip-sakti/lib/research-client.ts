import AsyncStorage from '@react-native-async-storage/async-storage';

const CLIENT_ID_KEY = '@ip-sakti/research-client-id';
const ACTIVE_PROJECT_KEY = '@ip-sakti/active-project-id';

export async function getResearchClientId(): Promise<string> {
  const stored = await AsyncStorage.getItem(CLIENT_ID_KEY);
  if (stored) return stored;

  const generated = `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  await AsyncStorage.setItem(CLIENT_ID_KEY, generated);
  return generated;
}

export async function getActiveProjectId(): Promise<string | null> {
  return AsyncStorage.getItem(ACTIVE_PROJECT_KEY);
}

export async function setActiveProjectId(projectId: string | null): Promise<void> {
  if (projectId) {
    await AsyncStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
  } else {
    await AsyncStorage.removeItem(ACTIVE_PROJECT_KEY);
  }
}