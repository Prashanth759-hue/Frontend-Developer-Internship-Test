/**
 * Vahan360 — Saved Address Store
 *
 * Single source of truth for the user's saved/favorite addresses
 * (Home, Work, and custom places). Previously this lived only as local
 * state inside saved-addresses.tsx, which meant nothing else in the app
 * (search dropdown, home screen favorites) could see or reuse it.
 *
 * Fixes:
 *  - UX-HOME-011 (favorites easy to identify & reuse)
 *  - UX-LOC-009 (saved address selectable from location search,
 *    correctly fills the active field)
 */
import { create } from 'zustand';
import { MOCK_SAVED_ADDRESSES } from '../constants/mockData';

export type AddressIconKey = 'home' | 'briefcase' | 'map-pin';

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  icon: AddressIconKey;
}

interface SavedAddressState {
  addresses: SavedAddress[];
  addAddress: (addr: Omit<SavedAddress, 'id'>) => SavedAddress;
  updateAddress: (id: string, addr: Omit<SavedAddress, 'id'>) => void;
  removeAddress: (id: string) => void;
}

export const useSavedAddressStore = create<SavedAddressState>((set, get) => ({
  addresses: MOCK_SAVED_ADDRESSES.map((a) => ({ ...a, icon: a.icon as AddressIconKey })),

  addAddress: (addr) => {
    const newAddr: SavedAddress = { id: `addr-${Date.now()}`, ...addr };
    set((s) => ({ addresses: [...s.addresses, newAddr] }));
    return newAddr;
  },

  updateAddress: (id, addr) => {
    set((s) => ({
      addresses: s.addresses.map((a) => (a.id === id ? { id, ...addr } : a)),
    }));
  },

  removeAddress: (id) => {
    set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) }));
  },
}));
