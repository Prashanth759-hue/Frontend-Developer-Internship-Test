/**
 * Vahan360 — API Service Layer
 * -------------------------------------------------------
 * All API methods are defined here with their full
 * type signatures, expected request/response shapes,
 * and endpoint patterns.
 *
 * Currently all methods return mock data locally.
 * Replace the internals with real fetch/axios calls
 * when the backend is ready — the signatures stay the same.
 *
 * BASE_URL should be set via environment config.
 */

// ── Types ────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface AuthPayload {
  phone: string;
}

export interface OTPPayload {
  phone: string;
  otp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dob?: string;
  avatar?: string;
  walletBalance?: number;
  vahanCoins?: number;
}

export interface BookingPayload {
  serviceType: string;
  pickup: { label: string; address: string; lat?: number; lng?: number };
  drop: { label: string; address: string; lat?: number; lng?: number };
  stops?: { label: string; address: string; lat?: number; lng?: number }[];
  vehicleId: string;
  paymentMode: 'cash' | 'upi' | 'wallet';
  estimatedFare: number;
}

export interface BookingResponse {
  bookingId: string;
  status: 'searching' | 'driver_assigned' | 'in_progress' | 'completed' | 'cancelled';
  estimatedPickupTime: number; // seconds
  driver?: DriverInfo;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  rating: number;
  totalRides: number;
  vehicle: string;
  vehicleNumber: string;
  icon: string;
  eta: string;
  lat?: number;
  lng?: number;
}

export interface Order {
  id: string;
  service: string;
  pickup: string;
  drop: string;
  date: string;
  time: string;
  fare: string;
  status: 'completed' | 'cancelled' | 'in_progress';
  driverName: string | null;
  driverPhone: string | null;
  vehicleNumber: string | null;
  rating: number | null;
  distance: string;
  duration: string | null;
}

export interface Transaction {
  id: string;
  label: string;
  amount: string;
  date: string;
  type: 'credit' | 'debit';
}

// ── Mock Data Imports ────────────────────────────────────

import {
  MOCK_ORDERS,
  MOCK_TRANSACTIONS,
  MOCK_DRIVERS,
  MOCK_PROMOS,
} from '../constants/mockData';
import { API_BASE_URL, API_TIMEOUT_MS } from '../constants/apiConfig';

// ── Helpers ──────────────────────────────────────────────

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function mockOk<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

/**
 * Real backend call helper — POST/GET JSON with a timeout so the app fails
 * fast with a readable error instead of hanging if the phone can't reach
 * the backend (wrong IP, different WiFi, firewall, backend not running).
 */
async function apiFetch<T = any>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: any } = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    let json: any = null;
    try {
      json = await res.json();
    } catch {
      // Non-JSON response body — leave json as null, handled below.
    }

    if (!res.ok) {
      const message = json?.message || json?.error || `Request failed (${res.status})`;
      throw new Error(message);
    }

    return json as T;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err?.name === 'AbortError') {
      throw new Error('timeout');
    }
    throw err;
  }
}

// ── Auth ─────────────────────────────────────────────────
// LIVE: POST /v1/auth/customer/request-otp
export async function sendOTP(payload: AuthPayload): Promise<ApiResponse<{ message: string }>> {
  const json = await apiFetch<any>('/v1/auth/customer/request-otp', {
    method: 'POST',
    body: { phoneNumber: payload.phone },
  });
  return {
    success: true,
    data: { message: json?.message ?? 'OTP sent successfully' },
  };
}

// LIVE: POST /v1/auth/customer/verify-otp
export async function verifyOTP(payload: OTPPayload): Promise<ApiResponse<{ token: string; user: UserProfile }>> {
  const json = await apiFetch<any>('/v1/auth/customer/verify-otp', {
    method: 'POST',
    body: { phoneNumber: payload.phone, otp: payload.otp },
  });

  // Backend response shape isn't fully pinned down yet, so accept the
  // common variants: { accessToken, userId }, { token, user }, or
  // { success, data: { token, user } }. Adjust this mapping once you
  // confirm your exact response body from Postman.
  const data = json?.data ?? json;
  const token = data?.accessToken ?? data?.token ?? '';
  const rawUser = data?.user ?? {};

  return {
    success: true,
    data: {
      token,
      user: {
        id: rawUser?.id ?? data?.userId ?? '',
        name: rawUser?.name ?? '',
        phone: rawUser?.phone ?? payload.phone,
        email: rawUser?.email ?? '',
        walletBalance: rawUser?.walletBalance ?? 0,
        vahanCoins: rawUser?.vahanCoins ?? 0,
      },
    },
  };
}

