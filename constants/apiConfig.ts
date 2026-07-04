/**
 * Vahan360 — API Base Configuration
 * -------------------------------------------------------
 * Single place to point the app at your backend.
 *
 * ⚠️ IMPORTANT FOR EXPO GO ON A PHYSICAL DEVICE:
 * "localhost" / "127.0.0.1" only works when the app runs on the
 * SAME machine as the backend (web browser, iOS simulator on Mac).
 * Expo Go on a real phone is a separate device on your WiFi, so it
 * must use your computer's LAN IP instead (the one from `ipconfig`).
 *
 * Update ONLY the value below when your IP changes (e.g. new WiFi network).
 */

// 👉 Change this to your computer's current IPv4 address (from `ipconfig` /
// `ifconfig`), keeping the port your backend listens on.
const LAN_IP = '192.168.1.16';
const PORT = '3001';

export const API_BASE_URL = `http://${LAN_IP}:${PORT}`;

// Default fetch timeout so the app fails fast with a clear error instead of
// hanging forever if the phone can't reach the backend.
export const API_TIMEOUT_MS = 10000;
