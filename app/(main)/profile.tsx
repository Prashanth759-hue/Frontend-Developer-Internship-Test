import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ImageBackground,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  MapPin,
  CreditCard,
  Globe,
  Sun,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  User,
  Check,
  Edit2,
  Users,
  Bell,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Layout, BorderRadius, Shadow } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { useAuthStore } from '../../store/authStore';
import { useComingSoon } from '../../components/common/ComingSoonModal';
import { clearAllSecureData } from '../../constants/storage';
import { LANGUAGES } from '../../constants/mockData';
import { Button } from '../../components/common/Button';

type ThemeMode = 'light' | 'dark' | 'auto';

function MenuRow({
  icon,
  label,
  onPress,
  danger,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
  value?: string;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.menuRow, { borderBottomColor: colors.divider }]}
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="menuitem"
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? Colors.dangerLight : Colors.primaryLight }]}>
        {icon}
      </View>
      <Text style={[styles.menuLabel, { color: danger ? Colors.danger : colors.textPrimary }]}>
        {label}
      </Text>
      <View style={styles.menuRight}>
        {value && (
          <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{value}</Text>
        )}
        <ChevronRight size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { mode: themeMode, setMode } = useTheme();
  const { lang: selectedLang, setLang, t } = useLanguage();
  const { user, logout } = useAuthStore();
  const { show: showComingSoon, modal } = useComingSoon();
  const [showLangModal, setShowLangModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const handleLogout = () => {
    const doLogout = async () => {
      await clearAllSecureData();
      logout();
      router.replace('/(auth)/login');
    };

    if (Platform.OS === 'web') {
      if (window.confirm(t('logOutConfirmTitle') + '\n' + t('logOutConfirmMsg'))) {
        doLogout();
      }
    } else {
      Alert.alert(
        t('logOutConfirmTitle'),
        t('logOutConfirmMsg'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('logOut'), style: 'destructive', onPress: doLogout },
        ]
      );
    }
  };

  const themeLabel = themeMode === 'light' ? t('themeLight') : themeMode === 'dark' ? t('themeDark') : t('themeAuto');

  const THEME_OPTIONS: { label: string; value: ThemeMode; emoji: string }[] = [
    { label: t('themeLight'), value: 'light', emoji: '☀️' },
    { label: t('themeDark'), value: 'dark', emoji: '🌙' },
    { label: t('themeAuto'), value: 'auto', emoji: '⚙️' },
  ];

  const initials = user?.name
    ?.trim()
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'U';

  return (
  <ImageBackground
    source={require('../../assets/images/home-bg.png')}
    style={styles.backgroundImage}
    resizeMode="cover"
  >
    <SafeAreaView style={styles.safe}>
      {modal}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>{t('myProfile')}</Text>

          <Text style={styles.heroSubtitle}>
            {t('manageAccount')}
          </Text>

          <View style={styles.avatarCard}>
            <View style={styles.avatar}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={{ width: 68, height: 68, borderRadius: 34 }} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.name ?? 'User'}
              </Text>

              <Text style={styles.userPhone}>
                +91 {user?.phone ?? '—'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/edit-profile')}
              style={styles.editBtn}
            >
              <Edit2 size={16} color="#FF6B00" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu */}
        <View style={[styles.menuCard, { backgroundColor: colors.surface }, Shadow.sm]}>
          <MenuRow
            icon={<MapPin size={18} color={Colors.primary} />}
            label={t('savedAddresses')}
            onPress={() => router.push('/saved-addresses')}
          />
          <MenuRow
            icon={<Bell size={18} color={Colors.primary} />}
            label="Notifications"
            onPress={() => router.push('/(main)/notifications')}
          />
          <MenuRow
            icon={<CreditCard size={18} color={Colors.primary} />}
            label={t('paymentMethods')}
            onPress={() => router.push('/payment-methods')}
          />
          <MenuRow
            icon={<Globe size={18} color={Colors.primary} />}
            label={t('language')}
            onPress={() => setShowLangModal(true)}
          />
          <MenuRow
            icon={<Sun size={18} color={Colors.primary} />}
            label={t('theme')}
            value={themeLabel}
            onPress={() => setShowThemeModal(true)}
          />
          <MenuRow
            icon={<HelpCircle size={18} color={Colors.primary} />}
            label={t('helpSupport')}
            onPress={() => router.push('/help')}
          />
          <MenuRow
            icon={<FileText size={18} color={Colors.primary} />}
            label={t('termsConditions')}
            onPress={() => router.push('/(auth)/terms')}
          />
          <MenuRow
            icon={<Users size={18} color={Colors.primary} />}
            label="Refer & Earn"
            onPress={() => router.push('/referral')}
          />
        </View>

        {/* Logout separate for emphasis */}
        <View style={[styles.menuCard, { backgroundColor: colors.surface }, Shadow.sm, { marginTop: 12 }]}>
          <MenuRow
            icon={<LogOut size={18} color={Colors.danger} />}
            label={t('logOut')}
            onPress={handleLogout}
            danger
          />
        </View>

        <Text style={[styles.version, { color: colors.textSecondary }]}>{t('version')}</Text>
      </ScrollView>

      {/* Language modal */}
      <Modal visible={showLangModal} transparent animationType="slide" onRequestClose={() => setShowLangModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>{t('selectLanguage')}</Text>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langRow, { borderBottomColor: colors.divider }]}
                onPress={() => {
                  setLang(lang.code as any);
                  setShowLangModal(false);
                }}
                accessibilityLabel={`Select ${lang.label}`}
              >
                <View>
                  <Text style={[styles.langLabel, { color: colors.textPrimary }]}>{lang.nativeLabel}</Text>
                  <Text style={[styles.langSub, { color: colors.textSecondary }]}>{lang.label}</Text>
                </View>
                {selectedLang === lang.code && (
                  <View style={styles.checkCircle}>
                    <Check size={14} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <Button label={t('done')} onPress={() => setShowLangModal(false)} style={{ marginTop: 16 }} />
          </View>
        </View>
      </Modal>

      {/* Theme modal */}
      <Modal visible={showThemeModal} transparent animationType="slide" onRequestClose={() => setShowThemeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>{t('selectTheme')}</Text>
            {THEME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.langRow, { borderBottomColor: colors.divider }]}
                onPress={() => { setMode(opt.value); setShowThemeModal(false); }}
                accessibilityLabel={`Select ${opt.label} theme`}
              >
                <Text style={[styles.langLabel, { color: colors.textPrimary }]}>
                  {opt.emoji}  {opt.label}
                </Text>
                {themeMode === opt.value && (
                  <View style={styles.checkCircle}>
                    <Check size={14} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <Button label={t('done')} onPress={() => setShowThemeModal(false)} style={{ marginTop: 16 }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
  flex: 1,
},

safe: {
  flex: 1,
  backgroundColor: 'transparent',
},

  heroHeader: {
  paddingTop: 16,
  paddingBottom: 32,
  paddingHorizontal: 20,

  borderBottomLeftRadius: 36,
  borderBottomRightRadius: 36,

  overflow: 'hidden',

  backgroundColor: 'rgba(255,255,255,0.15)',

  marginBottom: 16,
},

heroTitle: {
  fontSize: 28,
  fontWeight: '800',
  color: '#FF6B00',
  letterSpacing: -0.5,
},

heroSubtitle: {
  marginTop: 4,
  fontSize: 13,
  color: '#666',
  fontWeight: '500',
},
  avatarCard: {
  backgroundColor: '#FFFFFF',

  borderRadius: 24,

  borderWidth: 1,
  borderColor: '#FF6B00',

  padding: 20,

  flexDirection: 'row',
  alignItems: 'center',

  gap: 14,

  marginTop: 20,

  shadowColor: '#FF6B00',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: {
    width: 0,
    height: 6,
  },

  elevation: 6,
},
  avatar: {
  width: 68,
  height: 68,
  borderRadius: 34,

  backgroundColor: '#FF6B00',

  justifyContent: 'center',
  alignItems: 'center',
},

avatarText: {
  fontSize: 22,
  fontWeight: '800',
  color: '#FFFFFF',
},
  userInfo: { flex: 1 },
  userName: {
  fontSize: 18,
  fontWeight: '800',
  color: '#1A1A1A',
},

userPhone: {
  fontSize: 13,
  color: '#666',
  marginTop: 3,
},
  editBtn: {
  width: 42,
  height: 42,

  borderRadius: 21,

  backgroundColor: '#FFF0E6',

  justifyContent: 'center',
  alignItems: 'center',

  borderWidth: 1,
  borderColor: '#FF6B00',
},
  menuCard: {
  marginHorizontal: 16,

  borderRadius: 24,

  overflow: 'hidden',

  backgroundColor: '#FFFFFF',

  borderWidth: 1,
  borderColor: '#FF6B00',

  shadowColor: '#FF6B00',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: {
    width: 0,
    height: 6,
  },

  elevation: 6,
},
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    minHeight: 64,
  },
  menuIcon: {
  width: 42,
  height: 42,

  borderRadius: 21,

  backgroundColor: '#FFF0E6',

  justifyContent: 'center',
  alignItems: 'center',

  borderWidth: 1,
  borderColor: '#FF6B00',
},
  menuLabel: { ...Typography.bodyMedium, flex: 1 },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuValue: {
    ...Typography.caption,
  },
  version: {
  textAlign: 'center',
  marginTop: 24,
  marginBottom: 30,

  fontSize: 12,
  color: '#666',
},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,

  padding: 24,
  paddingBottom: 48,

  gap: 4,

  backgroundColor: '#FFFFFF',
},
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: { ...Typography.h2, marginBottom: 12 },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  langLabel: { ...Typography.bodyMedium },
  langSub: { ...Typography.caption, marginTop: 2 },
  checkCircle: {
  width: 26,
  height: 26,

  borderRadius: 13,

  backgroundColor: '#FF6B00',

  justifyContent: 'center',
  alignItems: 'center',
},
});