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

  setPhone: (phone: string) => void;
  setUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isFirstLaunch: true,

  user: null,
  phone: '',

  isLoading: false,
  error: null,

  // actions
  setPhone: (phone) => set({ phone }),

  setUser: (user) => set({ user }),

  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),

  setAuthenticated: (value) => set({ isAuthenticated: value }),

  setLoading: (value) => set({ isLoading: value }),

  setError: (error) => set({ error }),

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      phone: '',
      error: null,
      isLoading: false,
    }),
}));
