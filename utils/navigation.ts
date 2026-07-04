/**
 * Vahan360 — Navigation Helpers
 * Centralised route strings and navigation functions.
 * Use these instead of hard-coding route strings in components.
 */
import { router } from 'expo-router';

// ── Route constants ────────────────────────────────────────────────────────────

export const ROUTES = {
  // Root
  SPLASH: '/' as const,

  // Auth stack
  ONBOARDING: '/(auth)/onboarding' as const,
  LOGIN: '/(auth)/login' as const,
  OTP: '/(auth)/otp' as const,

  // Main tabs
  HOME: '/(main)/home' as const,
  ORDERS: '/(main)/orders' as const,
  WALLET: '/(main)/wallet' as const,
  PROFILE: '/(main)/profile' as const,

  // Booking flow
  PICKUP: '/(booking)/pickup' as const,
  VEHICLE: '/(booking)/vehicle' as const,
  FARE: '/(booking)/fare' as const,
  SEARCHING: '/(booking)/searching' as const,
} as const;

// ── Navigate helpers ───────────────────────────────────────────────────────────

/** Replace the whole stack — used for auth→home transitions */
export const goHome = () => router.replace(ROUTES.HOME);

/** Replace with login — used on logout */
export const goLogin = () => router.replace(ROUTES.LOGIN);

/** Push booking pickup screen */
export const goPickup = () => router.push(ROUTES.PICKUP);

/** Push vehicle selection */
export const goVehicle = () => router.push(ROUTES.VEHICLE);

/** Push fare & payment */
export const goFare = () => router.push(ROUTES.FARE);

/** Push searching / finding driver */
export const goSearching = () => router.push(ROUTES.SEARCHING);

/** Navigate to orders tab */
export const goOrders = () => router.push(ROUTES.ORDERS);

/** Navigate to wallet tab */
export const goWallet = () => router.push(ROUTES.WALLET);

/** Navigate to profile tab */
export const goProfile = () => router.push(ROUTES.PROFILE);

/** Go back one level */
export const goBack = () => router.back();

// ── Auth guard helper (use in screens before rendering private content) ────────

/**
 * Redirect to login if not authenticated.
 * Returns true if the user was redirected (caller should return null from render).
 */
export function redirectIfUnauthenticated(isAuthenticated: boolean): boolean {
  if (!isAuthenticated) {
    router.replace(ROUTES.LOGIN);
    return true;
  }
  return false;
}