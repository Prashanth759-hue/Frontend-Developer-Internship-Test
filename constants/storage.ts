import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  AUTH_TOKEN: 'vahan360_auth_token',
  REFRESH_TOKEN: 'vahan360_refresh_token',
  USER_PHONE: 'vahan360_user_phone',
  FIRST_LAUNCH: 'vahan360_first_launch',
  LOCATION_RATIONALE_SHOWN: 'vahan360_location_rationale_shown',
} as const;

// Helper to determine if we should bypass SecureStore (true on Web)
const isWeb = Platform.OS === 'web';

/* ---------------- Secure Store ---------------- */

export async function secureSet(
  key: string,
  value: string
): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export async function secureGet(
  key: string
): Promise<string | null> {
  if (isWeb) {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

export async function secureDelete(
  key: string
): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function clearAllSecureData(): Promise<void> {
  if (isWeb) {
    await Promise.all(
      Object.values(KEYS).map((key) =>
        AsyncStorage.removeItem(key)
      )
    );
  } else {
    await Promise.all(
      Object.values(KEYS).map((key) =>
        SecureStore.deleteItemAsync(key)
      )
    );
  }
}

/* ---------------- Async Storage ---------------- */

export async function storageSet(
  key: string,
  value: string
): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function storageGet(
  key: string
): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function storageDelete(
  key: string
): Promise<void> {
  await AsyncStorage.removeItem(key);
}
