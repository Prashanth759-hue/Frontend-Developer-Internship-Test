import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dob?: string;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  phone: string;
  isLoading: boolean;
  error: string | null;
  /**
   * True for exactly one Home visit right after a fresh login — this is
   * what tells Home it's allowed to show the "Turn on Location" popup
   * automatically. Set to true the moment login succeeds, and consumed
   * (set back to false) as soon as Home checks it, so it never reappears
   * just from navigating back to Home later in the same session.
   */
  locationPromptPending: boolean;

  setPhone: (phone: string) => void;
  setUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  consumeLocationPromptPending: () => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isFirstLaunch: true,

  user: null,
  phone: '',

  isLoading: false,
  error: null,
  locationPromptPending: false,

  // actions
  setPhone: (phone) => set({ phone }),

  setUser: (user) => set({ user }),

  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),

  // Logging in (new or returning user) marks the next Home visit as
  // eligible to show the location popup once.
  setAuthenticated: (value) =>
    set({ isAuthenticated: value, locationPromptPending: value ? true : get().locationPromptPending }),

  setLoading: (value) => set({ isLoading: value }),

  setError: (error) => set({ error }),

  // Reads + clears the flag in one go, so it's used at most once per login.
  consumeLocationPromptPending: () => {
    const pending = get().locationPromptPending;
    if (pending) set({ locationPromptPending: false });
    return pending;
  },

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      phone: '',
      error: null,
      isLoading: false,
      locationPromptPending: false,
    }),
}));