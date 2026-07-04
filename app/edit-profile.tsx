import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, ArrowLeft, User } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { validateName, validateEmail, sanitizeName } from '../utils/validators';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name ?? '');
  const [dob, setDob] = useState(user?.dob ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null);

  const [nameError, setNameError] = useState('');
  const [dobError, setDobError] = useState('');
  const [emailError, setEmailError] = useState('');

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleNameChange = (text: string) => {
    const cleaned = sanitizeName(text);
    setName(cleaned);
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
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4);
    }
    setDob(formatted);
    if (dobError) setDobError('');
  };

  const handleEmailChange = (text: string) => {
    const trimmed = text.trim().toLowerCase();
    setEmail(trimmed);
    if (emailError) setEmailError('');
  };

  // ── DOB Validation ──────────────────────────────────────────────────────────

  const getDobError = (value: string): string => {
    if (value.length !== 10) return 'Please enter DOB in DD/MM/YYYY format';
    const [dayStr, monthStr, yearStr] = value.split('/');
    const day = Number(dayStr);
    const month = Number(monthStr);
    const year = Number(yearStr);
    const parsed = new Date(year, month - 1, day);
    const isReal =
      parsed.getDate() === day &&
      parsed.getMonth() === month - 1 &&
      parsed.getFullYear() === year;
    if (!isReal || year < 1900 || year > new Date().getFullYear()) {
      return 'Please enter a valid date';
    }
    if (parsed > new Date()) return 'Date of birth cannot be in the future';
    const age = new Date().getFullYear() - year;
    if (age < 13) return 'You must be at least 13 years old';
    return '';
  };

  // ── Photo ────────────────────────────────────────────────────────────────────

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert('Change Profile Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: openCamera },
      { text: 'Choose from Gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = () => {
    let hasError = false;

    const nameRes = validateName(name);
    if (!nameRes.valid) {
      setNameError(nameRes.error ?? 'Please enter a valid name');
      hasError = true;
    }

    const dobErr = getDobError(dob);
    if (dobErr) {
      setDobError(dobErr);
      hasError = true;
    }

    const emailRes = validateEmail(email);
    if (!emailRes.valid) {
      setEmailError(emailRes.error ?? 'Please enter a valid email address');
      hasError = true;
    }

    if (hasError) return;

    updateUser({
      name: name.trim(),
      dob,
      email,
      avatar: avatar ?? undefined,
    });

    Alert.alert('Success', 'Profile updated successfully!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const initials = name
    .trim()
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const canSave =
    validateName(name).valid &&
    getDobError(dob) === '' &&
    dob.length === 10 &&
    validateEmail(email).valid;

  return (
    <ImageBackground
      source={require('../assets/images/home-bg.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={{ width: 42 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scroll}
          >
            {/* Avatar */}
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={showPhotoOptions} activeOpacity={0.85}>
                <View style={styles.avatarWrapper}>
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitials}>{initials}</Text>
                    </View>
                  )}
                  <View style={styles.cameraOverlay}>
                    <Camera size={16} color="#FFF" />
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.photoButtons}>
                <TouchableOpacity style={styles.photoBtn} onPress={openCamera}>
                  <Camera size={16} color={Colors.primary} />
                  <Text style={styles.photoBtnText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoBtn} onPress={pickFromGallery}>
                  <ImageIcon size={16} color={Colors.primary} />
                  <Text style={styles.photoBtnText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Form */}
            <View style={styles.formCard}>
              <Text style={styles.label}>Full Name</Text>
              <Input
                value={name}
                onChangeText={handleNameChange}
                placeholder="Enter your full name (letters only)"
                maxLength={60}
                error={nameError || undefined}
              />

              <Text style={styles.label}>Date of Birth</Text>
              <Input
                value={dob}
                onChangeText={handleDOBChange}
                placeholder="DD/MM/YYYY"
                keyboardType="numeric"
                maxLength={10}
                error={dobError || undefined}
              />

              <Text style={styles.label}>Email Address</Text>
              <Input
                value={email}
                onChangeText={handleEmailChange}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError || undefined}
              />

              <View style={{ marginTop: 24 }}>
                <Button label="Save Changes" onPress={handleSave} disabled={!canSave} />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },

  scroll: {
    paddingBottom: 40,
    gap: 20,
  },

  avatarSection: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 8,
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarInitials: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFF',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#FFF0E6',
  },
  photoBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },

  formCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FF6B00',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    marginTop: 14,
  },
});