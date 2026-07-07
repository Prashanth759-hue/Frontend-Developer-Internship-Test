/**
 * Vahan360 — Trip History Store
 *
 * Persists the user's actual completed/cancelled trips (as opposed to the
 * static MOCK_ORDERS, which only ever exist for the seeded demo account).
 *
 * - `addTrip()` is called once a trip finishes (rate-trip screen), so the
 *   My Trips screen updates immediately and survives app restarts.
 * - Trips are stored per logged-in user id, so different accounts on the
 *   same device never see each other's history.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TripRecord {
  id: string;
  /** Display label matching the `service` field used by My Trips, e.g. 'Bike Taxi', 'Auto', 'Parcel'. */
  service: string;
  pickup: string;
  drop: string;
  date: string; // e.g. '27 Jun 2026'
  time: string; // e.g. '10:30 AM'
  fare: string; // e.g. '₹120'
  status: 'completed' | 'cancelled';
  driverName: string | null;
  driverPhone: string | null;
  vehicleNumber: string | null;
  rating: number | null;
  distance: string | null;
  duration: string | null;
}

interface TripHistoryState {
  /** Map of userId -> their trips. Keeps accounts on the same device separate. */
  tripsByUser: Record<string, TripRecord[]>;
  addTrip: (userId: string, trip: TripRecord) => void;
}

/** Stable empty-array reference so selectors don't return a new [] every render. */
const EMPTY_TRIPS: TripRecord[] = [];

export const useTripHistoryStore = create<TripHistoryState>()(
  persist(
    (set) => ({
      tripsByUser: {},

      addTrip: (userId, trip) =>
        set((state) => ({
          tripsByUser: {
            ...state.tripsByUser,
            // Newest first.
            [userId]: [trip, ...(state.tripsByUser[userId] ?? [])],
          },
        })),
    }),
    {
      name: 'vahan360-trip-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/**
 * Selector helper: get a user's trips with a stable reference when empty,
 * to avoid re-render loops. Use as:
 *   useTripHistoryStore((s) => getUserTrips(s, userId))
 */
export function getUserTrips(state: TripHistoryState, userId: string | undefined): TripRecord[] {
  if (!userId) return EMPTY_TRIPS;
  return state.tripsByUser[userId] ?? EMPTY_TRIPS;
}

/** Formats a Date as 'DD Mon YYYY' to match the existing order date format. */
export function formatTripDate(d: Date): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Formats a Date as 'hh:mm AM/PM' to match the existing order time format. */
export function formatTripTime(d: Date): string {
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minutesStr} ${ampm}`;
}

/**
 * Maps a booking store `serviceType` to the display label used throughout
 * My Trips / Orders (e.g. 'bike_taxi' -> 'Bike Taxi'). This is the reverse
 * of SERVICE_TYPE_MAP in components/home/RecentBookings.tsx, kept here so
 * any screen that finishes a trip can build a matching TripRecord.
 */
export const SERVICE_TYPE_TO_LABEL: Record<string, string> = {
  bike_taxi: 'Bike Taxi',
  bike: 'Bike',
  auto: 'Auto',
  car: 'Car',
  parcel: 'Parcel',
  courier: 'Courier',
  freight: 'Truck',
  heavy_cargo: 'Truck',
  packers_movers: 'Packers & Movers',
};