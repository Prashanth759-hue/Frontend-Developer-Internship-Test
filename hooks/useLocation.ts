/**
 * Vahan360 — useLocation Hook
 *
 * Manages location permission, current coordinates,
 * and reverse-geocoded address label.
 *
 * IMPORTANT (UX-HOME-008): the native OS permission dialog must never be
 * the first thing the user sees. We always show an in-app rationale modal
 * first; the actual `requestForegroundPermissionsAsync()` call only fires
 * after the user taps "Allow" in that modal. This hook tracks whether the
 * rationale still needs to be shown via `needsRationale`, and exposes
 * `confirmRationale()` / `dismissRationale()` for the modal to call.
 */
import { useEffect, useState, useCallback } from 'react';
import { KEYS, storageGet, storageSet } from '../constants/storage';
import {
  requestLocationPermission,
  checkLocationPermission,
  getCurrentLocation,
  reverseGeocode,
  type PermissionStatus,
} from '../utils/permissions';

interface LocationState {
  coords: { lat: number; lng: number } | null;
  address: string | null;
  permissionStatus: PermissionStatus | 'unknown';
  loading: boolean;
  error: string | null;
  /** True when the in-app rationale modal should be shown before requesting permission. */
  needsRationale: boolean;
}

export function useLocation(autoRequest = true) {
  const [state, setState] = useState<LocationState>({
    coords: null,
    address: null,
    permissionStatus: 'unknown',
    loading: false,
    error: null,
    needsRationale: false,
  });

  /**
   * Actually requests the OS permission and fetches location.
   * Should only ever be called AFTER the rationale has been acknowledged
   * (or skipped because permission was already granted/denied previously).
   */
  const fetchLocation = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const permStatus = await requestLocationPermission();
      if (permStatus !== 'granted') {
        setState((s) => ({
          ...s,
          permissionStatus: permStatus,
          loading: false,
          error: 'Location permission not granted.',
        }));
        return;
      }

      const coords = await getCurrentLocation();
      if (!coords) {
        setState((s) => ({
          ...s,
          permissionStatus: 'granted',
          loading: false,
          error: 'Unable to fetch location. Please try again.',
        }));
        return;
      }

      const address = await reverseGeocode(coords.lat, coords.lng);

      setState((s) => ({
        ...s,
        coords,
        address,
        permissionStatus: 'granted',
        loading: false,
        error: null,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: 'Location unavailable.',
      }));
    }
  }, []);

  /**
   * Entry point called on mount (or manually). Decides whether to show the
   * rationale modal first, or go straight to fetching location because
   * permission has already been determined (granted, or rationale already shown).
   */
  const init = useCallback(async () => {
    const currentStatus = await checkLocationPermission();

    if (currentStatus === 'granted') {
      // Already granted in a previous session — no need to show rationale again.
      await fetchLocation();
      return;
    }

    const rationaleShown = await storageGet(KEYS.LOCATION_RATIONALE_SHOWN);
    if (rationaleShown === 'true') {
      // User has already seen the explanation before (e.g. a previous app
      // session where they tapped "Not Now"). Don't nag with the modal
      // every single time — just reflect current status without prompting.
      setState((s) => ({ ...s, permissionStatus: currentStatus, needsRationale: false }));
      return;
    }

    // First time ever needing location — show the in-app explanation
    // BEFORE the system dialog appears.
    setState((s) => ({ ...s, needsRationale: true }));
  }, [fetchLocation]);

  /** Called when the user taps "Allow Location Access" on the rationale modal. */
  const confirmRationale = useCallback(async () => {
    await storageSet(KEYS.LOCATION_RATIONALE_SHOWN, 'true');
    setState((s) => ({ ...s, needsRationale: false }));
    await fetchLocation();
  }, [fetchLocation]);

  /** Called when the user taps "Not Now" on the rationale modal. */
  const dismissRationale = useCallback(async () => {
    await storageSet(KEYS.LOCATION_RATIONALE_SHOWN, 'true');
    setState((s) => ({
      ...s,
      needsRationale: false,
      permissionStatus: 'denied',
      error: 'Location permission not granted.',
    }));
  }, []);

  /**
   * Reads current permission status without showing the rationale modal
   * or triggering the OS prompt. Useful for screens (like the map picker)
   * that only need to know the status to decide what guidance to show,
   * and shouldn't re-trigger the first-time rationale flow themselves.
   */
  const checkStatus = useCallback(async () => {
    const currentStatus = await checkLocationPermission();
    setState((s) => ({ ...s, permissionStatus: currentStatus }));
    return currentStatus;
  }, []);

  useEffect(() => {
    if (autoRequest) {
      init();
    } else {
      checkStatus();
    }
  }, [autoRequest, init, checkStatus]);

  /**
   * Formatted label for display.
   * Falls back to "Your Location" if address could not be resolved.
   */
  const locationLabel = state.address ?? 'Your Location';

  return {
    ...state,
    locationLabel,
    refresh: fetchLocation,
    confirmRationale,
    dismissRationale,
    checkStatus,
  };
}