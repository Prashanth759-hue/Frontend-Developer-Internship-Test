import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import {
  validateName,
  validatePhone,
  sanitizeName,
  sanitizePhone,
} from '../utils/validators';

/**
 * Shared Sender / Receiver form logic used on the Truck (goods-details),
 * Parcel, and Packers & Movers detail screens.
 *
 * - Sender name & phone are auto-filled from the logged-in user's profile
 *   (still editable, in case someone is booking on another person's behalf).
 * - Receiver has a "Use my details" toggle — when on, receiver fields mirror
 *   the sender fields (and stay in sync if the sender fields are edited),
 *   and are locked from direct editing. Turning it off restores whatever
 *   the receiver fields held before it was switched on.
 */
export function useSenderReceiver() {
  const user = useAuthStore((state) => state.user);

  // ── Sender ─────────────────────────────────────────────────────────────
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderNameError, setSenderNameError] = useState('');
  const [senderPhoneError, setSenderPhoneError] = useState('');

  // ── Receiver ───────────────────────────────────────────────────────────
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverNameError, setReceiverNameError] = useState('');
  const [receiverPhoneError, setReceiverPhoneError] = useState('');

  const [sameAsSender, setSameAsSender] = useState(false);
  const savedReceiver = useRef({ name: '', phone: '' });

  // Auto-fill sender from the user's profile once it's available. Only fills
  // empty fields so it never clobbers something the person already typed.
  useEffect(() => {
    if (!user) return;
    setSenderName((prev) => (prev ? prev : sanitizeName(user.name ?? '')));
    setSenderPhone((prev) => (prev ? prev : sanitizePhone(user.phone ?? '')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name, user?.phone]);

  // Keep receiver mirrored to sender while "Use my details" is active.
  useEffect(() => {
    if (!sameAsSender) return;
    setReceiverName(senderName);
    setReceiverPhone(senderPhone);
    setReceiverNameError('');
    setReceiverPhoneError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sameAsSender, senderName, senderPhone]);

  const onSenderNameChange = (text: string) => {
    const cleaned = sanitizeName(text);
    setSenderName(cleaned);
    setSenderNameError(cleaned.length > 0 ? (validateName(cleaned).error ?? '') : '');
  };

  const onSenderPhoneChange = (text: string) => {
    const digits = sanitizePhone(text);
    setSenderPhone(digits);
    setSenderPhoneError(digits.length > 0 ? (validatePhone(digits).error ?? '') : '');
  };

  const onReceiverNameChange = (text: string) => {
    if (sameAsSender) return;
    const cleaned = sanitizeName(text);
    setReceiverName(cleaned);
    setReceiverNameError(cleaned.length > 0 ? (validateName(cleaned).error ?? '') : '');
  };

  const onReceiverPhoneChange = (text: string) => {
    if (sameAsSender) return;
    const digits = sanitizePhone(text);
    setReceiverPhone(digits);
    setReceiverPhoneError(digits.length > 0 ? (validatePhone(digits).error ?? '') : '');
  };

  const toggleSameAsSender = () => {
    setSameAsSender((prev) => {
      const next = !prev;
      if (next) {
        savedReceiver.current = { name: receiverName, phone: receiverPhone };
        setReceiverName(senderName);
        setReceiverPhone(senderPhone);
        setReceiverNameError('');
        setReceiverPhoneError('');
      } else {
        setReceiverName(savedReceiver.current.name);
        setReceiverPhone(savedReceiver.current.phone);
      }
      return next;
    });
  };

  const isSenderValid = validateName(senderName).valid && validatePhone(senderPhone).valid;
  const isReceiverValid = validateName(receiverName).valid && validatePhone(receiverPhone).valid;

  /** Runs full validation and surfaces any errors inline. Returns true if valid. */
  const validateSenderReceiver = (): boolean => {
    let ok = true;
    const snRes = validateName(senderName);
    if (!snRes.valid) { setSenderNameError(snRes.error ?? 'Invalid name'); ok = false; }
    const spRes = validatePhone(senderPhone);
    if (!spRes.valid) { setSenderPhoneError(spRes.error ?? 'Invalid phone'); ok = false; }
    const rnRes = validateName(receiverName);
    if (!rnRes.valid) { setReceiverNameError(rnRes.error ?? 'Invalid name'); ok = false; }
    const rpRes = validatePhone(receiverPhone);
    if (!rpRes.valid) { setReceiverPhoneError(rpRes.error ?? 'Invalid phone'); ok = false; }
    return ok;
  };

  return {
    senderName, senderPhone, senderNameError, senderPhoneError,
    receiverName, receiverPhone, receiverNameError, receiverPhoneError,
    sameAsSender, toggleSameAsSender,
    onSenderNameChange, onSenderPhoneChange,
    onReceiverNameChange, onReceiverPhoneChange,
    isSenderValid, isReceiverValid,
    validateSenderReceiver,
  };
}