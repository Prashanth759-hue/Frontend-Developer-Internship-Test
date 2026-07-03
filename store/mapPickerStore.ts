/**
 * mapPickerStore
 * Bridge between map-picker.tsx (the full-screen map) and whichever
 * screen opened it.  The map-picker writes a result here; the calling
 * screen reads it via useFocusEffect.
 */
import { create } from 'zustand';

interface MapPickerResult {
  fieldKey: string;  // 'pickup' | 'drop' | 'from' | 'to' | etc.
  address: string;
}

interface MapPickerState {
  result: MapPickerResult | null;
  setResult: (result: MapPickerResult) => void;
  clearResult: () => void;
}

export const useMapPickerStore = create<MapPickerState>((set) => ({
  result: null,
  setResult: (result) => set({ result }),
  clearResult: () => set({ result: null }),
}));