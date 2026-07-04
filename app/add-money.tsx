import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ImageBackground, TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Wallet, ChevronRight, Shield } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function AddMoneyScreen() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const numericAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
  const isValid = numericAmount >= 10 && numericAmount <= 50000;

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
    setAmount(cleaned);
    if (error) setError('');
  };

  const handleQuickAmount = (val: number) => {
    setAmount(String(val));
    setError('');
  };

  const handleContinue = () => {
    if (numericAmount < 10) {
      setError('Minimum add money amount is ₹10.');
      return;
    }
    if (numericAmount > 50000) {
      setError('Maximum add money amount is ₹50,000.');
      return;
    }
    router.push({
      pathname: '/payment-processing',
      params: { amount: String(numericAmount), type: 'add_money' },
    });
  };

  return (
    <ImageBackground
      source={require('../assets/images/home-bg.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#FF6B00" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Add Money</Text>
            <Text style={styles.headerSub}>Top up your Vahan Pay wallet</Text>
          </View>
          <View style={styles.walletIcon}>
            <Wallet size={20} color={Colors.primary} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>₹0.00</Text>
          </View>

          {/* Amount Entry */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>ENTER AMOUNT</Text>
            <View style={[styles.amountInputRow, error ? styles.amountInputError : null]}>
              <Text style={styles.rupeeSym}>₹</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.textPrimary }]}
                placeholder="0"
                placeholderTextColor="#C4C4C4"
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                maxLength={6}
                autoFocus
              />
            </View>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <Text style={styles.hintText}>Min ₹10 · Max ₹50,000 per transaction</Text>
            )}
          </View>

          {/* Quick Select */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>QUICK SELECT</Text>
            <View style={styles.quickGrid}>
              {QUICK_AMOUNTS.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.quickBtn,
                    numericAmount === val && styles.quickBtnActive,
                  ]}
                  onPress={() => handleQuickAmount(val)}
                >
                  <Text style={[
                    styles.quickBtnText,
                    numericAmount === val && styles.quickBtnTextActive,
                  ]}>
                    ₹{val.toLocaleString('en-IN')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>PAY VIA</Text>
            {['UPI', 'Debit / Credit Card', 'Net Banking'].map((method) => (
              <TouchableOpacity key={method} style={styles.payMethodRow}>
                <Text style={[styles.payMethodText, { color: colors.textPrimary }]}>{method}</Text>
                <ChevronRight size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Security Note */}
          <View style={styles.securityCard}>
            <Shield size={15} color="#16A34A" />
            <Text style={styles.securityText}>
              Payments are 256-bit encrypted. Funds are added instantly to your wallet.
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.continueBtn, !isValid && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!isValid}
          >
            <Text style={styles.continueBtnText}>
              {isValid ? `Continue · ₹${numericAmount.toLocaleString('en-IN')}` : 'Enter Amount to Continue'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF',
    borderWidth: 1, borderColor: '#FFD6B3', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: '#666', marginTop: 2 },
  walletIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF0E6',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#FFD6B3',
  },

  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 14 },

  balanceCard: {
    backgroundColor: '#FF6B00', borderRadius: 24, padding: 20,
    alignItems: 'center', gap: 6,
  },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  balanceValue: { fontSize: 36, fontWeight: '800', color: '#FFF' },

  card: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 18, gap: 14,
    borderWidth: 1.5, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.2 },

  amountInputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.primary, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 4, backgroundColor: '#FFFAF7',
  },
  amountInputError: { borderColor: Colors.danger },
  rupeeSym: { fontSize: 28, fontWeight: '700', color: '#9CA3AF', marginRight: 4 },
  amountInput: { flex: 1, fontSize: 36, fontWeight: '800', paddingVertical: 8 },
  errorText: { fontSize: 13, color: Colors.danger, fontWeight: '500' },
  hintText: { fontSize: 12, color: '#9CA3AF' },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    backgroundColor: '#FAFAFA', borderWidth: 1.5, borderColor: '#FFE8D6',
  },
  quickBtnActive: { backgroundColor: '#FFF0E6', borderColor: Colors.primary },
  quickBtnText: { fontSize: 14, fontWeight: '700', color: '#666' },
  quickBtnTextActive: { color: Colors.primary },

  payMethodRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#FFE8D6',
  },
  payMethodText: { fontSize: 15, fontWeight: '600' },

  securityCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#F0FDF4', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  securityText: { flex: 1, fontSize: 12, color: '#166534', lineHeight: 18 },

  continueBtn: {
    backgroundColor: Colors.primary, borderRadius: 24, paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  continueBtnDisabled: { backgroundColor: '#E5E7EB', shadowOpacity: 0 },
  continueBtnText: { fontSize: 17, fontWeight: '800', color: '#FFF' },
});
