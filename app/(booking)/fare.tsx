import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  ImageSourcePropType,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Shield, Zap, Tag, X, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/common/Button';
import { useBookingStore, PaymentMode } from '../../store/bookingStore';

const PAYMENT_OPTIONS: { id: PaymentMode; label: string; image: ImageSourcePropType; desc: string }[] = [
  { id: 'cash',   label: 'Cash',   image: require('../../assets/images/icon-cash.png'),   desc: 'Pay on arrival' },
  { id: 'upi',    label: 'UPI',    image: require('../../assets/images/icon-upi.png'),     desc: 'Instant transfer' },
  { id: 'wallet', label: 'Wallet', image: require('../../assets/images/icon-wallet.png'),  desc: 'Vahan Pay balance' },
];

const VALID_COUPONS: Record<string, { discount: number; label: string }> = {
  'SAVE50':   { discount: 50,  label: '₹50 off on your ride' },
  'VAHAN10':  { discount: 10,  label: '₹10 off platform fee' },
  'FIRST100': { discount: 100, label: '₹100 off your first booking' },
};

export default function FareScreen() {
  const { colors } = useTheme();
  const { paymentMode, setPaymentMode, pickup, drop, estimatedFare, helperCount, serviceType, scheduledSlot } = useBookingStore();
  const [loading, setLoading] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(true);

  const isLogistics = serviceType === 'heavy_cargo' || serviceType === 'packers_movers';
  const isParcelLike = serviceType === 'parcel' || serviceType === 'courier';

  // Fare computation
  let baseFare = 0;
  let distanceFare = 0;
  let helperFare = 0;
  let tax = 0;
  let platformFee = 10;
  let subtotal = 0;

  if (estimatedFare > 0) {
    if (helperCount > 0) {
      helperFare = helperCount * 150;
      baseFare = Math.round((estimatedFare - helperFare) * 0.65);
      distanceFare = estimatedFare - helperFare - baseFare;
      platformFee = 0;
      tax = 0;
      subtotal = estimatedFare;
    } else {
      baseFare = Math.round(estimatedFare * 0.55);
      distanceFare = Math.round(estimatedFare * 0.35);
      tax = Math.round(estimatedFare * 0.10);
      platformFee = isLogistics ? 0 : 10;
      subtotal = baseFare + distanceFare + tax + platformFee;
    }
  } else {
    baseFare = 40;
    distanceFare = 20;
    tax = 7;
    platformFee = 10;
    subtotal = baseFare + distanceFare + tax + platformFee;
  }

  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    setCouponLoading(true);
    setCouponError('');
    setTimeout(() => {
      setCouponLoading(false);
      const found = VALID_COUPONS[code];
      if (found) {
        setAppliedCoupon({ code, ...found });
        setCouponInput('');
        setCouponError('');
      } else {
        setCouponError(`"${code}" is not a valid coupon. Please check and try again.`);
      }
    }, 800);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleConfirm = () => {
    // UX-PAY-010: Check wallet balance before proceeding
    const walletBalance = 0; // mock balance
    if (paymentMode === 'wallet' && walletBalance < total) {
      Alert.alert(
        'Insufficient Wallet Balance',
        `Your Vahan Pay balance (₹${walletBalance}) is less than the fare (₹${total}). Please add money or choose another payment method.`,
        [
          {
            text: 'Add Money',
            onPress: () => router.push('/add-money'),
          },
          {
            text: 'Change Payment',
            style: 'cancel',
          },
        ],
      );
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/(booking)/searching');
    }, 1000);
  };

  const safetyLabel = isLogistics
    ? 'Your shipment is covered under Vahan360 goods safety policy'
    : isParcelLike
    ? 'Your parcel is covered under Vahan360 delivery policy'
    : 'Your ride is covered under Vahan360 passenger safety policy';

  return (
    <ImageBackground
      source={require('../../assets/images/home-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {/* ── Hero Header ── */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Fare & Payment</Text>
              <Text style={styles.heroSubtitle}>Review your fare before confirming</Text>
            </View>
          </View>

          {/* Fare highlight */}
          <View style={styles.fareSummaryCard}>
            <View style={styles.fareSummaryLeft}>
              <Text style={styles.fareSummaryLabel}>Total Fare</Text>
              <Text style={styles.fareSummaryAmount}>₹{total}</Text>
              {discount > 0 && (
                <Text style={styles.discountBadgeText}>Saved ₹{discount}</Text>
              )}
            </View>
            <View style={styles.fareSummaryRight}>
              <View style={styles.etaBadge}>
                <Zap size={12} color="#FF6B00" />
                <Text style={styles.etaBadgeText}>Save ₹10 with UPI</Text>
              </View>
              <Text style={styles.fareSummaryRoute} numberOfLines={1}>
                {pickup?.address ?? '—'} → {drop?.address ?? '—'}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ── Pickup Time ── */}
          {scheduledSlot && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🕐 PICKUP TIME</Text>
              <Text style={[styles.fareLabel, { color: colors.textPrimary, fontWeight: '700' }]}>
                {scheduledSlot.label}
              </Text>
              {scheduledSlot.desc && (
                <Text style={[styles.fareLabel, { color: colors.textSecondary, marginTop: 2 }]}>
                  {scheduledSlot.desc}
                </Text>
              )}
            </View>
          )}

          {/* ── Fare Breakdown ── */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.breakdownHeader}
              onPress={() => setShowBreakdown((v) => !v)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardLabel}>🧾 FARE BREAKDOWN</Text>
              {showBreakdown ? (
                <ChevronUp size={16} color="#9CA3AF" />
              ) : (
                <ChevronDown size={16} color="#9CA3AF" />
              )}
            </TouchableOpacity>

            {showBreakdown && (
              <>
                {/* Base fare */}
                <View style={styles.fareRow}>
                  <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
                    {isLogistics ? 'Vehicle / base fare' : 'Base fare'}
                  </Text>
                  <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{baseFare}</Text>
                </View>

                {/* Distance fare */}
                <View style={styles.fareDivider} />
                <View style={styles.fareRow}>
                  <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Distance fare</Text>
                  <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{distanceFare}</Text>
                </View>

                {/* Helper */}
                {helperFare > 0 && (
                  <>
                    <View style={styles.fareDivider} />
                    <View style={styles.fareRow}>
                      <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
                        Helper cost ({helperCount} × ₹150)
                      </Text>
                      <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{helperFare}</Text>
                    </View>
                  </>
                )}

                {/* Tax */}
                {tax > 0 && (
                  <>
                    <View style={styles.fareDivider} />
                    <View style={styles.fareRow}>
                      <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Taxes & charges</Text>
                      <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{tax}</Text>
                    </View>
                  </>
                )}

                {/* Platform fee */}
                {platformFee > 0 && (
                  <>
                    <View style={styles.fareDivider} />
                    <View style={styles.fareRow}>
                      <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Platform fee</Text>
                      <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{platformFee}</Text>
                    </View>
                  </>
                )}

                {/* Coupon discount */}
                {discount > 0 && (
                  <>
                    <View style={styles.fareDivider} />
                    <View style={styles.fareRow}>
                      <Text style={[styles.fareLabel, { color: '#16A34A' }]}>
                        Coupon ({appliedCoupon?.code})
                      </Text>
                      <Text style={[styles.fareValue, { color: '#16A34A' }]}>−₹{discount}</Text>
                    </View>
                  </>
                )}

                {/* Total */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₹{total}</Text>
                </View>
              </>
            )}
          </View>

          {/* ── Coupon ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🏷️ COUPON / PROMO</Text>

            {appliedCoupon ? (
              /* Applied state */
              <View style={styles.appliedCouponRow}>
                <CheckCircle size={18} color="#16A34A" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.appliedCouponCode}>{appliedCoupon.code}</Text>
                  <Text style={styles.appliedCouponLabel}>{appliedCoupon.label}</Text>
                </View>
                <TouchableOpacity
                  onPress={handleRemoveCoupon}
                  style={styles.removeCouponBtn}
                  accessibilityLabel="Remove coupon"
                >
                  <X size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              /* Input state */
              <>
                <View style={[styles.couponInputRow, couponError ? styles.couponInputRowError : null]}>
                  <Tag size={16} color={Colors.primary} style={{ marginLeft: 4 }} />
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Enter coupon code"
                    placeholderTextColor="#AAAAAA"
                    value={couponInput}
                    onChangeText={(t) => { setCouponInput(t.toUpperCase()); setCouponError(''); }}
                    autoCapitalize="characters"
                    returnKeyType="done"
                    onSubmitEditing={handleApplyCoupon}
                  />
                  {couponInput.length > 0 && (
                    <TouchableOpacity onPress={() => { setCouponInput(''); setCouponError(''); }}>
                      <X size={14} color="#AAAAAA" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.applyBtn, !couponInput.trim() && styles.applyBtnDisabled]}
                    onPress={handleApplyCoupon}
                    disabled={!couponInput.trim() || couponLoading}
                  >
                    {couponLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.applyBtnText}>Apply</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {couponError ? (
                  <View style={styles.couponErrorRow}>
                    <AlertCircle size={13} color="#EF4444" />
                    <Text style={styles.couponErrorText}>{couponError}</Text>
                  </View>
                ) : null}

                <Text style={styles.couponHint}>Try: SAVE50 · VAHAN10 · FIRST100</Text>
                <TouchableOpacity
                  style={styles.viewCouponsBtn}
                  onPress={() => router.push('/coupon-list')}
                >
                  <Tag size={13} color={Colors.primary} />
                  <Text style={styles.viewCouponsBtnText}>View All Available Coupons</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* ── Payment Method ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>💳 PAYMENT METHOD</Text>

            {PAYMENT_OPTIONS.map((opt) => {
              const isSelected = paymentMode === opt.id;
              const isWallet = opt.id === 'wallet';
              const walletBalance = 0; // mock balance
              const insufficientWallet = isWallet && walletBalance < total;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.paymentOptionRow, isSelected && styles.paymentOptionRowActive]}
                  onPress={() => setPaymentMode(opt.id)}
                  accessibilityLabel={`Select ${opt.label} payment`}
                  accessibilityState={{ selected: isSelected }}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentOptionLeft}>
                    <Image source={opt.image} style={styles.payImage} />
                    <View style={styles.paymentOptionInfo}>
                      <Text style={[styles.paymentLabel, isSelected && styles.paymentLabelActive]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.paymentDesc, { color: colors.textSecondary }]}>
                        {isWallet ? `Balance: ₹${walletBalance}` : opt.desc}
                      </Text>
                      {insufficientWallet && (
                        <Text style={styles.insufficientText}>
                          Insufficient balance · <Text style={{ fontWeight: '700', color: Colors.primary }} onPress={() => router.push('/add-money')}>Add Money</Text>
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Safety banner */}
          <View style={styles.safetyBanner}>
            <Shield size={16} color={Colors.primary} />
            <Text style={styles.safetyText}>{safetyLabel}</Text>
          </View>

          <Button
            label={`Confirm Booking · ₹${total}`}
            onPress={handleConfirm}
            loading={loading}
            style={styles.confirmBtn}
            accessibilityLabel={`Confirm booking for ₹${total}`}
          />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  heroHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#FFD6B3',
    justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: '#666', fontWeight: '500', marginTop: 2 },
  fareSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD6B3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  fareSummaryLeft: { gap: 2 },
  fareSummaryLabel: { fontSize: 11, color: '#666', fontWeight: '600' },
  fareSummaryAmount: { fontSize: 28, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  discountBadgeText: { fontSize: 11, color: '#16A34A', fontWeight: '700', marginTop: 2 },
  fareSummaryRight: { flex: 1, alignItems: 'flex-end', gap: 6 },
  etaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: '#FFD6B3',
  },
  etaBadgeText: { fontSize: 11, fontWeight: '700', color: '#FF6B00' },
  fareSummaryRoute: { fontSize: 11, color: '#666', fontWeight: '500', maxWidth: 140, textAlign: 'right' },
  content: { paddingHorizontal: 16, paddingBottom: 48, gap: 14 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  breakdownHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.2 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  fareDivider: { height: 1, backgroundColor: '#FFE8D6' },
  fareLabel: { fontSize: 14 },
  fareValue: { fontSize: 14, fontWeight: '600' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 14, marginTop: 4,
    borderTopWidth: 2, borderTopColor: '#FFE8D6',
    backgroundColor: '#FFF0E6',
    marginHorizontal: -18, paddingHorizontal: 18, paddingBottom: 14,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: -18,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  totalValue: { fontSize: 24, fontWeight: '800', color: Colors.primary },

  // Coupon
  couponInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#FFE8D6', borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 6, marginTop: 10,
  },
  couponInputRowError: { borderColor: '#EF4444' },
  couponInput: { flex: 1, fontSize: 15, fontWeight: '600', paddingVertical: 8, color: '#1A1A1A' },
  applyBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  applyBtnDisabled: { backgroundColor: '#FFD6B3' },
  applyBtnText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  couponErrorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  couponErrorText: { fontSize: 12, color: '#EF4444', fontWeight: '500', flex: 1 },
  couponHint: { fontSize: 11, color: '#9CA3AF', marginTop: 8, fontWeight: '500' },
  viewCouponsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF0E6', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#FFD6B3', marginTop: 8,
    justifyContent: 'center',
  },
  viewCouponsBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  appliedCouponRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F0FDF4', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: '#BBF7D0', marginTop: 10,
  },
  appliedCouponCode: { fontSize: 14, fontWeight: '800', color: '#16A34A' },
  appliedCouponLabel: { fontSize: 12, color: '#166534', marginTop: 1 },
  removeCouponBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#FECACA',
  },

  paymentOptions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  paymentOptionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 18, padding: 14, gap: 12,
    backgroundColor: '#FAFAFA', borderWidth: 1.5, borderColor: '#FFE8D6',
    marginTop: 8,
  },
  paymentOptionRowActive: { backgroundColor: '#FFF7F2', borderColor: Colors.primary },
  paymentOptionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  paymentOptionInfo: { flex: 1 },
  insufficientText: { fontSize: 11, color: Colors.danger, marginTop: 2 },
  radioCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#D1D5DB',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  radioCircleActive: { borderColor: Colors.primary },
  radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: Colors.primary },
  paymentOption: {
    flex: 1, borderRadius: 20, padding: 14, alignItems: 'center',
    gap: 6, minHeight: 110, justifyContent: 'center',
    backgroundColor: '#FAFAFA', borderWidth: 1.5, borderColor: '#FFE8D6',
    position: 'relative',
  },
  paymentOptionActive: { backgroundColor: '#FFF7F2', borderColor: Colors.primary, borderWidth: 2 },
  payImage: { width: 40, height: 40, resizeMode: 'contain' },
  paymentLabel: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  paymentLabelActive: { color: Colors.primary },
  paymentDesc: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  selectedDot: {
    position: 'absolute', top: 10, right: 10,
    width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary,
  },
  safetyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF0E6', borderRadius: 20, padding: 14,
    borderWidth: 1, borderColor: '#FFD6B3',
  },
  safetyText: { flex: 1, fontSize: 13, lineHeight: 18, color: '#7C4A00', fontWeight: '500' },
  confirmBtn: { width: '100%' },
});
