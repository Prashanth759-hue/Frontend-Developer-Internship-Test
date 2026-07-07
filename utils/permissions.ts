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
 * Caller (useLocation hook) is responsible for any in-app messaging
 * before/after this — this function just talks to the OS.
 */
export async function requestLocationPermission(): Promise<PermissionStatus> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

/**
 * Check whether the DEVICE's location services (GPS/Location toggle in the
 * phone's system settings) are turned on at all — independent of whether
 * this app has been granted permission. This is what tells us to show the
 * "Turn on Location" popup vs silently fetching location.
 */
export async function checkLocationServicesEnabled(): Promise<boolean> {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch {
    return false;
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

// ── Contacts ──────────────────────────────────────────────────────────────────

export interface PickedContact {
  name: string;
  phone: string;
}

// Minimal shape of the expo-contacts module we actually use. Declared
// locally (instead of importing the package's own types) so this file
// type-checks even before `npm install` / `expo install expo-contacts`
// has been run. Once installed, the dynamic import below still resolves
// to the real module at runtime — this is purely a compile-time stand-in.
interface ContactsModule {
  requestPermissionsAsync: () => Promise<{ status: string }>;
  getPermissionsAsync: () => Promise<{ status: string }>;
  getContactsAsync: (options: { fields: string[] }) => Promise<{
    data: Array<{
      name?: string;
      phoneNumbers?: Array<{ number?: string }>;
    }>;
  }>;
  Fields: { PhoneNumbers: string };
}

async function loadContactsModule(): Promise<ContactsModule | null> {
  try {
    // Resolved dynamically at runtime; package may or may not be
    // installed, so we don't want a hard compile-time dependency on
    // its types. Using a plain string import target (not a literal
    // TS can statically resolve against this file's own type-checking)
    // keeps this safe whether or not expo-contacts is present.
    const moduleName = 'expo-contacts';
    const mod = await import(moduleName).catch(() => null);
    return (mod as unknown as ContactsModule) ?? null;
  } catch {
    return null;
  }
}

/**
 * Request contacts permission ONLY at the moment the user taps
 * "Pick from contacts" — never upfront on screen load. Mirrors the
 * location permission pattern: real OS prompt, friendly Settings
 * fallback if previously denied, safe no-op if the package is missing.
 */
export async function requestContactsPermission(): Promise<PermissionStatus> {
  try {
    const Contacts = await loadContactsModule();
    if (!Contacts) return 'unavailable';

    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') return 'granted';

    Alert.alert(
      'Contacts Access Required',
      'Vahan360 needs access to your contacts to fill in receiver details. Please enable it in Settings.',
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
 * Fetch the device's contacts (name + first phone number only), for use
 * in an in-app contact picker list. Returns an empty array if permission
 * isn't granted or the package isn't installed — callers should request
 * permission via requestContactsPermission() first.
 */
export async function getContactsList(): Promise<PickedContact[]> {
  try {
    const Contacts = await loadContactsModule();
    if (!Contacts) return [];

    const { status } = await Contacts.getPermissionsAsync();
    if (status !== 'granted') return [];

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    return data
      .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0 && c.name)
      .map((c) => ({
        name: c.name as string,
        phone: (c.phoneNumbers?.[0]?.number ?? '').replace(/\D/g, '').slice(-10),
      }))
      .filter((c) => c.phone.length === 10);
  } catch {
    return [];
  }
}