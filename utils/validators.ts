/**
 * Vahan360 — Input Validators
 *
 * All validation returns { valid: boolean; error?: string }
 * so components can display precise error messages.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ── Phone ─────────────────────────────────────────────────────────────────────

/**
 * Validate Indian 10-digit mobile number.
 * Must start with 6–9. No country code.
 */
export function validatePhone(phone: string): ValidationResult {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 0) {
    return { valid: false, error: 'Mobile number is required' };
  }
  if (digits.length !== 10) {
    return { valid: false, error: 'Enter a valid 10-digit mobile number' };
  }
  if (!/^[6-9]/.test(digits)) {
    return { valid: false, error: 'Number must start with 6, 7, 8, or 9' };
  }
  return { valid: true };
}

/** Convenience boolean — use when you only need true/false */
export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
}

// ── OTP ───────────────────────────────────────────────────────────────────────

export function validateOTP(otp: string): ValidationResult {
  if (otp.length === 0) return { valid: false, error: 'OTP is required' };
  if (!/^\d{6}$/.test(otp)) {
    return { valid: false, error: 'OTP must be exactly 6 digits' };
  }
  return { valid: true };
}

export function isValidOTP(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

// ── Name ──────────────────────────────────────────────────────────────────────

/**
 * Name: only letters (including Indian scripts), spaces, hyphens, apostrophes.
 * Min 2 chars, max 60 chars.
 */
export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (trimmed.length === 0) return { valid: false, error: 'Name is required' };
  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  if (trimmed.length > 60) {
    return { valid: false, error: 'Name must be less than 60 characters' };
  }
  // Only letters (including Indian scripts), spaces, hyphens, apostrophes, periods
  if (!/^[\p{L}\s\-'.]+$/u.test(trimmed)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, or apostrophes' };
  }
  return { valid: true };
}

// ── Email ─────────────────────────────────────────────────────────────────────

export function validateEmail(email: string): ValidationResult {
  if (email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { valid: false, error: 'Enter a valid email address' };
  }
  return { valid: true };
}

// ── Address / Location ────────────────────────────────────────────────────────

/**
 * Address: accepts any characters (alphanumeric, symbols, etc.).
 * Min 5 chars, max 300 chars.
 */
export function validateAddress(address: string): ValidationResult {
  const trimmed = address.trim();
  if (trimmed.length === 0) return { valid: false, error: 'Address is required' };
  if (trimmed.length < 5) {
    return { valid: false, error: 'Please enter at least 5 characters' };
  }
  if (trimmed.length > 300) {
    return { valid: false, error: 'Address must be less than 300 characters' };
  }
  return { valid: true };
}

// ── City ──────────────────────────────────────────────────────────────────────

/**
 * City name: only letters, spaces, hyphens.
 * Min 2 chars, max 60 chars.
 */
export function validateCity(city: string): ValidationResult {
  const trimmed = city.trim();
  if (trimmed.length === 0) return { valid: false, error: 'City is required' };
  if (trimmed.length < 2) {
    return { valid: false, error: 'City name must be at least 2 characters' };
  }
  if (trimmed.length > 60) {
    return { valid: false, error: 'City name must be less than 60 characters' };
  }
  if (!/^[\p{L}\s\-]+$/u.test(trimmed)) {
    return { valid: false, error: 'City name can only contain letters, spaces, or hyphens' };
  }
  return { valid: true };
}

// ── Goods / Parcel Description ────────────────────────────────────────────────

/**
 * Optional description: any characters allowed.
 * Max 300 chars.
 */
export function validateDescription(desc: string): ValidationResult {
  const trimmed = desc.trim();
  if (trimmed.length > 300) {
    return { valid: false, error: 'Description must be less than 300 characters' };
  }
  return { valid: true };
}

// ── Weight ────────────────────────────────────────────────────────────────────

/**
 * Weight field: alphanumeric with units (e.g. "500 kg", "2.5 tons").
 * Min 1 char, max 30 chars.
 */
export function validateWeight(weight: string): ValidationResult {
  const trimmed = weight.trim();
  if (trimmed.length === 0) return { valid: false, error: 'Weight is required' };
  if (trimmed.length > 30) {
    return { valid: false, error: 'Weight must be less than 30 characters' };
  }
  return { valid: true };
}

