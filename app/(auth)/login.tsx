import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
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
import { Typography, FontFamily, FontSize } from '../../theme/typography';
import { Layout, BorderRadius } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage, LANG_LIST, LangCode } from '../../theme/LanguageContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuthStore } from '../../store/authStore';
import { sendOTP } from '../../services/api';
import { checkRateLimit } from '../../constants/security';
import { validatePhone, isValidPhone } from '../../utils/validators';
import LOGIN_BG from '../../assets/bg/loginBg';
import { bgTopAnchor } from '../../assets/bg/bgPosition';

export default function LoginScreen() {
  const { colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const { t, lang, setLang } = useLanguage();
  const { setPhone, setLoading, isLoading } = useAuthStore();

  const [phoneInput, setPhoneInput] = useState('');
  const [localError, setLocalError] = useState('');
  const [langModalVisible, setLangModalVisible] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardOffset = useRef(new Animated.Value(0)).current;
  // Modal sheet slides up from bottom
  const modalSlide = useRef(new Animated.Value(300)).current;

  // ── Keyboard handling ──────────────────────────────────────────────────
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: any) => {
      Animated.timing(cardOffset, {
        toValue: -(e?.endCoordinates?.height ?? 0),
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

  // ── Loading overlay ────────────────────────────────────────────────────
  useEffect(() => {
    Animated.timing(overlayOpacity, {
      toValue: isLoading ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isLoading, overlayOpacity]);

  // ── Modal open/close animations ────────────────────────────────────────
  const openLangModal = () => {
    setLangModalVisible(true);
    Animated.spring(modalSlide, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 180,
    }).start();
  };

  const closeLangModal = () => {
    Animated.timing(modalSlide, {
      toValue: 300,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setLangModalVisible(false));
  };

  const handleSelectLang = (code: LangCode) => {
    setLang(code);
    closeLangModal();
  };

  // ── Phone / OTP logic ──────────────────────────────────────────────────
  const isPhoneComplete = isValidPhone(phoneInput);

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    setPhoneInput(digits);
    if (digits.length === 10) {
      const result = validatePhone(digits);
      setLocalError(result.valid ? '' : (result.error ?? t('loginErrorInvalid')));
    } else if (localError) {
      setLocalError('');
    }
  };

  const handleSendOTP = async () => {
    const result = validatePhone(phoneInput);
    if (!result.valid) {
      setLocalError(result.error ?? t('loginErrorInvalid'));
      return;
    }
    if (!checkRateLimit('send_otp', 5, 60_000)) {
      setLocalError(t('loginErrorTooMany'));
      return;
    }
    setLocalError('');
    setPhone(phoneInput);
    setLoading(true);
    try {
      await sendOTP({ phone: phoneInput });
      router.push('/(auth)/otp');
    } catch (err: any) {
      setLocalError(err?.message ?? 'Could not send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Active language label for the button
  const activeLang = LANG_LIST.find(l => l.code === lang);

  return (
    <View style={styles.container}>
      {/* ── Background ── */}
      <ImageBackground
        source={LOGIN_BG}
        style={[styles.heroImage, bgTopAnchor]}
        resizeMode="cover"
      >
        <View style={styles.imageOverlay} />
      </ImageBackground>

      {/* ── Card ── */}
      <Animated.View style={[styles.keyboardAvoider, { transform: [{ translateY: cardOffset }] }]}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Heading + subheading on the left, language pill on the right */}
            <View style={styles.headingRow}>
              <View style={styles.headingTextBlock}>
                <Text style={styles.heading}>{t('loginHeading')}</Text>
                <Text style={[styles.subheading, { color: colors.textSecondary }]}>
                  {t('loginSubheading')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={openLangModal}
                style={[styles.langTrigger, { borderColor: Colors.primary, backgroundColor: colors.iconBg }]}
                accessibilityRole="button"
                accessibilityLabel="Select language"
              >
                <Text style={styles.langTriggerIcon}>🌐</Text>
                <Text style={styles.langTriggerText}>{activeLang?.label ?? 'English'}</Text>
                <Text style={styles.langTriggerChevron}>▾</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
              {t('loginFieldLabel')}
            </Text>

            <View style={styles.phoneRow}>
              <View style={[styles.countryCode, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <Text style={[styles.countryText, { color: colors.textPrimary }]}>🇮🇳 +91</Text>
              </View>
              <Input
                value={phoneInput}
                onChangeText={handlePhoneChange}
                keyboardType="numeric"
                placeholder={t('loginPlaceholder')}
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
                label={t('loginSendOtp')}
                onPress={handleSendOTP}
                disabled={!isPhoneComplete}
                loading={isLoading}
                accessibilityLabel="Send OTP to mobile number"
              />
            </View>

            <Text style={[styles.terms, { color: colors.textSecondary }]}>
              {t('loginTermsPrefix')}{' '}
              <Text style={{ color: Colors.primary }} onPress={() => router.push('../(auth)/terms')}>
                {t('loginTermsLink')}
              </Text>
              {' '}{t('loginTermsAnd')}{' '}
              <Text style={{ color: Colors.primary }} onPress={() => router.push('../(auth)/privacy')}>
                {t('loginPrivacyLink')}
              </Text>
            </Text>
          </ScrollView>
        </View>
      </Animated.View>

      {/* ── Loading overlay ── */}
      <Animated.View
        style={[styles.loadingOverlay, { opacity: overlayOpacity }]}
        pointerEvents="none"
        accessibilityLiveRegion="polite"
      >
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t('loginSending')}</Text>
        </View>
      </Animated.View>

      {/* ── Language Modal ── */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeLangModal}
        statusBarTranslucent
      >
        {/* Dim backdrop — tap to dismiss */}
        <Pressable style={styles.modalBackdrop} onPress={closeLangModal}>
          {/* Stop propagation so taps on the sheet don't close it */}
          <Pressable>
            <Animated.View
              style={[
                styles.modalSheet,
                { backgroundColor: colors.surface, transform: [{ translateY: modalSlide }] },
              ]}
            >
              {/* Handle bar */}
              <View style={[styles.handle, { backgroundColor: colors.border }]} />

              {/* Title */}
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Select Language
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                भाषा चुनें · ভাষা বেছে নিন · மொழியை தேர்ந்தெடு
              </Text>

              {/* Language options */}
              <View style={styles.optionList}>
                {LANG_LIST.map((item) => {
                  const isActive = item.code === lang;
                  return (
                    <TouchableOpacity
                      key={item.code}
                      onPress={() => handleSelectLang(item.code as LangCode)}
                      style={[
                        styles.optionRow,
                        {
                          backgroundColor: isActive ? colors.iconBg : colors.surface,
                          borderColor: isActive ? Colors.primary : colors.border,
                        },
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isActive }}
                    >
                      <View style={styles.optionTextGroup}>
                        <Text style={[styles.optionNative, { color: isActive ? Colors.primary : colors.textPrimary }]}>
                          {item.label}
                        </Text>
                        <Text style={[styles.optionEnglish, { color: colors.textSecondary }]}>
                          {item.englishLabel}
                        </Text>
                      </View>
                      {/* Checkmark */}
                      <View style={[
                        styles.radioCircle,
                        { borderColor: isActive ? Colors.primary : colors.border },
                      ]}>
                        {isActive && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  imageOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.10)' },
  keyboardAvoider: { flex: 1, justifyContent: 'flex-end' },
  card: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 16,
    paddingHorizontal: 24,
    maxHeight: '78%',
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
  scrollContent: { paddingBottom: 36 },

  // ── Language trigger button ────────────────────────────────────────────
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headingTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  langTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  langTriggerIcon: { fontSize: 14 },
  langTriggerText: {
    fontSize: 13,
    fontFamily: FontFamily.semiBold,
    color: Colors.primary,
  },
  langTriggerChevron: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 1,
  },

  // ── Card content ───────────────────────────────────────────────────────
  heading: { ...Typography.h3 },
  subheading: { ...Typography.body, lineHeight: 22, marginBottom: 4 },
  phoneRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  countryCode: {
    height: Layout.inputHeight,
    paddingHorizontal: 14,
    borderRadius: Layout.inputRadius,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 88,
  },
  countryText: { ...Typography.bodyMedium },
  fieldLabel: { ...Typography.bodyMedium, color: Colors.primary, marginBottom: 6 },
  terms: { ...Typography.caption, textAlign: 'center', lineHeight: 18, marginTop: 16 },

  // ── Loading overlay ────────────────────────────────────────────────────
  loadingOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '78%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: colors.surface,
  },
  loadingBox: { alignItems: 'center', gap: 12 },
  loadingText: { ...Typography.bodyMedium, color: Colors.primary },

  // ── Language modal ─────────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 36,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    marginBottom: 20,
    lineHeight: 18,
  },
  optionList: { gap: 10 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  optionTextGroup: { gap: 2 },
  optionNative: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
  },
  optionEnglish: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
})
;