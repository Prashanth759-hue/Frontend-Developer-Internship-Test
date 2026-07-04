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
import { Typography } from '../../theme/typography';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';
import { validateName, validateEmail } from '../../utils/validators';

const MIN_AGE = 13; // minimum allowed age in years

export default function PersonalDetailsScreen() {
  const { phone, setUser, setAuthenticated } = useAuthStore();

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [dobError, setDobError] = useState('');
  const [emailError, setEmailError] = useState('');

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
    if (birthDate.getFullYear() < 1900) {
      return 'Please enter a valid date';
    }
    if (getAge(birthDate) < MIN_AGE) {
      return `You must be at least ${MIN_AGE} years old`;
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
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/login-bg.png')}
        style={styles.heroImage}
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
            <Text style={styles.heading}>Personal Details</Text>
            <Text style={styles.subheading}>Complete your profile to continue</Text>

            <Text style={styles.label}>Full Name</Text>
            <Input
              value={name}
              onChangeText={handleNameChange}
              placeholder="Enter your full name"
              maxLength={60}
              error={nameError || undefined}
              returnKeyType="next"
            />

            <Text style={styles.label}>Date of Birth</Text>
            <Input
              value={dob}
              onChangeText={handleDOBChange}
              placeholder="DD/MM/YYYY"
              keyboardType="numeric"
              maxLength={10}
              error={dobError || undefined}
              returnKeyType="next"
            />

            <Text style={styles.label}>Email Address</Text>
            <Input
              value={email}
              onChangeText={handleEmailChange}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError || undefined}
              returnKeyType="done"
              onSubmitEditing={canContinue ? handleContinue : undefined}
            />

            <View style={{ marginTop: 20, marginBottom: 8 }}>
              <Button label="Continue" onPress={handleContinue} disabled={!canContinue} />
            </View>
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  // Fixed full-screen background — sits behind everything and never moves,
  // regardless of keyboard state.
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  imageOverlay: { flex: 1, backgroundColor: 'rgba(255,255,255,0.4)' },
  // Only this wrapper resizes/shifts with the keyboard; it floats on top of
  // the fixed background and pins the card to the bottom of the screen.
  keyboardAvoider: { flex: 1, justifyContent: 'flex-end' },
  card: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  heading: { ...Typography.h1, color: '#1F2937' },
  subheading: { ...Typography.body, color: '#6B7280', marginTop: 8, marginBottom: 20 },
  label: { ...Typography.bodyMedium, marginBottom: 6, marginTop: 12, color: '#111827' },
});