// ── Address Label ─────────────────────────────────────────────────────────────

/**
 * Address label (e.g. "Home", "Work"): any characters.
 * Min 1 char, max 40 chars.
 */
export function validateAddressLabel(label: string): ValidationResult {
  const trimmed = label.trim();
  if (trimmed.length === 0) return { valid: false, error: 'Label is required' };
  if (trimmed.length < 1) {
    return { valid: false, error: 'Label must be at least 1 character' };
  }
  if (trimmed.length > 40) {
    return { valid: false, error: 'Label must be less than 40 characters' };
  }
  return { valid: true };
}

// ── UPI ID ────────────────────────────────────────────────────────────────────

/**
 * UPI ID: must contain @, min 5 chars, max 50 chars.
 */
export function validateUpiId(upiId: string): ValidationResult {
  const trimmed = upiId.trim();
  if (trimmed.length === 0) return { valid: false, error: 'UPI ID is required' };
  if (!trimmed.includes('@')) {
    return { valid: false, error: 'Enter a valid UPI ID (e.g. name@upi)' };
  }
  if (trimmed.length < 5) {
    return { valid: false, error: 'UPI ID must be at least 5 characters' };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: 'UPI ID must be less than 50 characters' };
  }
  return { valid: true };
}

// ── Card Number ───────────────────────────────────────────────────────────────

/**
 * Card number: exactly 16 digits (spaces stripped).
 */
export function validateCardNumber(cardNumber: string): ValidationResult {
  const digits = cardNumber.replace(/\s/g, '');
  if (digits.length === 0) return { valid: false, error: 'Card number is required' };
  if (digits.length !== 16) {
    return { valid: false, error: 'Card number must be 16 digits' };
  }
  if (!/^\d+$/.test(digits)) {
    return { valid: false, error: 'Card number can only contain digits' };
  }
  return { valid: true };
}

// ── Card Expiry ───────────────────────────────────────────────────────────────

/**
 * Card expiry: MM/YY format.
 */
export function validateCardExpiry(expiry: string): ValidationResult {
  if (expiry.length === 0) return { valid: false, error: 'Expiry date is required' };
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return { valid: false, error: 'Enter expiry in MM/YY format' };
  }
  const [mm, yy] = expiry.split('/').map(Number);
  if (mm < 1 || mm > 12) {
    return { valid: false, error: 'Enter a valid month (01–12)' };
  }
  const now = new Date();
  const expYear = 2000 + yy;
  const expMonth = mm;
  if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
    return { valid: false, error: 'Card has expired' };
  }
  return { valid: true };
}

// ── Card Name ─────────────────────────────────────────────────────────────────

/**
 * Card name: letters and spaces only. Min 2, max 60 chars.
 */
export function validateCardName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (trimmed.length === 0) return { valid: false, error: 'Cardholder name is required' };
  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  if (trimmed.length > 60) {
    return { valid: false, error: 'Name must be less than 60 characters' };
  }
  if (!/^[A-Za-z\s]+$/.test(trimmed)) {
    return { valid: false, error: 'Name can only contain letters and spaces' };
  }
  return { valid: true };
}

// ── Promo Code ────────────────────────────────────────────────────────────────

export function validatePromoCode(code: string): ValidationResult {
  const upper = code.trim().toUpperCase();
  if (upper.length === 0) return { valid: false, error: 'Enter a promo code' };
  if (!/^[A-Z0-9]{4,12}$/.test(upper)) {
    return {
      valid: false,
      error: 'Promo code must be 4–12 alphanumeric characters',
    };
  }
  return { valid: true };
}

// ── Generic required ──────────────────────────────────────────────────────────

export function validateRequired(value: string, fieldName = 'This field'): ValidationResult {
  if (value.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

// ── Phone change handler helper ───────────────────────────────────────────────

/**
 * Use in onChangeText for phone fields.
 * Strips non-digits, caps at 10 digits.
 */
export function sanitizePhone(text: string): string {
  return text.replace(/\D/g, '').slice(0, 10);
}

/**
 * Use in onChangeText for name fields.
 * Strips characters that are not letters, spaces, hyphens, apostrophes, or periods.
 */
export function sanitizeName(text: string): string {
  return text.replace(/[^A-Za-z\u0080-\uFFFF\s\-'.]/g, '').slice(0, 60);
}