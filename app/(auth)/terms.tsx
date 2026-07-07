import React from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import HOME_BG from '../../assets/bg/homeBg';

export default function TermsScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  return (
  <ImageBackground
    source={HOME_BG}
    style={styles.backgroundImage}
    resizeMode="cover"
  >
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color="#FF6B00" />
        </TouchableOpacity>

        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>Terms & Conditions</Text>
          <Text style={styles.heroSubtitle}>
            CORE LINK COMMUNICATION PVT LTD
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.updated}>
            Last updated: 2026 · CORE LINK COMMUNICATION PVT LTD
          </Text>

          <Text style={styles.paragraph}>
            By accessing or using Vahan360, operated by CORE LINK COMMUNICATION
            PVT LTD, you agree to these Terms & Conditions.
          </Text>

          <Text style={styles.sectionTitle}>
            Use of the service
          </Text>

          <Text style={styles.paragraph}>
            Vahan360 provides a platform connecting customers, drivers and
            businesses for transportation and logistics services. You agree to
            use the service lawfully and to provide accurate information.
          </Text>

          <Text style={styles.sectionTitle}>
            Accounts
          </Text>

          <Text style={styles.paragraph}>
            You are responsible for activity under your account and for keeping
            your credentials secure.
          </Text>

          <Text style={styles.sectionTitle}>
            Payments
          </Text>

          <Text style={styles.paragraph}>
            Fares and charges are shown before you confirm a booking.
            Applicable taxes and fees may apply.
          </Text>

          <Text style={styles.sectionTitle}>
            Driver partners
          </Text>

          <Text style={styles.paragraph}>
            Drivers must complete verification and compliance checks and comply
            with all applicable laws and permit requirements.
          </Text>

          <Text style={styles.sectionTitle}>
            Limitation of liability
          </Text>

          <Text style={styles.paragraph}>
            Services are provided on a reasonable-effort basis. To the extent
            permitted by law, our liability is limited as described in the full
            agreement.
          </Text>

          <Text style={styles.sectionTitle}>
            Contact
          </Text>

          <Text style={styles.paragraph}>
            CORE LINK COMMUNICATION PVT LTD{'\n'}
            Bengaluru, Karnataka 560100{'\n'}
            Email: info@vahan360.co.in
          </Text>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              This template should be reviewed and finalised with legal counsel
              before launch.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  </ImageBackground>
);
}

const makeStyles = (colors: any) => StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  backBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: '#FF6B00',

    marginBottom: 16,

    shadowColor: '#FF6B00',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  heroHeader: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,

    borderRadius: 30,

    backgroundColor: 'rgba(255,255,255,0.04)',

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
    color: colors.textSecondary,
    fontWeight: '500',
  },

  card: {
    backgroundColor: colors.surface,

    borderRadius: 24,

    padding: 20,

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

  updated: {
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: '700',
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },

  paragraph: {
    fontSize: 15,
    lineHeight: 26,
    color: colors.textSecondary,
  },

  noteBox: {
    marginTop: 24,

    padding: 16,

    borderRadius: 18,

    backgroundColor: colors.iconBg,

    borderWidth: 1,
    borderColor: '#FF6B00',
  },

  noteText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#FF6B00',
    fontWeight: '600',
  },
})
;