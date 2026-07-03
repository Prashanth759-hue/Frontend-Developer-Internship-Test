/**
 * Vahan360 — useAuth Hook
 *
 * Wraps the Zustand auth store with derived helpers
 * so components stay clean and free of store internals.
 */
import { useAuthStore } from '../store/authStore';
import { clearAllSecureData } from '../constants/storage';
import { router } from 'expo-router';

export function useAuth() {
  const store = useAuthStore();

  /**
   * Full logout: clear secure storage, reset store, redirect to login.
   */
  const signOut = async () => {
    await clearAllSecureData();
    store.logout();
    router.replace('/(auth)/login');
  };

  /**
   * Display name — first name only, with fallback.
   */
  const firstName =
    store.user?.name?.trim().split(' ')[0] ?? 'there';

  /**
   * Masked phone for display in UI (e.g. OTP screen subtitle).
   */
  const displayPhone = store.phone
    ? `+91 ${store.phone.slice(0, 5)} ${'•'.repeat(5)}`
    : '';

  /**
   * Indicates if the session is ready and user is authenticated.
   */
  const isReady = store.isAuthenticated && store.user !== null;

  return {
    // Raw store state
    user: store.user,
    phone: store.phone,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,

    // Store actions
    setPhone: store.setPhone,
    setUser: store.setUser,
    setAuthenticated: store.setAuthenticated,
    setLoading: store.setLoading,
    setError: store.setError,

    // Derived helpers
    signOut,
    firstName,
    displayPhone,
    isReady,
  };
}