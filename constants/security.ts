/**
 * Security utility — input sanitization and validation
 * Follows OWASP mobile top 10 guidelines
 */

// Sanitize plain text — strip HTML/script tags
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')          // strip HTML tags
    .replace(/[<>"'&]/g, (c) => {     // escape special chars
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return map[c];
    })
    .trim();
}

// Validate Indian phone number (10 digits, no leading 0)
export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

// Validate OTP — exactly 6 digits
export function isValidOTP(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

// Validate name — letters, spaces, hyphens only, 2-50 chars
export function isValidName(name: string): boolean {
  return /^[a-zA-Z\u0900-\u097F\s\-'.]{2,50}$/.test(name.trim());
}

// Validate email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Validate Aadhaar number — 12 digits, Luhn-like check
export function isValidAadhaar(number: string): boolean {
  return /^\d{12}$/.test(number);
}

// Validate PAN — format: ABCDE1234F
export function isValidPAN(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
}

// Validate IFSC code
export function isValidIFSC(ifsc: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase());
}

// Rate limiting — simple in-memory token bucket per action
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  action: string,
  maxAttempts = 5,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const existing = rateLimitMap.get(action);

  if (!existing || now > existing.resetAt) {
    rateLimitMap.set(action, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (existing.count >= maxAttempts) {
    return false; // blocked
  }

  existing.count += 1;
  return true;
}

export function resetRateLimit(action: string): void {
  rateLimitMap.delete(action);
}

// Mask phone for display: +91 98765 *****
export function maskPhone(phone: string): string {
  if (phone.length < 5) return phone;
  return phone.slice(0, 5) + '*'.repeat(phone.length - 5);
}

// Mask Aadhaar for display: XXXX XXXX 1234
export function maskAadhaar(num: string): string {
  if (num.length !== 12) return num;
  return `XXXX XXXX ${num.slice(-4)}`;
}

// Generate a pseudo-random booking ID (frontend only, not cryptographically secure)
export function generateBookingId(): string {
  return 'V' + Math.random().toString(36).substring(2, 9).toUpperCase();
}