// ── Profile ──────────────────────────────────────────────
// REPLACE: GET /user/profile
export async function getProfile(): Promise<ApiResponse<UserProfile>> {
  await delay(600);
  return mockOk({
    id: 'usr_001',
    name: 'Ravi Kumar',
    phone: '9876543210',
    email: 'ravi.kumar@email.com',
    walletBalance: 0,
    vahanCoins: 0,
  });
}

// REPLACE: PUT /user/profile
export async function updateProfile(partial: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
  await delay(800);
  return mockOk({ id: 'usr_001', name: 'Ravi Kumar', phone: '9876543210', ...partial });
}

// ── Booking ──────────────────────────────────────────────
// REPLACE: POST /booking/create
export async function createBooking(payload: BookingPayload): Promise<ApiResponse<BookingResponse>> {
  await delay(1000);
  return mockOk({
    bookingId: 'BKG-' + Date.now(),
    status: 'searching',
    estimatedPickupTime: 180,
  });
}

// REPLACE: GET /booking/:id/status
export async function getBookingStatus(bookingId: string): Promise<ApiResponse<BookingResponse>> {
  await delay(500);
  const driver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
  return mockOk({
    bookingId,
    status: 'driver_assigned',
    estimatedPickupTime: 180,
    driver,
  });
}

// REPLACE: POST /booking/:id/cancel
export async function cancelBooking(bookingId: string): Promise<ApiResponse<{ message: string }>> {
  await delay(700);
  return mockOk({ message: 'Booking cancelled successfully' });
}

// REPLACE: POST /booking/:id/rate
export async function rateBooking(bookingId: string, rating: number, feedback?: string): Promise<ApiResponse<{ message: string }>> {
  await delay(600);
  return mockOk({ message: 'Thank you for your feedback!' });
}

// ── Orders ───────────────────────────────────────────────
// REPLACE: GET /orders?page=1&limit=20
export async function getOrders(): Promise<ApiResponse<Order[]>> {
  await delay(700);
  return mockOk(MOCK_ORDERS as Order[]);
}

// REPLACE: GET /orders/:id
export async function getOrderDetail(orderId: string): Promise<ApiResponse<Order | null>> {
  await delay(500);
  const order = MOCK_ORDERS.find((o) => o.id === orderId) ?? null;
  return mockOk(order as Order | null);
}

// ── Wallet ───────────────────────────────────────────────
// REPLACE: GET /wallet/balance
export async function getWalletBalance(): Promise<ApiResponse<{ balance: number; coins: number }>> {
  await delay(500);
  return mockOk({ balance: 0, coins: 0 });
}

// REPLACE: GET /wallet/transactions
export async function getTransactions(): Promise<ApiResponse<Transaction[]>> {
  await delay(600);
  return mockOk(MOCK_TRANSACTIONS as Transaction[]);
}

// REPLACE: POST /wallet/add-money
export async function addMoneyToWallet(amount: number, paymentMode: string): Promise<ApiResponse<{ balance: number }>> {
  await delay(1200);
  return mockOk({ balance: amount });
}

// ── Promos ───────────────────────────────────────────────
// REPLACE: GET /promos
export async function getPromos(): Promise<ApiResponse<typeof MOCK_PROMOS>> {
  await delay(500);
  return mockOk(MOCK_PROMOS);
}

// REPLACE: POST /promos/apply
export async function applyPromoCode(code: string): Promise<ApiResponse<{ discount: number; message: string }>> {
  await delay(800);
  const promo = MOCK_PROMOS.find((p) => p.code === code.toUpperCase());
  if (promo) {
    return mockOk({ discount: 50, message: `Promo ${code} applied!` });
  }
  return { success: false, data: { discount: 0, message: 'Invalid promo code' }, error: 'INVALID_PROMO' };
}

// ── Addresses ────────────────────────────────────────────
// REPLACE: GET /user/saved-addresses
export async function getSavedAddresses() {
  await delay(400);
  return mockOk([
    { id: 'addr-1', label: 'Home', address: '123, 4th Cross, Koramangala, Bengaluru 560034', icon: 'home' },
    { id: 'addr-2', label: 'Work', address: '91Springboard, Indiranagar, Bengaluru 560038', icon: 'briefcase' },
  ]);
}

// REPLACE: POST /user/saved-addresses
export async function saveAddress(addr: { label: string; address: string; icon: string }) {
  await delay(600);
  return mockOk({ id: 'addr-' + Date.now(), ...addr });
}

// ── Driver Tracking ──────────────────────────────────────
// REPLACE: WebSocket or GET /booking/:id/driver-location (polling)
export async function getDriverLocation(bookingId: string): Promise<ApiResponse<{ lat: number; lng: number; heading: number }>> {
  await delay(300);
  // Mock: random movement near Koramangala
  return mockOk({
    lat: 12.9352 + (Math.random() - 0.5) * 0.01,
    lng: 77.6245 + (Math.random() - 0.5) * 0.01,
    heading: Math.random() * 360,
  });
}
