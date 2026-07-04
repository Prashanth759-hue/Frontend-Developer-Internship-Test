import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ImageBackground, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { XCircle, RefreshCw, CreditCard, Home, ChevronRight, AlertTriangle } from 'lucide-react-native';
import { Colors } from '../theme/colors';

const FAILURE_REASONS: Record<string, string> = {
  insufficient_funds: 'Insufficient funds in your account.',
  bank_declined: 'Your bank declined this transaction.',
  timeout: 'The payment request timed out.',
  network_error: 'A network error occurred during payment.',
  default: 'The payment could not be processed.',
};

export default function PaymentFailureScreen() {
  const { amount, type, reason } = useLocalSearchParams<{
    amount: string;
    type: string;
    reason?: string;
  }>();
  const displayAmount = parseInt(amount ?? '0', 10);
  const failureMessage = FAILURE_REASONS[reason ?? 'default'] ?? FAILURE_REASONS.default;

  const handleRetry = () => {
    router.replace({
      pathname: '/payment-processing',
      params: { amount: amount ?? '0', type: type ?? 'add_money' },
    });
  };

  const handleChangeMethod = () => {
    router.back();
  };

  return (
    <ImageBackground
      source={require('../assets/images/home-bg.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Failure icon */}
          <View style={styles.iconWrap}>
            <View style={styles.iconCircle}>
              <XCircle size={56} color={Colors.danger} fill={Colors.danger} />
            </View>
            <View style={styles.iconRing} />
          </View>

          <Text style={styles.title}>Payment Failed</Text>
          <Text style={styles.subtitle}>{failureMessage}</Text>

          {/* Amount */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amountValue}>₹{displayAmount.toLocaleString('en-IN')}</Text>
            <Text style={styles.amountNote}>Not charged</Text>
          </View>

          {/* Error Details */}
          <View style={styles.errorCard}>
            <View style={styles.errorHeader}>
              <AlertTriangle size={16} color="#D97706" />
              <Text style={styles.errorTitle}>What went wrong?</Text>
            </View>
            <Text style={styles.errorBody}>
              {failureMessage} No money has been deducted from your account. You can safely retry or choose a different payment method.
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsCard}>
            <Text style={styles.optionsTitle}>What would you like to do?</Text>

            <TouchableOpacity style={styles.optionRow} onPress={handleRetry}>
              <View style={[styles.optionIcon, { backgroundColor: '#FFF0E6' }]}>
                <RefreshCw size={20} color={Colors.primary} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Retry Payment</Text>
                <Text style={styles.optionSub}>Try again with the same method</Text>
              </View>
              <ChevronRight size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.optionRow} onPress={handleChangeMethod}>
              <View style={[styles.optionIcon, { backgroundColor: '#EFF6FF' }]}>
                <CreditCard size={20} color="#3B82F6" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Change Payment Method</Text>
                <Text style={styles.optionSub}>Try UPI, card, or wallet</Text>
              </View>
              <ChevronRight size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Go Home */}
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace('/(main)/home')}
          >
            <Home size={16} color="#666" />
            <Text style={styles.homeBtnText}>Go to Home</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  content: {
    paddingHorizontal: 24, paddingTop: 40, paddingBottom: 48,
    alignItems: 'center', gap: 16,
  },

  iconWrap: { position: 'relative', width: 110, height: 110, justifyContent: 'center', alignItems: 'center' },
  iconCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FECACA',
  },
  iconRing: {
    position: 'absolute', width: 110, height: 110, borderRadius: 55,
    borderWidth: 2, borderColor: '#FECACA', opacity: 0.5,
  },

  title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },

  amountCard: {
    backgroundColor: '#FEF2F2', borderRadius: 24, padding: 24,
    alignItems: 'center', gap: 4, width: '100%',
    borderWidth: 1.5, borderColor: '#FECACA',
  },
  amountLabel: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  amountValue: { fontSize: 40, fontWeight: '800', color: '#EF4444' },
  amountNote: {
    fontSize: 12, color: '#EF4444', fontWeight: '700',
    backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12, marginTop: 4,
  },

  errorCard: {
    backgroundColor: '#FFFBEB', borderRadius: 20, padding: 16, width: '100%',
    borderWidth: 1, borderColor: '#FDE68A', gap: 8,
  },
  errorHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  errorBody: { fontSize: 13, color: '#92400E', lineHeight: 20 },

  optionsCard: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 20, width: '100%',
    borderWidth: 1.5, borderColor: '#FFE8D6', gap: 4,
    shadowColor: '#FF6B00', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  optionsTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  optionIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  optionInfo: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  optionSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },

  homeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 14,
  },
  homeBtnText: { fontSize: 15, color: '#666', fontWeight: '600' },
});
