/**
 * Vahan360 — Recent Destinations Store
 *
 * Tracks the user's most recently selected pickup/drop addresses so they
 * can be quickly reused from the location search dropdown.
 *
 * Fixes UX-HOME-010: recent destinations list — readable, well-spaced,
 * selectable.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'vahan360_recent_destinations';
const MAX_RECENTS = 5;

export interface RecentDestination {
  id: string;
  address: string;
  /** Epoch ms — used to keep the list sorted most-recent-first. */
  selectedAt: number;
}

interface RecentDestinationsState {
  recents: RecentDestination[];
  loaded: boolean;
  load: () => Promise<void>;
  addRecent: (address: string) => Promise<void>;
  clearRecents: () => Promise<void>;
}

export const useRecentDestinationsStore = create<RecentDestinationsState>((set, get) => ({
  recents: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: RecentDestination[] = raw ? JSON.parse(raw) : [];
      set({ recents: parsed, loaded: true });
    } catch {
      set({ recents: [], loaded: true });
    }
  },

  addRecent: async (address: string) => {
    const trimmed = address.trim();
    if (!trimmed) return;

    const current = get().recents;
    // De-dupe by address (case-insensitive), move to front.
    const filtered = current.filter((r) => r.address.toLowerCase() !== trimmed.toLowerCase());
    const updated: RecentDestination[] = [
      { id: `recent-${Date.now()}`, address: trimmed, selectedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENTS);

    set({ recents: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Non-fatal — recents are a convenience feature, not critical data.
    }
  },

  clearRecents: async () => {
    set({ recents: [] });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
}));
