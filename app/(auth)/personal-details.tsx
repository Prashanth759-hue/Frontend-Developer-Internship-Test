import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Keyboard,
  Easing,
  Platform,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { DateOfBirthPicker, formatDob } from '../../components/common/DateOfBirthPicker';
import { Calendar } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useLanguage } from '../../theme/LanguageContext';
import { validateName, validateEmail } from '../../utils/validators';
import LOGIN_BG from '../../assets/bg/loginBg';
import { bgTopAnchor } from '../../assets/bg/bgPosition';

const MIN_AGE = 13; // minimum allowed age in years
const MAX_AGE = 100; // maximum allowed age in years

// Latest selectable DOB: someone who turns MIN_AGE today.
function getMaxDate(): Date {
  const today = new Date();
  return new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());
}
// Earliest selectable DOB: someone who turns MAX_AGE today.
function getMinDate(): Date {
  const today = new Date();
  return new Date(today.getFullYear() - MAX_AGE, today.getMonth(), today.getDate());
}

export default function PersonalDetailsScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const { phone, setUser, setAuthenticated } = useAuthStore();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [dobError, setDobError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  // Computed once per mount — the calendar's selectable range is exactly
  // [100 years ago, 13 years ago], so it's physically impossible to pick
  // a date outside the allowed age window.
  const maxDate = useRef(getMaxDate()).current;
  const minDate = useRef(getMinDate()).current;

  // Card sits pinned to the bottom by default (translateY: 0). When the
  // keyboard opens we lift it up by exactly the keyboard's height; when the
  // keyboard closes we always animate back to 0, so the card reliably
  // returns to its original resting position every time.
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

  const handleNameChange = (text: string) => {
    const cleaned = text.replace(/[^A-Za-z \-'.]/g, '');
    setName(cleaned.slice(0, 60));
    if (nameError) setNameError('');
  };

  const handleDOBChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);

    let formatted = '';
    if (cleaned.length <= 2) {
      formatted = cleaned;
    } else if (cleaned.length <= 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    } else {
      formatted =
        cleaned.slice(0, 2) +
        '/' +
        cleaned.slice(2, 4) +
        '/' +
        cleaned.slice(4);
    }

    setDob(formatted);

    if (formatted.length === 10) {
      // Full DD/MM/YYYY typed — validate immediately
      setDobError(getDobError(formatted));
    } else if (dobError) {
      setDobError('');
    }
  };

  const handleEmailChange = (text: string) => {
    const trimmed = text.trim().toLowerCase();
    setEmail(trimmed);

    // Looks like a finished email (name@domain.tld) — validate immediately.
    const looksComplete = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
    if (looksComplete) {
      const result = validateEmail(trimmed);
      setEmailError(result.valid ? '' : (result.error ?? 'Please enter a valid email address'));
    } else if (emailError) {
      setEmailError('');
    }
  };

  // Parses DD/MM/YYYY and returns a Date if it's a real calendar date, else null
  const parseDob = (value: string): Date | null => {
    if (value.length !== 10) return null;
    const [dayStr, monthStr, yearStr] = value.split('/');
    const day = Number(dayStr);
    const month = Number(monthStr);
    const year = Number(yearStr);
    if (!day || !month || !year) return null;

    const parsed = new Date(year, month - 1, day);
    const isRealDate =
      parsed.getDate() === day &&
      parsed.getMonth() === month - 1 &&
      parsed.getFullYear() === year;

    return isRealDate ? parsed : null;
  };

  // Called when the user taps a day on the calendar — formats it the same
  // way as manual typing (DD/MM/YYYY) and runs it through the same
  // validation path, then closes the picker.
  const handleCalendarSelect = (date: Date) => {
    const formatted = formatDob(date);
    setDob(formatted);
    setDobError(getDobError(formatted));
    setShowCalendar(false);
  };

  const getAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const hasNotHadBirthdayThisYear =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
    if (hasNotHadBirthdayThisYear) age -= 1;
    return age;
  };

  // Shared by live-typing validation and the Continue button so both agree.
  const getDobError = (value: string): string => {
    const birthDate = parseDob(value);
    if (!birthDate) {
      return 'Please enter a valid date in DD/MM/YYYY format';
    }
    if (birthDate.getTime() > Date.now()) {
      return 'Date of birth cannot be in the future';
    }
    const age = getAge(birthDate);
    if (age < MIN_AGE) {
      return `You must be at least ${MIN_AGE} years old`;
    }
    if (age > MAX_AGE) {
      return `Please enter a valid date of birth`;
    }
    return '';
  };

  const handleContinue = () => {
    let hasError = false;

    const nameResult = validateName(name);
    if (!nameResult.valid) {
      setNameError(nameResult.error ?? 'Please enter a valid name');
      hasError = true;
    } else {
      setNameError('');
    }

    const dobErrorMsg = dob.length === 0 ? 'Date of birth is required' : getDobError(dob);
    if (dobErrorMsg) {
      setDobError(dobErrorMsg);
      hasError = true;
    } else {
      setDobError('');
    }

    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      setEmailError(emailResult.error ?? 'Please enter a valid email address');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (hasError) return;

    const trimmedName = name.trim();

    // ✅ Save user to store so home & profile screens show the name
    setUser({
      id: Date.now().toString(),
      name: trimmedName,
      phone: phone,
      email: email,
      dob: dob,
    });
    setAuthenticated(true);

    router.replace('/(main)/home');
  };

  const canContinue =
    validateName(name).valid &&
    dob.length === 10 &&
    getDobError(dob) === '' &&
    validateEmail(email).valid;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
      <ImageBackground
        source={LOGIN_BG}
        style={[styles.heroImage, bgTopAnchor]}
        resizeMode="cover"
      >
        <View style={styles.imageOverlay} />
      </ImageBackground>

      <Animated.View
        style={[styles.keyboardAvoider, { transform: [{ translateY: cardOffset }] }]}
      >
        <View style={styles.card}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Text style={styles.heading}>{t('personalHeading')}</Text>
            <Text style={styles.subheading}>{t('personalSubheading')}</Text>

            <Text style={styles.label}>{t('personalNameLabel')}</Text>
            <Input
              value={name}
              onChangeText={handleNameChange}
              placeholder={t('personalNamePlaceholder')}
              maxLength={60}
              error={nameError || undefined}
              returnKeyType="next"
            />

            <Text style={styles.label}>{t('personalDobLabel')}</Text>
            <Input
              value={dob}
              onChangeText={handleDOBChange}
              placeholder={t('personalDobPlaceholder')}
              keyboardType="numeric"
              maxLength={10}
              error={dobError || undefined}
              returnKeyType="next"
              rightIcon={<Calendar size={20} color={Colors.primary} />}
              onRightIconPress={() => setShowCalendar(true)}
            />

            <Text style={styles.label}>{t('personalEmailLabel')}</Text>
            <Input
              value={email}
              onChangeText={handleEmailChange}
              placeholder={t('personalEmailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError || undefined}
              returnKeyType="done"
              onSubmitEditing={canContinue ? handleContinue : undefined}
            />

            <View style={{ marginTop: 20, marginBottom: 8 }}>
              <Button label={t('personalContinue')} onPress={handleContinue} disabled={!canContinue} />
            </View>
          </ScrollView>
        </View>
      </Animated.View>

      <DateOfBirthPicker
        visible={showCalendar}
        value={parseDob(dob)}
        minDate={minDate}
        maxDate={maxDate}
        onSelect={handleCalendarSelect}
        onClose={() => setShowCalendar(false)}
      />
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  // Fixed full-screen background — sits behind everything and never moves,
  // regardless of keyboard state.
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  imageOverlay: { flex: 1, backgroundColor: 'rgba(255,255,255,0.4)' },
  // Only this wrapper resizes/shifts with the keyboard; it floats on top of
  // the fixed background and pins the card to the bottom of the screen.
  keyboardAvoider: { flex: 1, justifyContent: 'flex-end' },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 24,
    maxHeight: '85%',
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  heading: { ...Typography.h1, color: colors.textPrimary },
  subheading: { ...Typography.body, color: colors.textSecondary, marginTop: 8, marginBottom: 20 },
  label: { ...Typography.bodyMedium, marginBottom: 6, marginTop: 12, color: colors.textPrimary },
})
;