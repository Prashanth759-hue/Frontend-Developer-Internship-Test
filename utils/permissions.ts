/**
 * Vahan360 — Device Permissions Utilities
 *
 * All permission requests go through here.
 * Centralised so we can add analytics, logging, or
 * graceful fallbacks in one place.
 */
import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PermissionStatus = 'granted' | 'denied' | 'unavailable';

// ── Location ──────────────────────────────────────────────────────────────────

/**
 * Request foreground location permission.
 * Shows a friendly alert if denied, with a link to Settings.
 */
export async function requestLocationPermission(): Promise<PermissionStatus> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') return 'granted';

    // Already determined — can't ask again; guide to Settings
    Alert.alert(
      'Location Access Required',
      'Vahan360 needs your location to find nearby drivers and estimate fares. Please enable it in Settings.',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
    return 'denied';
  } catch {
    return 'unavailable';
  }
}

/**
 * Check current location permission status without triggering a prompt.
 */
export async function checkLocationPermission(): Promise<PermissionStatus> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === 'granted') return 'granted';
    return 'denied';
  } catch {
    return 'unavailable';
  }
}

/**
 * Get current location coords if permission is granted.
 * Returns null if not available.
 */
export async function getCurrentLocation(): Promise<{
  lat: number;
  lng: number;
} | null> {
  const status = await checkLocationPermission();
  if (status !== 'granted') return null;

  try {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { lat: loc.coords.latitude, lng: loc.coords.longitude };
  } catch {
    return null;
  }
}

/**
 * Reverse geocode coordinates to a human-readable address.
 * Returns a short label like "Koramangala, Bengaluru".
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (results.length === 0) return null;

    const r = results[0];
    const parts = [r.district ?? r.subregion, r.city].filter(Boolean);
    return parts.join(', ') || r.formattedAddress || null;
  } catch {
    return null;
  }
}

// ── Notifications (placeholder — expo-notifications not in package.json) ───────

/**
 * Request notification permission.
 * Safe no-op if expo-notifications is not installed.
 */
export async function requestNotificationPermission(): Promise<PermissionStatus> {
  try {
    // Dynamic import so the app doesn't crash if the package isn't installed
    const Notifications = await import('expo-notifications').catch(() => null);
    if (!Notifications) return 'unavailable';

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}