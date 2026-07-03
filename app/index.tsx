import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { router } from 'expo-router';
import { useLanguage, LANG_LIST, LangCode } from '../theme/LanguageContext';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { FontFamily, FontSize } from '../theme/typography';
import INDEX_BG from '../assets/bg/indexBg';
import { bgTopAnchorImg } from '../assets/bg/bgPosition';

const SPLASH_DURATION = 2200;

export default function SplashIndex() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const { lang, setLang, hasChosen } = useLanguage();
  const [imageReady, setImageReady] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LangCode>(lang);

  const modalSlide = useRef(new Animated.Value(400)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Once splash image is painted AND it's a first-launch, show picker.
  // Returning users skip straight to login.
  useEffect(() => {
    if (!imageReady) return;

    if (hasChosen) {
      // Already picked before — go straight to login after splash
      const timer = setTimeout(() => router.replace('/(auth)/login'), SPLASH_DURATION);
      return () => clearTimeout(timer);
    } else {
      // First launch — wait for splash, then pop up picker
      const timer = setTimeout(() => {
        setModalVisible(true);
        Animated.parallel([
          Animated.spring(modalSlide, {
            toValue: 0,
            useNativeDriver: true,
            damping: 22,
            stiffness: 200,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }, SPLASH_DURATION);
      return () => clearTimeout(timer);
    }
  }, [imageReady, hasChosen]);

  const handleConfirm = () => {
    // Animate sheet out, then navigate
    Animated.parallel([
      Animated.timing(modalSlide, {
        toValue: 400,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setLang(selectedLang);
      router.replace('/(auth)/login');
    });
  };

  const handleImageReady = useCallback(() => setImageReady(true), []);

  return (
    <View style={styles.container}>
      <Image
        source={INDEX_BG}
        style={[styles.image, bgTopAnchorImg]}
        resizeMode="cover"
        onLoadEnd={handleImageReady}
      />

      {/* Language selection modal — only shown on first launch */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => {}} // Prevent back-button dismiss — user must pick
        statusBarTranslucent
      >
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />

        <View style={styles.backdropTouchable}>
          <Animated.View
            style={[styles.sheet, { transform: [{ translateY: modalSlide }] }]}
          >
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <Text style={styles.title}>Choose Your Language</Text>
            <Text style={styles.subtitle}>
              ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ · மொழியை தேர்ந்தெடு · భాష ఎంచుకోండి · भाषा चुनें
            </Text>

            {/* Options */}
            <View style={styles.optionList}>
              {LANG_LIST.map((item) => {
                const isActive = item.code === selectedLang;
                return (
                  <TouchableOpacity
                    key={item.code}
                    onPress={() => setSelectedLang(item.code as LangCode)}
                    style={[
                      styles.optionRow,
                      isActive && styles.optionRowActive,
                    ]}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isActive }}
                  >
                    <View style={styles.optionTextGroup}>
                      <Text style={[styles.optionNative, isActive && styles.optionNativeActive]}>
                        {item.label}
                      </Text>
                      <Text style={styles.optionEnglish}>{item.englishLabel}</Text>
                    </View>
                    <View style={[styles.radioCircle, isActive && styles.radioCircleActive]}>
                      {isActive && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Confirm button */}
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirm}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              <Text style={styles.confirmBtnText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  image: { flex: 1, width: '100%', height: '100%' },

  // ── Modal backdrop ─────────────────────────────────────────────────────
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  backdropTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  // ── Bottom sheet ───────────────────────────────────────────────────────
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 22,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: colors.placeholder,
    lineHeight: 18,
    marginBottom: 20,
  },

  // ── Language options ───────────────────────────────────────────────────
  optionList: { gap: 10, marginBottom: 24 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionRowActive: {
    borderColor: Colors.primary,
    backgroundColor: colors.iconBg,
  },
  optionTextGroup: { gap: 2 },
  optionNative: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
    color: colors.textPrimary,
  },
  optionNativeActive: {
    color: Colors.primary,
  },
  optionEnglish: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: colors.placeholder,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  // ── Confirm button ─────────────────────────────────────────────────────
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: colors.surface,
    letterSpacing: 0.3,
  },
})
;