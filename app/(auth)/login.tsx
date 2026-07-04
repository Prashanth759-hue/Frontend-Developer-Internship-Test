import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Keyboard,
  Easing,
  Platform,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Layout } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuthStore } from '../../store/authStore';
import { checkRateLimit } from '../../constants/security';
import { validatePhone, isValidPhone } from '../../utils/validators';


export default function LoginScreen() {
  const { colors } = useTheme();
  const {
    setPhone,
    setLoading,
    isLoading,
  } = useAuthStore();
  const [phoneInput, setPhoneInput] = useState('');
  const [localError, setLocalError] = useState('');

  // Fade-in for the loading overlay — appears smoothly without blocking layout
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Card sits pinned to the bottom by default (translateY: 0). When the
  // keyboard opens we lift it up by exactly the keyboard's height; when the
  // keyboard closes we always animate back to 0, so the card reliably
  // returns to its original resting position every time — regardless of
  // platform quirks with KeyboardAvoidingView's "height" mode.
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

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [cardOffset]);

  // Animate overlay in/out whenever isLoading changes
  useEffect(() => {
    Animated.timing(overlayOpacity, {
      toValue: isLoading ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isLoading, overlayOpacity]);

  // "Send OTP" should only open once the number is actually a complete,
  // valid 10-digit Indian mobile number — not just "non-empty".
  const isPhoneComplete = isValidPhone(phoneInput);

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    setPhoneInput(digits);

    if (digits.length === 10) {
      // Full 10 digits entered — validate immediately (length + leading 6-9 rule)
      const result = validatePhone(digits);
      setLocalError(result.valid ? '' : (result.error ?? 'Please enter a valid mobile number'));
    } else if (localError) {
      setLocalError('');
    }
  };

  const handleSendOTP = () => {
    const result = validatePhone(phoneInput);
    if (!result.valid) {
      setLocalError(result.error ?? 'Please enter a valid mobile number');
      return;
    }

    if (!checkRateLimit('send_otp', 5, 60_000)) {
      setLocalError('Too many attempts. Please wait a minute and try again.');
      return;
    }

    setLocalError('');
    setPhone(phoneInput);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/(auth)/otp');
    }, 1200);
  };

  return (
    <View style={styles.container}>
      {/* Background Image — stays fixed, never moves with keyboard */}
      <ImageBackground
        source={require('../../assets/images/login-bg.png')}
        style={styles.heroImage}
        resizeMode="cover"
      >
        <View style={styles.imageOverlay} />
      </ImageBackground>

      {/* Bottom Login Card — this is the only thing that should move with the keyboard */}
      <Animated.View
        style={[styles.keyboardAvoider, { transform: [{ translateY: cardOffset }] }]}
      >
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Text style={styles.heading}>
              Let's get started
            </Text>

            <Text
              style={[
                styles.subheading,
                { color: colors.textSecondary },
              ]}
            >
              Login with your mobile number
            </Text>

            <Text
              style={[
                styles.fieldLabel,
                { color: colors.textPrimary },
              ]}
            >
              Mobile Number
            </Text>

            <View style={styles.phoneRow}>
              <View
                style={[
                  styles.countryCode,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.countryText, { color: colors.textPrimary }]}>
                  🇮🇳 +91
                </Text>
              </View>

              <Input
                value={phoneInput}
                onChangeText={handlePhoneChange}
                keyboardType="numeric"
                placeholder="10-digit mobile number"
                maxLength={10}
                containerStyle={{ flex: 1 }}
                error={localError || undefined}
                accessibilityLabel="Mobile number input"
                returnKeyType="done"
                onSubmitEditing={handleSendOTP}
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <Button
                label="Send OTP"
                onPress={handleSendOTP}
                disabled={!isPhoneComplete}
                loading={isLoading}
                accessibilityLabel="Send OTP to mobile number"
              />
            </View>

            <Text
              style={[
                styles.terms,
                { color: colors.textSecondary },
              ]}
            >
              By continuing you agree to our{' '}
              <Text
                style={{ color: Colors.primary }}
                onPress={() => router.push('../(auth)/terms')}
              >
                Terms & Conditions
              </Text>
              {' '}and{' '}
              <Text
                style={{ color: Colors.primary }}
                onPress={() => router.push('../(auth)/privacy')}
              >
                Privacy Policy
              </Text>
            </Text>
          </ScrollView>
        </View>
      </Animated.View>

      {/*
        Non-blocking loading overlay — floats above the card but does NOT
        cover the full screen, so the background and layout remain visible.
        It fades in/out smoothly via overlayOpacity so there's no jarring
        flash. The ActivityIndicator is centred inside the card area only,
        matching the placement described in the test spec.
        pointerEvents="none" keeps it truly non-blocking: touches pass
        through to the content underneath while the spinner is visible.
      */}
      <Animated.View
        style={[styles.loadingOverlay, { opacity: overlayOpacity }]}
        pointerEvents="none"
        accessibilityLiveRegion="polite"
        accessibilityLabel="Sending OTP, please wait"
      >
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Sending OTP…</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroArea: {
    alignItems: 'center',
    gap: 10,
  },
  // Fixed full-screen background — sits behind everything and never moves,
  // regardless of keyboard state.
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  logoImage: {
    width: 220,
    height: 120,
    marginBottom: 0,
  },
  appName: {
    ...Typography.h1,
  },
  tagline: {
    ...Typography.caption,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // Only this wrapper resizes/shifts with the keyboard; it floats on top of
  // the fixed background and pins the card to the bottom of the screen.
  keyboardAvoider: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFF',

    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,

    paddingTop: 24,
    paddingHorizontal: 24,

    maxHeight: '78%',

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: -2,
    },

    elevation: 10,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  heading: {
    ...Typography.h3,
  },
  subheading: {
    ...Typography.body,
    lineHeight: 22,
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  countryCode: {
    height: Layout.inputHeight,
    paddingHorizontal: 14,
    borderRadius: Layout.inputRadius,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 88,
  },
  countryText: {
    ...Typography.bodyMedium,
  },
  fieldLabel: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    marginBottom: 6,
  },
  terms: {
    ...Typography.caption,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 16,
  },

  // ── Loading overlay ──────────────────────────────────────────────────────
  // Positioned to sit over the card area only (bottom 78% of the screen),
  // so the hero background behind the card stays fully visible — the
  // loading state is visible but non-blocking and does not break layout.
  loadingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '78%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  loadingBox: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.primary,
  },
});