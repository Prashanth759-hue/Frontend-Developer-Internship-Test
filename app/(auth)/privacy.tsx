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

export default function PrivacyScreen() {
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

        <View style={styles.card}>
          <Text style={styles.title}>Privacy Policy</Text>

          <Text style={styles.updated}>
            Last updated: 2026 · CORE LINK COMMUNICATION PVT LTD
          </Text>

          <Text style={styles.paragraph}>
            This Privacy Policy explains how CORE LINK COMMUNICATION PVT LTD
            ("we", "us", "Vahan360") collects, uses and protects your
            information when you use our website and services.
          </Text>

          <Text style={styles.sectionTitle}>Information we collect</Text>

          <Text style={styles.bullet}>
            • Contact details you provide, such as name, mobile number and email.
          </Text>

          <Text style={styles.bullet}>
            • Location and trip information needed to provide rides and deliveries.
          </Text>

          <Text style={styles.bullet}>
            • Usage and device information to keep our services secure and reliable.
          </Text>

          <Text style={styles.sectionTitle}>How we use your information</Text>

          <Text style={styles.bullet}>
            • To provide, operate and improve our services.
          </Text>

          <Text style={styles.bullet}>
            • To verify users and drivers and keep the platform safe.
          </Text>

          <Text style={styles.bullet}>
            • To communicate updates, confirmations and support.
          </Text>

          <Text style={styles.sectionTitle}>
            How we protect your information
          </Text>

          <Text style={styles.paragraph}>
            We apply technical and organisational safeguards, including access
            controls and encryption, to protect your data. We do not sell your
            personal information.
          </Text>

          <Text style={styles.sectionTitle}>Your choices</Text>

          <Text style={styles.paragraph}>
            You may request access to, correction of, or deletion of your
            personal data by contacting us at info@vahan360.co.in.
          </Text>

          <Text style={styles.sectionTitle}>Contact</Text>

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
  container: {
  flex: 1,
  backgroundColor: 'transparent',
},
  backgroundImage: {
  flex: 1,
},
  backBtn: {
  width: 46,
  height: 46,
  borderRadius: 23,

  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: colors.surface,

  borderWidth: 1,
  borderColor: '#FFDCC6',

  marginBottom: 16,

  shadowColor: '#FF6B00',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: 4,
  },

  elevation: 4,
},

  content: {
    padding: 20,
  },

  card: {
  backgroundColor: colors.surface,

  borderRadius: 28,

  padding: 22,

  borderWidth: 1,
  borderColor: '#FFE5D6',

  shadowColor: '#FF6B00',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: {
    width: 0,
    height: 6,
  },

  elevation: 6,
},

 title: {
  fontSize: 28,
  fontWeight: '800',
  color: '#FF6B00',
  marginBottom: 8,
},

  updated: {
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: '600',
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 18,
    marginBottom: 10,
  },

  paragraph: {
    fontSize: 15,
    lineHeight: 26,
    color: colors.textSecondary,
  },

 bullet: {
  fontSize: 15,
  lineHeight: 26,
  color: colors.textSecondary,
  marginBottom: 4,
},

  noteBox: {
    marginTop: 24,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.iconBg,
    borderWidth: 1,
    borderColor: '#FFD9C0',
  },

  noteText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#FF6B00',
    fontWeight: '500',
  },
})
;