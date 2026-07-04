import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, MessageSquare, WifiOff, RefreshCw } from 'lucide-react-native';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
  Easing,
  Platform,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../theme/colors';
import { Typography, FontFamily, FontSize } from '../../theme/typography';
import { BorderRadius } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { validateOTP, isValidOTP } from '../../utils/validators';
import { checkRateLimit } from '../../constants/security';
import { secureSet, KEYS } from '../../constants/storage';
import { sendOTP, verifyOTP } from '../../services/api';
import { ArrowLeft } from 'lucide-react-native';
import LOGIN_BG from '../../assets/bg/loginBg';
import { bgTopAnchor } from '../../assets/bg/bgPosition';

const OTP_LENGTH = 6;
const RESEND_TIMEOUT = 15;

type NetworkErrorKind = 'no_internet' | 'timeout' | 'server' | 'invalid_otp' | null;

/** Lightweight check — resolves true if online, false if offline.
 *  On web, the cross-origin HEAD request is blocked by CORS and would
 *  always throw, making us think we're offline. Use navigator.onLine
 *  instead (instant, no network round-trip, no CORS issues). */
async function checkConnectivity(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export default function OTPScreen() {
  const { colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const {
    phone,
    setAuthenticated,
    setUser,
    isLoading,
    setLoading,
  } = useAuthStore();
  // Explicitly typed string array — never use fill(0) here; on web, numeric
  // fill values can bleed into the TextInput rendered value.
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');

  // Separate network/API error state — distinct from local validation errors
  const [networkError, setNetworkError] = useState<NetworkErrorKind>(null);
  // Which action triggered the network error — used to label the retry button
  const [pendingAction, setPendingAction] = useState<'verify' | 'resend' | null>(null);

  const [resendTimer, setResendTimer] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Fade for network error banner — smooth appear/disappear
  const errorBannerOpacity = useRef(new Animated.Value(0)).current;

  const cardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: any) => {
      const keyboardHeight = e?.endCoordinates?.height ?? 0;
      Animated.timing(cardOffset, {
        toValue: -keyboardHeight,
        duration: Platform.OS === 'ios' ? (e?.duration ?? 250) : 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    const onHide = (e: any) => {
      Animated.timing(cardOffset, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e?.duration ?? 250) : 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => { showSub.remove(); hideSub.remove(); };
  }, [cardOffset]);

  // Animate the error banner in when networkError is set, out when cleared
  useEffect(() => {
    Animated.timing(errorBannerOpacity, {
      toValue: networkError ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [networkError, errorBannerOpacity]);

  // Resend countdown
  const startResendTimer = useCallback(() => {
    setCanResend(false);
    setResendTimer(RESEND_TIMEOUT);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanup = startResendTimer();
    return cleanup;
  }, [startResendTimer]);

  const handleOtpChange = (text: string, index: number) => {
    if (otpError) setOtpError('');
    if (networkError) setNetworkError(null);

    // Strip non-digits. On web, paste can deliver multiple chars at once —
    // distribute them across boxes starting from the current index.
    const digits = text.replace(/\D/g, '');

    if (digits.length > 1) {
      const newOtp = [...otp];
      let focusIndex = index;
      for (let d = 0; d < digits.length && index + d < OTP_LENGTH; d++) {
        newOtp[index + d] = digits[d];
        focusIndex = index + d;
      }
      setOtp(newOtp);
      const nextFocus = Math.min(focusIndex + 1, OTP_LENGTH - 1);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const digit = digits.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpStr = otp.join('');
    const result = validateOTP(otpStr);
    if (!result.valid) {
      setOtpError(result.error ?? 'Please enter the complete 6-digit OTP');
      return;
    }
    if (!checkRateLimit('verify_otp', 3, 60_000)) {
      setOtpError('Too many failed attempts. Please request a new OTP.');
      return;
    }

    setOtpError('');
    setNetworkError(null);
    setPendingAction('verify');
    setLoading(true);

    try {
      // Check connectivity before hitting the API
      const online = await checkConnectivity();
      if (!online) {
        setNetworkError('no_internet');
        setLoading(false);
        return;
      }

      // Real call to POST /v1/auth/customer/verify-otp
      const res = await verifyOTP({ phone, otp: otpStr });

      setLoading(false);
      setUser(res.data.user);
      setAuthenticated(true);
      await secureSet(KEYS.AUTH_TOKEN, res.data.token);
      router.replace('/(auth)/personal-details');

    } catch (err: any) {
      setLoading(false);
      if (err?.message === 'timeout') {
        setNetworkError('timeout');
      } else if (/incorrect|invalid.*otp/i.test(err?.message || '')) {
        setOtpError(err.message);
      } else {
        setNetworkError('server');
      }
    }
  };

  const handleResend = async (channel: 'whatsapp' | 'sms') => {
    if (!canResend) return;

    setNetworkError(null);
    setPendingAction('resend');
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setLoading(true);

    try {
      const online = await checkConnectivity();
      if (!online) {
        setNetworkError('no_internet');
        setLoading(false);
        return;
      }

      // Real call to POST /v1/auth/customer/request-otp
      await sendOTP({ phone });

      setLoading(false);
      startResendTimer();
      inputRefs.current[0]?.focus();

    } catch {
      setLoading(false);
      setNetworkError('server');
    }
  };

  // Retry the last failed action
  const handleRetry = () => {
    if (pendingAction === 'verify') {
      handleVerify();
    } else if (pendingAction === 'resend') {
      handleResend('sms');
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={LOGIN_BG} style={[styles.heroImage, bgTopAnchor]} resizeMode="cover">
        <View style={styles.imageOverlay} />
      </ImageBackground>

      <Animated.View style={[styles.keyboardAvoider, { transform: [{ translateY: cardOffset }] }]}>
        <View style={styles.card}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
              <ArrowLeft size={20} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.headerArea}>
              <Text style={[styles.heading, { color: colors.textPrimary }]}>{t('otpHeading')}</Text>
              <Text style={[styles.sub, { color: colors.textSecondary }]}>{t('otpSub')}</Text>
              <Text style={{ color: Colors.primary, fontFamily: 'Inter_600SemiBold' }}>+91 {phone}</Text>
            </View>

            <View style={styles.otpRow}>
              {([0, 1, 2, 3, 4, 5] as const).map((i) => (
                <TextInput
                  key={i}
                  ref={(ref) => { inputRefs.current[i] = ref; }}
                  style={[
                    styles.otpBox,
                    {
                      backgroundColor: otp[i] ? colors.iconBg : colors.inputBackground,
                      borderColor: (otpError || networkError === 'invalid_otp')
                        ? Colors.danger
                        : otp[i] ? Colors.primary : '#FFD9C0',
                      color: colors.textPrimary,
                      borderWidth: (otpError || networkError === 'invalid_otp') ? 2 : otp[i] ? 2 : 1.5,
                    },
                  ]}
                  keyboardType="numeric"
                  maxLength={Platform.OS === 'web' ? 2 : 1}
                  value={otp[i]}
                  onChangeText={(t) => handleOtpChange(t, i)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                  selectTextOnFocus
                  textAlign="center"
                  accessibilityLabel={`OTP digit ${i + 1}`}
                />
              ))}
            </View>

            {/* Local validation error */}
            {otpError ? (
              <Text style={styles.errorText}>{otpError}</Text>
            ) : null}

            {/*
              Network / API error banner — animated, friendly, actionable.
              Shows a clear message + a Retry button so the user always has
              an obvious next step without re-reading what they typed.
            */}
            <Animated.View
              style={[styles.networkErrorBanner, { opacity: errorBannerOpacity }]}
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
              pointerEvents={networkError ? 'auto' : 'none'}
            >
              <View style={styles.networkErrorLeft}>
                <WifiOff size={18} color={Colors.danger} style={{ flexShrink: 0 }} />
                <Text style={styles.networkErrorText}>
                  {networkError === 'no_internet' ? t('otpErrorNoInternet')
                    : networkError === 'timeout' ? t('otpErrorTimeout')
                    : networkError === 'server' ? t('otpErrorServer')
                    : networkError === 'invalid_otp' ? t('otpErrorInvalidOtp')
                    : ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
                accessibilityLabel="Retry"
                accessibilityRole="button"
              >
                <RefreshCw size={14} color={Colors.white} />
                <Text style={styles.retryButtonText}>{t('otpRetry')}</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={{ marginTop: 16 }}>
              <Button
                label={t('otpVerify')}
                onPress={handleVerify}
                disabled={!isValidOTP(otp.join(''))}
                loading={isLoading}
              />
            </View>

            <View style={styles.resendContainer}>
              {!canResend ? (
                <Text style={styles.resendTitle}>
                  {t('otpResendIn').replace('{seconds}', String(resendTimer).padStart(2, '0'))}
                </Text>
              ) : (
                <>
                  <Text style={styles.resendTitle}>
                    {t('otpDidntReceive')}
                  </Text>

                  <View style={styles.resendButtons}>
                    <TouchableOpacity
                      style={styles.resendButton}
                      onPress={() => handleResend('whatsapp')}
                      disabled={isLoading}
                    >
                      <MessageCircle size={20} color="#25D366" />
                      <Text style={styles.resendButtonText}>WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.resendButton}
                      onPress={() => handleResend('sms')}
                      disabled={isLoading}
                    >
                      <MessageSquare size={20} color="#FF6B00" />
                      <Text style={styles.resendButtonText}>SMS</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  imageOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' },
  keyboardAvoider: { flex: 1, justifyContent: 'flex-end' },
  card: {
    backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingTop: 24, paddingHorizontal: 24, maxHeight: '85%',
    shadowColor: colors.textPrimary, shadowOpacity: 0.1, shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 }, elevation: 10,
  },
  scrollContent: { paddingBottom: 36 },
  backBtn: {
    width: 44, height: 44, borderRadius: 22, justifyContent: 'center',
    alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: colors.iconBg, borderWidth: 1.5, borderColor: '#FFD9C0',
  },
  headerArea: { gap: 8, marginTop: 8 },
  heading: { ...Typography.h1 },
  sub: { ...Typography.bodyLarge, lineHeight: 26 },
  otpRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 16 },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    lineHeight: Platform.OS === 'android' ? undefined : FontSize.xl * 1.2,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  errorText: {
    ...Typography.caption, color: Colors.danger, textAlign: 'center',
    backgroundColor: colors.surfaceElevated, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: BorderRadius.md, borderLeftWidth: 3, borderLeftColor: Colors.danger,
    marginTop: 8,
  },

  // ── Network error banner ────────────────────────────────────────────────
  networkErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    gap: 8,
  },
  networkErrorLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  networkErrorText: {
    ...Typography.caption,
    color: Colors.danger,
    flex: 1,
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    flexShrink: 0,
  },
  retryButtonText: {
    ...Typography.caption,
    color: Colors.white,
    fontFamily: FontFamily.semiBold,
  },
  // ────────────────────────────────────────────────────────────────────────

  resendContainer: { marginTop: 24 },
  resendTitle: { fontSize: 18, fontWeight: '700', color: colors.textSecondary, marginBottom: 14 },
  resendButtons: { flexDirection: 'row', gap: 12 },
  resendButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 18, gap: 8,
  },
  resendButtonText: { fontSize: 18, fontWeight: '600', color: colors.textSecondary },
})
;