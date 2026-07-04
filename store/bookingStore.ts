import { create } from 'zustand';

export type ServiceType = 'bike_taxi' | 'scooty' | 'auto' | 'car' | 'car_ac' | 'car_non_ac' | 'car_xl' | 'parcel' | 'courier' | 'freight' | 'heavy_cargo' | 'packers_movers';
export type TripMode = 'within_city' | 'inter_cities' | 'long_trips';
// Which Packers & Movers sub-flow is active. Drives step order on the shared
// pickup screen (location/floor vs goods details) and where "continue" goes.
export type MoversFlow = 'within_city' | 'mini_truck' | 'between_cities';
export type PaymentMode = 'cash' | 'upi' | 'wallet' | 'card' | 'netbanking';
export type BookingStatus = 'idle' | 'searching' | 'driver_assigned' | 'in_progress' | 'completed' | 'cancelled';

interface Location {
  label: string;
  address: string;
  lat?: number;
  lng?: number;
}

export interface ScheduledSlot {
  id: string;
  label: string;
  desc?: string;
}

// Optional packaging add-on chosen on the pickup scheduling screen.
export interface PackagingSelection {
  id: string;
  label: string;
  price: number;
}

export interface GoodsDetails {
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  category: string;
  weight: string;
  qty?: string;       // '1_3' | '4_10' | '11_plus'
  description: string;
}

export interface AppliedCoupon {
  code: string;
  discount: number;
  label: string;
}

export interface MovingItem {
  id: string;
  name: string;
  qty: number;
}

interface BookingState {
  serviceType: ServiceType | null;
  tripMode: TripMode | null;
  moversFlow: MoversFlow | null;
  movingItemCount: number;
  movingItems: MovingItem[];
  pickup: Location | null;
  drop: Location | null;
  stops: Location[];
  selectedVehicle: string | null;
  scheduledSlot: ScheduledSlot | null;
  packagingOption: PackagingSelection | null;
  goodsDetails: GoodsDetails | null;
  paymentMode: PaymentMode;
  status: BookingStatus;
  estimatedFare: number;
  helperCount: number;
  appliedCoupon: AppliedCoupon | null;
  isLoading: boolean;
  error: string | null;
  activeBookingId: string | null;

  setServiceType: (type: ServiceType) => void;
  setTripMode: (mode: TripMode) => void;
  setMoversFlow: (flow: MoversFlow | null) => void;
  setMovingItemCount: (count: number) => void;
  setMovingItems: (items: MovingItem[]) => void;
  setPickup: (loc: Location) => void;
  setDrop: (loc: Location) => void;
  addStop: (loc: Location) => void;
  removeStop: (index: number) => void;
  setSelectedVehicle: (id: string) => void;
  setScheduledSlot: (slot: ScheduledSlot | null) => void;
  setPackagingOption: (option: PackagingSelection | null) => void;
  setGoodsDetails: (details: GoodsDetails | null) => void;
  setPaymentMode: (mode: PaymentMode) => void;
  setStatus: (status: BookingStatus) => void;
  setEstimatedFare: (fare: number) => void;
  setHelperCount: (count: number) => void;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  setActiveBookingId: (id: string | null) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  serviceType: null,
  tripMode: null,
  moversFlow: null,
  movingItemCount: 0,
  movingItems: [],
  pickup: null,
  drop: null,
  stops: [],
  selectedVehicle: null,
  scheduledSlot: null,
  packagingOption: null,
  goodsDetails: null,
  paymentMode: 'cash',
  status: 'idle',
  estimatedFare: 0,
  helperCount: 0,
  appliedCoupon: null,
  isLoading: false,
  error: null,
  activeBookingId: null,

  setServiceType: (type) => set({ serviceType: type }),
  setTripMode: (mode) => set({ tripMode: mode }),
  setMoversFlow: (flow) => set({ moversFlow: flow }),
  setMovingItemCount: (count) => set({ movingItemCount: count }),
  setMovingItems: (items) => set({ movingItems: items }),
  setPickup: (loc) => set({ pickup: loc }),
  setDrop: (loc) => set({ drop: loc }),
  addStop: (loc) => set((state) => ({ stops: [...state.stops, loc] })),
  removeStop: (index) =>
    set((state) => ({ stops: state.stops.filter((_, i) => i !== index) })),
  setSelectedVehicle: (id) => set({ selectedVehicle: id }),
  setScheduledSlot: (slot) => set({ scheduledSlot: slot }),
  setPackagingOption: (option) => set({ packagingOption: option }),
  setGoodsDetails: (details) => set({ goodsDetails: details }),
  setPaymentMode: (mode) => set({ paymentMode: mode }),
  setStatus: (status) => set({ status }),
  setEstimatedFare: (fare) => set({ estimatedFare: fare }),
  setHelperCount: (count) => set({ helperCount: count }),
  setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
  setLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),
  setActiveBookingId: (id) => set({ activeBookingId: id }),
  resetBooking: () =>
  set({
    serviceType: null,
    tripMode: null,
    moversFlow: null,
    movingItemCount: 0,
    movingItems: [],
    pickup: null,
    drop: null,
    stops: [],
    selectedVehicle: null,
    scheduledSlot: null,
    packagingOption: null,
    goodsDetails: null,
    paymentMode: 'cash',
    status: 'idle',
    estimatedFare: 0,
    helperCount: 0,
    appliedCoupon: null,
    isLoading: false,
    error: null,
    activeBookingId: null,
  }),
}));