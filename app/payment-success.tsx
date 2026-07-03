import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ImageBackground, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, Wallet, Download, Home, ArrowRight } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import HOME_BG from '../assets/bg/homeBg';

function generateTxnId() {
  return 'TXN' + Date.now().toString().slice(-10).toUpperCase();
}

const TXN_ID = generateTxnId();

export default function PaymentSuccessScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const { amount, type } = useLocalSearchParams<{ amount: string; type: string }>();
  const displayAmount = parseInt(amount ?? '0', 10);
  const isAddMoney = type === 'add_money';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <ImageBackground
      source={HOME_BG}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Success icon */}
          <View style={styles.iconWrap}>
            <View style={styles.iconCircle}>
              <CheckCircle size={56} color="#22C55E" fill="#22C55E" />
            </View>
            <View style={styles.iconRing} />
          </View>

          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.subtitle}>
            {isAddMoney ? 'Money added to your Vahan Pay wallet' : 'Your booking payment is confirmed'}
          </Text>

          {/* Amount */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Amount Paid</Text>
            <Text style={styles.amountValue}>₹{displayAmount.toLocaleString('en-IN')}</Text>
          </View>

          {/* Details */}
          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Transaction Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Transaction ID</Text>
              <Text style={styles.detailValue}>{TXN_ID}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Payment Method</Text>
              <View style={styles.methodBadge}>
                <Wallet size={13} color={Colors.primary} />
                <Text style={styles.methodBadgeText}>
                  {isAddMoney ? 'UPI / Card' : 'Vahan Pay'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Date & Time</Text>
              <Text style={styles.detailValue}>{dateStr}, {timeStr}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Status</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Completed</Text>
              </View>
            </View>

            {isAddMoney && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>New Balance</Text>
                  <Text style={[styles.detailValue, { color: Colors.success, fontWeight: '800' }]}>
                    ₹{displayAmount.toLocaleString('en-IN')}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Actions */}
          <TouchableOpacity style={styles.downloadBtn}>
            <Download size={18} color={Colors.primary} />
            <Text style={styles.downloadBtnText}>Download Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace('/(main)/home')}
          >
            <Home size={18} color="#FFF" />
            <Text style={styles.primaryBtnText}>Go to Home</Text>
            <ArrowRight size={18} color="#FFF" />
          </TouchableOpacity>

          {isAddMoney && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.replace('/(main)/wallet')}
            >
              <Text style={styles.secondaryBtnText}>View Wallet</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  content: {
    paddingHorizontal: 24, paddingTop: 40, paddingBottom: 48,
    alignItems: 'center', gap: 16,
  },

  iconWrap: { position: 'relative', width: 110, height: 110, justifyContent: 'center', alignItems: 'center' },
  iconCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: colors.surfaceElevated, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#BBF7D0',
  },
  iconRing: {
    position: 'absolute', width: 110, height: 110, borderRadius: 55,
    borderWidth: 2, borderColor: '#BBF7D0', opacity: 0.5,
  },

  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  amountCard: {
    backgroundColor: '#16A34A', borderRadius: 24, padding: 24,
    alignItems: 'center', gap: 6, width: '100%',
  },
  amountLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  amountValue: { fontSize: 44, fontWeight: '800', color: colors.surface },

  detailCard: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 20,
    borderWidth: 1.5, borderColor: colors.border, width: '100%',
    gap: 12,
    shadowColor: colors.textPrimary, shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  detailCardTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailKey: { fontSize: 13, color: colors.placeholder, fontWeight: '500' },
  detailValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.divider },

  methodBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.iconBg, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1, borderColor: colors.iconBorder,
  },
  methodBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.surfaceElevated, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22C55E' },
  statusText: { fontSize: 12, fontWeight: '700', color: Colors.success },

  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    width: '100%', borderRadius: 20, paddingVertical: 14,
    borderWidth: 1.5, borderColor: Colors.primary, justifyContent: 'center',
    backgroundColor: colors.iconBg,
  },
  downloadBtnText: { fontSize: 15, fontWeight: '700', color: Colors.primary },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center',
    backgroundColor: Colors.primary, borderRadius: 24, paddingVertical: 18,
    width: '100%',
    shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: colors.surface },

  secondaryBtn: {
    width: '100%', alignItems: 'center', paddingVertical: 14,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
})
;
