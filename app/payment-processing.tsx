import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, BackHandler,
  ImageBackground, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Shield, Lock } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../theme/LanguageContext';
import HOME_BG from '../assets/bg/homeBg';

const PROCESSING_STEPS = [
  'Initiating secure payment...',
  'Verifying payment details...',
  'Connecting to payment gateway...',
  'Authorising transaction...',
  'Confirming with bank...',
];

export default function PaymentProcessingScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const { t } = useLanguage();
  const { amount, type } = useLocalSearchParams<{ amount: string; type: string }>();
  const [stepIndex, setStepIndex] = useState(0);

  // Block hardware back during processing
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < PROCESSING_STEPS.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 1000);

    // Simulate outcome: 80% success, 20% failure
    const outcome = Math.random() < 0.8 ? 'success' : 'failure';
    const totalTime = 5500;

    const doneTimer = setTimeout(() => {
      if (outcome === 'success') {
        router.replace({
          pathname: '/payment-success',
          params: { amount: amount ?? '0', type: type ?? 'add_money' },
        });
      } else {
        router.replace({
          pathname: '/payment-failure',
          params: { amount: amount ?? '0', type: type ?? 'add_money' },
        });
      }
    }, totalTime);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <ImageBackground
      source={HOME_BG}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        <View style={styles.container}>

          {/* Lock icon + spinner */}
          <View style={styles.iconWrap}>
            <View style={styles.iconCircle}>
              <Lock size={36} color={Colors.primary} />
            </View>
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={styles.spinner}
            />
          </View>

          <Text style={styles.title}>{t('paymentProcessing')}</Text>
          <Text style={styles.amountText}>₹{parseInt(amount ?? '0', 10).toLocaleString('en-IN')}</Text>
          <Text style={styles.stepText}>{PROCESSING_STEPS[stepIndex]}</Text>

          {/* Step dots */}
          <View style={styles.dotsRow}>
            {PROCESSING_STEPS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx <= stepIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Do not press back warning */}
          <View style={styles.warningCard}>
            <Shield size={16} color="#D97706" />
            <Text style={styles.warningText}>
              {t('paymentProcessingNote')}
            </Text>
          </View>

          <View style={styles.secureRow}>
            <Shield size={13} color="#9CA3AF" />
            <Text style={styles.secureText}>256-bit SSL encrypted · Powered by Vahan Pay</Text>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 32, gap: 16,
  },

  iconWrap: { position: 'relative', width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.iconBg, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.iconBorder,
  },
  spinner: {
    position: 'absolute', width: 100, height: 100,
  },

  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  amountText: { fontSize: 36, fontWeight: '800', color: Colors.primary },
  stepText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', minHeight: 20 },

  dotsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: Colors.primary },

  warningCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: colors.surfaceElevated, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#FDE68A', marginTop: 8,
    width: '100%',
  },
  warningText: { flex: 1, fontSize: 13, color: '#F59E0B', lineHeight: 20 },

  secureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8,
  },
  secureText: { fontSize: 12, color: colors.placeholder },
})
;
