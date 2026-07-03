/**
 * Vahan360 — Formatting Utilities
 * All display-format helpers live here.
 * Never put raw format logic in components.
 */

// ── Currency ──────────────────────────────────────────────────────────────────

/**
 * Format a number as Indian Rupees.
 * formatCurrency(1234.5) → '₹1,234.50'
 * formatCurrency(72)     → '₹72'
 */
export function formatCurrency(amount: number, decimals = 0): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Format a fare range string.
 * formatFareRange(35, 80) → '₹35 – ₹80'
 */
export function formatFareRange(min: number, max: number): string {
  return `₹${min} – ₹${max}`;
}

// ── Phone ─────────────────────────────────────────────────────────────────────

/**
 * Display phone with +91 prefix and spaces.
 * formatPhone('9876543210') → '+91 98765 43210'
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 10) return `+91 ${phone}`;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

/**
 * Mask phone for security display.
 * maskPhone('9876543210') → '+91 98765 *****'
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(0, 10);
  if (digits.length < 5) return '••••••••••';
  return `+91 ${digits.slice(0, 5)} ${'•'.repeat(5)}`;
}

// ── Distance ──────────────────────────────────────────────────────────────────

/**
 * Format metres to human-readable distance.
 * formatDistance(450)   → '450 m'
 * formatDistance(2300)  → '2.3 km'
 */
export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

// ── Duration ──────────────────────────────────────────────────────────────────

/**
 * Format seconds into human label.
 * formatDuration(90)   → '1 min'
 * formatDuration(3720) → '1 hr 2 min'
 */
export function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h} hr ${rem} min` : `${h} hr`;
}

// ── Date / Time ───────────────────────────────────────────────────────────────

/**
 * Format ISO date string to readable date.
 * formatDate('2026-06-12') → '12 Jun 2026'
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Relative time label.
 * formatRelativeTime(date) → 'Just now', '5 min ago', '2 hrs ago', 'Yesterday'
 */
export function formatRelativeTime(date: Date): string {
  const nowMs = Date.now();
  const diffMs = nowMs - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`;
  if (diffHr < 48) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// ── Name ──────────────────────────────────────────────────────────────────────

/**
 * Get first name from full name.
 * getFirstName('Ravi Kumar') → 'Ravi'
 */
export function getFirstName(fullName: string): string {
  return fullName.trim().split(' ')[0] ?? fullName;
}

/**
 * Capitalize first letter of each word.
 * titleCase('ravi kumar') → 'Ravi Kumar'
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ── Order ID ──────────────────────────────────────────────────────────────────

/**
 * Truncate order ID for display.
 * truncateOrderId('ORD-001234') → '#001234'
 */
export function truncateOrderId(id: string): string {
  return id.startsWith('ORD') ? `#${id.slice(4)}` : `#${id}`;
}

// ── Initials ──────────────────────────────────────────────────────────────────

/**
 * Get initials for avatar fallback.
 * getInitials('Ravi Kumar') → 'RK'
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}