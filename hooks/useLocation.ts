/**
 * Vahan360 — useLocation Hook
 *
 * Manages location permission, current coordinates,
 * and reverse-geocoded address label.
 *
 * Behaviour:
 *  - The in-app "Turn on Location" popup is shown automatically AT MOST
 *    ONCE PER LOGIN — right when the user lands on Home after logging in
 *    (new or returning account). This is driven by authStore's
 *    `locationPromptPending` flag, set the moment login succeeds and
 *    consumed (cleared) the first time Home checks it. Simply navigating
 *    back to Home later in the same session — e.g. after completing a
 *    trip — never re-shows it automatically.
 *  - Regardless of the popup, if device location is already on AND
 *    permission is already granted, we always fetch silently in the
 *    background — no popup needed, every time.
 *  - If location is off and the one-time prompt has already been used,
 *    Home just shows whatever address is available (or the manual/"Your
 *    Location" fallback) without interrupting the user — they can still
 *    turn it on later from the location input manually.
 *  - "Turn on" (confirmRationale) → closes the popup and fires the real
 *    permission/location request. The OS may show its own native dialogs
 *    here (permission prompt, or Android's "Location Accuracy" dialog) —
 *    that part is controlled by the device, not by this app.
 *  - "No thanks" (dismissRationale) → just closes the popup. Nothing else
 *    happens; no Settings redirect, no further prompts.
 */
import { useEffect, useState, useCallback } from 'react';
import {
  requestLocationPermission,
  checkLocationPermission,
  checkLocationServicesEnabled,
  getCurrentLocation,
  reverseGeocode,
  type PermissionStatus,
} from '../utils/permissions';
import { useAuthStore } from '../store/authStore';

interface LocationState {
  coords: { lat: number; lng: number } | null;
  address: string | null;
  permissionStatus: PermissionStatus | 'unknown';
  loading: boolean;
  error: string | null;
  /** True when the in-app "Turn on Location" popup should be shown. */
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
   * Called only after the popup has been confirmed (or skipped because
   * everything was already on).
   */
  const fetchLocation = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null, needsRationale: false }));

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
   * Entry point called on mount. Always fetches silently when location is
   * already on + granted. Otherwise, only shows the popup if this is the
   * one allowed time (right after login) — checked via authStore's
   * consumeLocationPromptPending(), which returns true at most once per
   * login and false on every subsequent call until the next login.
   */
  const init = useCallback(async () => {
    const [servicesOn, permStatus] = await Promise.all([
      checkLocationServicesEnabled(),
      checkLocationPermission(),
    ]);

    if (servicesOn && permStatus === 'granted') {
      // Device location is on and we're already allowed — just fetch,
      // no popup needed, every time.
      await fetchLocation();
      return;
    }

    setState((s) => ({ ...s, permissionStatus: permStatus }));

    // Location is off/not granted — only interrupt with the popup if
    // this is the one post-login chance. consumeLocationPromptPending()
    // both checks AND clears the flag, so it can only fire once.
    const shouldPrompt = useAuthStore.getState().consumeLocationPromptPending();
    if (shouldPrompt) {
      setState((s) => ({ ...s, needsRationale: true }));
    }
  }, [fetchLocation]);

  /** Called when the user taps "Turn on" on the popup. */
  const confirmRationale = useCallback(async () => {
    setState((s) => ({ ...s, needsRationale: false }));
    await fetchLocation();
  }, [fetchLocation]);

  /** Called when the user taps "No thanks" on the popup — just closes it. */
  const dismissRationale = useCallback(() => {
    setState((s) => ({ ...s, needsRationale: false }));
  }, []);

  /**
   * Reads current permission + device-services status without showing the
   * popup or triggering any OS prompt. Useful for screens that only need
   * to know the status to decide what to do next.
   */
  const checkStatus = useCallback(async () => {
    const [servicesOn, permStatus] = await Promise.all([
      checkLocationServicesEnabled(),
      checkLocationPermission(),
    ]);
    const effectiveStatus: PermissionStatus = !servicesOn ? 'denied' : permStatus;
    setState((s) => ({ ...s, permissionStatus: effectiveStatus }));
    return effectiveStatus;
  }, []);

  /**
   * Called right before doing something that needs location (e.g. tapping
   * "Use current location" on the map picker, or the location input).
   * This is a deliberate user action, so it always shows the popup if
   * device location is off or permission isn't granted — independent of
   * the once-per-login auto-prompt above.
   */
  const requestWithRationale = useCallback(async () => {
    const [servicesOn, permStatus] = await Promise.all([
      checkLocationServicesEnabled(),
      checkLocationPermission(),
    ]);

    if (servicesOn && permStatus === 'granted') {
      await fetchLocation();
      return;
    }

    setState((s) => ({ ...s, permissionStatus: permStatus, needsRationale: true }));
  }, [fetchLocation]);

  useEffect(() => {
    if (autoRequest) {
      init();
    } else {
      checkStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    requestWithRationale,
  };
}