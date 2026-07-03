import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Shield, Zap, Tag, X, CheckCircle, AlertCircle, ChevronDown, ChevronUp, MapPin, Clock } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { Button } from '../../components/common/Button';
import { DraggableSheet } from '../../components/common/DraggableSheet';
import { useBookingStore, PaymentMode } from '../../store/bookingStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Vehicle image shown in the fare summary — must match the service the
// user actually selected, not always the bike image.
const SERVICE_IMAGES: Record<string, ImageSourcePropType> = {
  bike_taxi:      require('../../assets/images/bike-rider.png'),
  scooty:         require('../../assets/images/scooty.png'),
  auto:           require('../../assets/images/auto.png'),
  car:            require('../../assets/images/car.png'),
  car_xl:         require('../../assets/images/car-xl.png'),
  parcel:         require('../../assets/images/parcel.png'),
  courier:        require('../../assets/images/parcel.png'),
  freight:        require('../../assets/images/truck.png'),
  heavy_cargo:    require('../../assets/images/truck.png'),
  packers_movers: require('../../assets/images/truck.png'),
};

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

// Mock map component using grid lines like live-tracking
function MockMap({ pickup, drop }: { pickup: string; drop: string }) {
  const { colors } = useTheme();
  return (
    <View style={mapStyles.mapArea}>
      {/* Grid lines */}
      {[20, 40, 60, 80].map((pct) => (
        <View key={`h${pct}`} style={[mapStyles.gridLine, { top: `${pct}%`, left: 0, right: 0, height: 1 }]} />
      ))}
      {[20, 40, 60, 80].map((pct) => (
        <View key={`v${pct}`} style={[mapStyles.gridLine, { left: `${pct}%`, top: 0, bottom: 0, width: 1 }]} />
      ))}

      {/* Route line */}
      <View style={[mapStyles.routeLine, { left: '30%', top: '25%', height: '50%' }]} />
      <View style={[mapStyles.routeLine, { left: '30%', top: '65%', width: '40%', height: 3 }]} />

      {/* Pickup marker */}
      <View style={[mapStyles.marker, { left: '28%', top: '22%' }]}>
        <View style={mapStyles.markerDotGreen} />
        <Text style={mapStyles.markerLabel}>Pickup</Text>
      </View>

      {/* Drop marker */}
      <View style={[mapStyles.marker, { left: '64%', top: '63%' }]}>
        <View style={mapStyles.markerDotRed} />
        <Text style={[mapStyles.markerLabel, { color: Colors.danger }]}>Drop</Text>
      </View>

      {/* Route badge */}
      <View style={mapStyles.badge}>
        <MapPin size={10} color={Colors.white} />
        <Text style={mapStyles.badgeText}>YOUR ROUTE</Text>
      </View>
    </View>
  );
}

const mapStyles = StyleSheet.create({
  mapArea: {
    flex: 1,
    backgroundColor: '#E8F4F8',
    position: 'relative',
    overflow: 'hidden',
  },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.06)' },
  routeLine: {
    position: 'absolute',
    width: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    opacity: 0.85,
  },
  marker: { position: 'absolute', alignItems: 'center' },
  markerDotGreen: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: Colors.primary,
    borderWidth: 2, borderColor: '#fff',
  },
  markerDotRed: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: Colors.danger,
    borderWidth: 2, borderColor: '#fff',
  },
  markerLabel: {
    fontSize: 9, fontWeight: '700', color: Colors.primary,
    backgroundColor: '#fff', paddingHorizontal: 4, paddingVertical: 1,
    borderRadius: 4, marginTop: 2, overflow: 'hidden',
  },
  badge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});

export default function FareScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const {
    paymentMode, setPaymentMode, pickup, drop,
    estimatedFare, helperCount, serviceType, scheduledSlot, packagingOption,
    appliedCoupon, setAppliedCoupon,
  } = useBookingStore();

  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);
  // Measured content heights — lets the DraggableSheet know exactly how
  // tall the scrollable content + pinned action row are, so dragging up
  // stops right where they end instead of leaving blank space.
  const [showTripDetails, setShowTripDetails] = useState(false);

  const isLogistics = serviceType === 'heavy_cargo' || serviceType === 'packers_movers';
  const isParcelLike = serviceType === 'parcel' || serviceType === 'courier';
  const vehicleImage = SERVICE_IMAGES[serviceType ?? 'bike_taxi'] ?? SERVICE_IMAGES.bike_taxi;

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
      const remainder = estimatedFare - helperFare;
      platformFee = 10;
      tax = 0;
      baseFare = Math.round((remainder - platformFee) * 0.65);
      distanceFare = remainder - platformFee - baseFare;
      subtotal = estimatedFare;
    } else {
      baseFare = Math.round(estimatedFare * 0.55);
      distanceFare = Math.round(estimatedFare * 0.35);
      tax = Math.round(estimatedFare * 0.10);
      platformFee = 10;
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
  const packagingFare = packagingOption?.price ?? 0;
  const total = Math.max(0, subtotal + packagingFare - discount);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponError('Please enter a coupon code.'); return; }
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
    const walletBalance = 0;
    if (paymentMode === 'wallet' && walletBalance < total) {
      Alert.alert(
        'Insufficient Wallet Balance',
        `Your Vahan Pay balance (₹${walletBalance}) is less than the fare (₹${total}). Please add money or choose another payment method.`,
        [
          { text: 'Add Money', onPress: () => router.push('/add-money') },
          { text: 'Change Payment', style: 'cancel' },
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

  const paymentLabel = PAYMENT_OPTIONS.find((p) => p.id === paymentMode)?.label ?? 'Cash';

  return (
    <View style={[styles.root, { backgroundColor: isDark ? colors.background : '#E8F4F8' }]}>
      {/* ── Full-screen map (sheet floats on top, draggable) ── */}
      <View style={styles.mapContainer}>
        <MockMap pickup={pickup?.address ?? ''} drop={drop?.address ?? ''} />

        {/* Back button floating over map */}
        <SafeAreaView style={styles.mapOverlay} edges={['top']}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color="#FF6B00" />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* ── Bottom sheet (drag up for full details, drag down for more map) ── */}
      <DraggableSheet
        backgroundColor="#FFF3E6"
        defaultHeight={0.46}
        expandedHeight={0.70}
        collapsedHeight={0.30}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.bottomSheetContent, { paddingBottom: 4 }]}
        >
          {/* ══ Container 1: Total Fare + Trip Details ══ */}
          <View style={[styles.sheetCard, { borderColor: colors.cardBorder, backgroundColor: '#FFFFFF' }]}>
            <View style={styles.fareBar}>
              <View style={styles.fareBarLeft}>
                <Image
                  source={vehicleImage}
                  style={styles.vehicleThumb}
                />
                <View>
                  <Text style={[styles.fareBarLabel, { color: colors.textSecondary }]}>Total Fare</Text>
                  <Text style={styles.fareBarAmount}>₹{total}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.tripDetailsBtn, { borderColor: colors.cardBorder }]}
                onPress={() => setShowTripDetails(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.tripDetailsBtnText}>Trip Details</Text>
                <ChevronDown size={14} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Searching progress bar */}
            <View style={[styles.progressBar, { backgroundColor: colors.iconBorder }]}>
              <View style={[styles.progressFill, { width: '0%' }]} />
            </View>

            {/* Quick route preview */}
            <View style={styles.miniRouteRow}>
              <MapPin size={12} color={Colors.primary} />
              <Text style={[styles.miniRouteText, { color: colors.textSecondary }]} numberOfLines={1}>
                {pickup?.address ?? 'Pickup'} → {drop?.address ?? 'Drop'}
              </Text>
            </View>
          </View>

          {/* ══ Container 2: Fare Breakdown (dropdown) ══ */}
          <View style={[styles.sheetCard, { borderColor: colors.cardBorder, backgroundColor: '#FFFFFF' }]}>
            <TouchableOpacity
              style={styles.breakdownHeader}
              onPress={() => setShowBreakdown((v) => !v)}
              activeOpacity={0.8}
            >
              <Text style={[styles.cardLabel, { color: colors.placeholder, marginBottom: 0 }]}>🧾 FARE BREAKDOWN</Text>
              {showBreakdown ? (
                <ChevronUp size={16} color="#9CA3AF" />
              ) : (
                <ChevronDown size={16} color="#9CA3AF" />
              )}
            </TouchableOpacity>

            {showBreakdown && (
              <View style={{ marginTop: 10 }}>
                <View style={styles.fareRow}>
                  <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
                    {isLogistics ? 'Vehicle / base fare' : 'Base fare'}
                  </Text>
                  <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{baseFare}</Text>
                </View>
                <View style={[styles.fareDivider, { backgroundColor: colors.cardBorder }]} />
                <View style={styles.fareRow}>
                  <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Distance fare</Text>
                  <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{distanceFare}</Text>
                </View>
                {helperFare > 0 && (
                  <>
                    <View style={[styles.fareDivider, { backgroundColor: colors.cardBorder }]} />
                    <View style={styles.fareRow}>
                      <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Helper cost ({helperCount} × ₹150)</Text>
                      <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{helperFare}</Text>
                    </View>
                  </>
                )}
                {tax > 0 && (
                  <>
                    <View style={[styles.fareDivider, { backgroundColor: colors.cardBorder }]} />
                    <View style={styles.fareRow}>
                      <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Taxes & charges</Text>
                      <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{tax}</Text>
                    </View>
                  </>
                )}
                {platformFee > 0 && (
                  <>
                    <View style={[styles.fareDivider, { backgroundColor: colors.cardBorder }]} />
                    <View style={styles.fareRow}>
                      <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Platform fee</Text>
                      <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{platformFee}</Text>
                    </View>
                  </>
                )}
                {packagingFare > 0 && (
                  <>
                    <View style={[styles.fareDivider, { backgroundColor: colors.cardBorder }]} />
                    <View style={styles.fareRow}>
                      <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>{packagingOption?.label ?? 'Packaging'}</Text>
                      <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{packagingFare}</Text>
                    </View>
                  </>
                )}
                {discount > 0 && (
                  <>
                    <View style={[styles.fareDivider, { backgroundColor: colors.cardBorder }]} />
                    <View style={styles.fareRow}>
                      <Text style={[styles.fareLabel, { color: Colors.success }]}>Coupon ({appliedCoupon?.code})</Text>
                      <Text style={[styles.fareValue, { color: Colors.success }]}>−₹{discount}</Text>
                    </View>
                  </>
                )}
                <View style={[styles.totalRow, { borderTopColor: colors.cardBorder, backgroundColor: colors.iconBg }]}>
                  <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total</Text>
                  <Text style={styles.totalValue}>₹{total}</Text>
                </View>
              </View>
            )}
          </View>

          {/* ══ Container 3: Payment Method (dropdown) ══ */}
          <View style={[styles.sheetCard, { borderColor: colors.cardBorder, backgroundColor: '#FFFFFF', marginBottom: 16 }]}>
            <TouchableOpacity
              style={styles.breakdownHeader}
              onPress={() => setShowPaymentDropdown((v) => !v)}
              activeOpacity={0.8}
            >
              <View style={styles.paymentSummaryLeft}>
                <Image
                  source={PAYMENT_OPTIONS.find((p) => p.id === paymentMode)?.image}
                  style={styles.payChipImage}
                />
                <View>
                  <Text style={[styles.cardLabel, { color: colors.placeholder, marginBottom: 0 }]}>💳 PAYMENT METHOD</Text>
                  <Text style={[styles.paymentSummaryValue, { color: colors.textPrimary }]}>{paymentLabel}</Text>
                </View>
              </View>
              {showPaymentDropdown ? (
                <ChevronUp size={16} color="#9CA3AF" />
              ) : (
                <ChevronDown size={16} color="#9CA3AF" />
              )}
            </TouchableOpacity>

            {showPaymentDropdown && (
              <View style={{ marginTop: 12, gap: 8 }}>
                {PAYMENT_OPTIONS.map((opt) => {
                  const isSelected = paymentMode === opt.id;
                  const isWallet = opt.id === 'wallet';
                  const walletBalance = 0;
                  const insufficientWallet = isWallet && walletBalance < total;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.paymentOptionRow,
                        { marginTop: 0, backgroundColor: colors.inputBackground, borderColor: isSelected ? Colors.primary : colors.cardBorder },
                      ]}
                      onPress={() => setPaymentMode(opt.id)}
                      accessibilityLabel={`Select ${opt.label} payment`}
                      accessibilityState={{ selected: isSelected }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.paymentOptionLeft}>
                        <Image source={opt.image} style={styles.payImage} />
                        <View style={styles.paymentOptionInfo}>
                          <Text style={[styles.paymentLabel, { color: isSelected ? Colors.primary : colors.textPrimary }]}>
                            {opt.label}
                          </Text>
                          <Text style={[styles.paymentDesc, { color: colors.textSecondary }]}>
                            {isWallet ? `Balance: ₹${walletBalance}` : opt.desc}
                          </Text>
                          {insufficientWallet && (
                            <Text style={styles.insufficientText}>
                              Insufficient balance ·{' '}
                              <Text style={{ fontWeight: '700', color: Colors.primary }} onPress={() => router.push('/add-money')}>
                                Add Money
                              </Text>
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={[styles.radioCircle, { borderColor: isSelected ? Colors.primary : colors.border }]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* ══ Container 4: Coupon / Promo (dropdown) ══ */}
          <View style={[styles.sheetCard, { borderColor: colors.cardBorder, backgroundColor: '#FFFFFF', marginBottom: 16 }]}>
            <TouchableOpacity
              style={styles.breakdownHeader}
              onPress={() => setShowCouponDropdown((v) => !v)}
              activeOpacity={0.8}
            >
              <View style={styles.paymentSummaryLeft}>
                <Tag size={18} color={Colors.primary} />
                <View>
                  <Text style={[styles.cardLabel, { color: colors.placeholder, marginBottom: 0 }]}>🏷️ COUPON / PROMO</Text>
                  <Text style={[styles.paymentSummaryValue, { color: appliedCoupon ? Colors.success : colors.textPrimary }]}>
                    {appliedCoupon ? `${appliedCoupon.code} applied` : 'No coupon applied'}
                  </Text>
                </View>
              </View>
              {showCouponDropdown ? (
                <ChevronUp size={16} color="#9CA3AF" />
              ) : (
                <ChevronDown size={16} color="#9CA3AF" />
              )}
            </TouchableOpacity>

            {showCouponDropdown && (
              <View style={{ marginTop: 12 }}>
                {appliedCoupon ? (
                  <View style={[styles.appliedCouponRow, { backgroundColor: colors.surfaceElevated, borderColor: '#BBF7D0', marginTop: 0 }]}>
                    <CheckCircle size={18} color="#16A34A" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.appliedCouponCode}>{appliedCoupon.code}</Text>
                      <Text style={styles.appliedCouponLabel}>{appliedCoupon.label}</Text>
                    </View>
                    <TouchableOpacity onPress={handleRemoveCoupon} style={styles.removeCouponBtn} accessibilityLabel="Remove coupon">
                      <X size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={[styles.couponInputRow, couponError ? styles.couponInputRowError : null, { borderColor: colors.cardBorder, marginTop: 0 }]}>
                      <Tag size={16} color={Colors.primary} style={{ marginLeft: 4 }} />
                      <TextInput
                        style={[styles.couponInput, { color: colors.textPrimary }]}
                        placeholder="Enter coupon code"
                        placeholderTextColor="#AAAAAA"
                        value={couponInput}
                        onChangeText={(text) => {
                          const clean = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
                          setCouponInput(clean);
                          if (clean.length > 0 && !/^[A-Z0-9]+$/.test(clean)) {
                            setCouponError('Coupon code can only contain letters and numbers.');
                          } else {
                            setCouponError('');
                          }
                        }}
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
                          <Text style={[styles.applyBtnText, { color: colors.surface }]}>{t('applyCode')}</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                    {couponError ? (
                      <View style={styles.couponErrorRow}>
                        <AlertCircle size={13} color="#EF4444" />
                        <Text style={styles.couponErrorText}>{couponError}</Text>
                      </View>
                    ) : null}
                    <Text style={[styles.couponHint, { color: colors.placeholder }]}>Try: SAVE50 · VAHAN10 · FIRST100</Text>
                    <TouchableOpacity style={[styles.viewCouponsBtn, { backgroundColor: colors.iconBg, borderColor: colors.iconBorder }]} onPress={() => router.push('/coupon-list')}>
                      <Tag size={13} color={Colors.primary} />
                      <Text style={styles.viewCouponsBtnText}>View All Available Coupons</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Confirm / Cancel actions */}
        <View style={[styles.actionRow, { paddingHorizontal: 16, backgroundColor: '#FFFFFF' }]}>
          <Button
            label="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={styles.cancelBtn}
            accessibilityLabel="Cancel ride"
          />
          <Button
            label={`Confirm · ₹${total}`}
            onPress={handleConfirm}
            loading={loading}
            style={styles.confirmBtn}
            accessibilityLabel={`Confirm booking for ₹${total}`}
          />
        </View>
      </DraggableSheet>

      {/* ── Trip Details Modal (slide up) ── */}
      <Modal visible={showTripDetails} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismiss} onPress={() => setShowTripDetails(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Trip Details</Text>
              <TouchableOpacity
                onPress={() => setShowTripDetails(false)}
                style={[styles.modalClose, { backgroundColor: colors.inputBackground, borderColor: colors.cardBorder }]}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 32 }}>
              {/* Route */}
              <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}>
                <Text style={[styles.cardLabel, { color: colors.placeholder }]}>📍 LOCATION DETAILS</Text>
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
                  <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={2}>{pickup?.address ?? '—'}</Text>
                </View>
                <View style={[styles.routeLine, { backgroundColor: colors.cardBorder }]} />
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
                  <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={2}>{drop?.address ?? '—'}</Text>
                </View>
              </View>

              {/* Pickup time */}
              {scheduledSlot && (
                <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}>
                  <Text style={[styles.cardLabel, { color: colors.placeholder }]}>🕐 PICKUP TIME</Text>
                  <View style={styles.pickupTimeRow}>
                    <Clock size={16} color={Colors.primary} />
                    <View>
                      <Text style={[styles.pickupTimeLabel, { color: colors.textPrimary }]}>{scheduledSlot.label}</Text>
                      {scheduledSlot.desc && (
                        <Text style={[styles.pickupTimeDesc, { color: colors.textSecondary }]}>{scheduledSlot.desc}</Text>
                      )}
                      {packagingOption && packagingOption.price > 0 && (
                        <Text style={[styles.pickupTimeDesc, { color: colors.textSecondary }]}>
                          {packagingOption.label} · +₹{packagingOption.price}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* Fare Breakdown */}
              <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}>
                <TouchableOpacity
                  style={styles.breakdownHeader}
                  onPress={() => setShowBreakdown((v) => !v)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.cardLabel, { color: colors.placeholder }]}>🧾 FARE BREAKDOWN</Text>
                  {showBreakdown ? (
                    <ChevronUp size={16} color="#9CA3AF" />
                  ) : (
                    <ChevronDown size={16} color="#9CA3AF" />
                  )}
                </TouchableOpacity>

                {showBreakdown && (
                  <>
                    <View style={styles.fareRow}>
                      <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
                        {isLogistics ? 'Vehicle / base fare' : 'Base fare'}
                      </Text>
                      <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{baseFare}</Text>
                    </View>
                    <View style={[styles.fareDivider, { backgroundColor: colors.cardBorder }]} />
                    <View style={styles.fareRow}>
                      <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Distance fare</Text>
                      <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{distanceFare}</Text>
                    </View>
                    {helperFare > 0 && (
                      <>
                        <View style={[styles.fareDivider, { backgroundColor: colors.cardBorder }]} />
                        <View style={styles.fareRow}>
                          <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Helper cost ({helperCount} × ₹150)</Text>
                          <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{helperFare}</Text>
                        </View>
                      </>
                    )}
                    {tax > 0 && (
                      <>
                        <View style={[styles.fareDivider, { backgroundColor: colors.cardBorder }]} />
                        <View style={styles.fareRow}>
                          <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Taxes & charges</Text>
                          <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{tax}</Text>
                        </View>
                      </>
                    )}
                    {platformFee > 0 && (
                      <>
                        <View style={[styles.fareDivider, { backgroundColor: colors.cardBorder }]} />
                        <View style={styles.fareRow}>
                          <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Platform fee</Text>
                          <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{platformFee}</Text>
                        </View>
                      </>
                    )}
                    {packagingFare > 0 && (
                      <>
                        <View style={[styles.fareDivider, { backgroundColor: colors.cardBorder }]} />
                        <View style={styles.fareRow}>
                          <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>{packagingOption?.label ?? 'Packaging'}</Text>
                          <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{packagingFare}</Text>
                        </View>
                      </>
                    )}
                    {discount > 0 && (
                      <>
                        <View style={[styles.fareDivider, { backgroundColor: colors.cardBorder }]} />
                        <View style={styles.fareRow}>
                          <Text style={[styles.fareLabel, { color: Colors.success }]}>Coupon ({appliedCoupon?.code})</Text>
                          <Text style={[styles.fareValue, { color: Colors.success }]}>−₹{discount}</Text>
                        </View>
                      </>
                    )}
                    <View style={[styles.totalRow, { borderTopColor: colors.cardBorder, backgroundColor: colors.iconBg }]}>
                      <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total</Text>
                      <Text style={styles.totalValue}>₹{total}</Text>
                    </View>
                  </>
                )}
              </View>

              {/* Coupon */}
              <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}>
                <Text style={[styles.cardLabel, { color: colors.placeholder }]}>🏷️ COUPON / PROMO</Text>
                {appliedCoupon ? (
                  <View style={[styles.appliedCouponRow, { backgroundColor: colors.surfaceElevated, borderColor: '#BBF7D0' }]}>
                    <CheckCircle size={18} color="#16A34A" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.appliedCouponCode}>{appliedCoupon.code}</Text>
                      <Text style={styles.appliedCouponLabel}>{appliedCoupon.label}</Text>
                    </View>
                    <TouchableOpacity onPress={handleRemoveCoupon} style={styles.removeCouponBtn} accessibilityLabel="Remove coupon">
                      <X size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={[styles.couponInputRow, couponError ? styles.couponInputRowError : null, { borderColor: colors.cardBorder }]}>
                      <Tag size={16} color={Colors.primary} style={{ marginLeft: 4 }} />
                      <TextInput
                        style={[styles.couponInput, { color: colors.textPrimary }]}
                        placeholder="Enter coupon code"
                        placeholderTextColor="#AAAAAA"
                        value={couponInput}
                        onChangeText={(text) => {
                          const clean = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
                          setCouponInput(clean);
                          if (clean.length > 0 && !/^[A-Z0-9]+$/.test(clean)) {
                            setCouponError('Coupon code can only contain letters and numbers.');
                          } else {
                            setCouponError('');
                          }
                        }}
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
                          <Text style={[styles.applyBtnText, { color: colors.surface }]}>{t('applyCode')}</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                    {couponError ? (
                      <View style={styles.couponErrorRow}>
                        <AlertCircle size={13} color="#EF4444" />
                        <Text style={styles.couponErrorText}>{couponError}</Text>
                      </View>
                    ) : null}
                    <Text style={[styles.couponHint, { color: colors.placeholder }]}>Try: SAVE50 · VAHAN10 · FIRST100</Text>
                    <TouchableOpacity style={[styles.viewCouponsBtn, { backgroundColor: colors.iconBg, borderColor: colors.iconBorder }]} onPress={() => router.push('/coupon-list')}>
                      <Tag size={13} color={Colors.primary} />
                      <Text style={styles.viewCouponsBtnText}>View All Available Coupons</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Payment Method */}
              <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}>
                <Text style={[styles.cardLabel, { color: colors.placeholder }]}>💳 PAYMENT METHOD</Text>
                {PAYMENT_OPTIONS.map((opt) => {
                  const isSelected = paymentMode === opt.id;
                  const isWallet = opt.id === 'wallet';
                  const walletBalance = 0;
                  const insufficientWallet = isWallet && walletBalance < total;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.paymentOptionRow,
                        isSelected && styles.paymentOptionRowActive,
                        { backgroundColor: colors.inputBackground, borderColor: isSelected ? Colors.primary : colors.cardBorder },
                      ]}
                      onPress={() => setPaymentMode(opt.id)}
                      accessibilityLabel={`Select ${opt.label} payment`}
                      accessibilityState={{ selected: isSelected }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.paymentOptionLeft}>
                        <Image source={opt.image} style={styles.payImage} />
                        <View style={styles.paymentOptionInfo}>
                          <Text style={[styles.paymentLabel, isSelected && styles.paymentLabelActive, { color: isSelected ? Colors.primary : colors.textPrimary }]}>
                            {opt.label}
                          </Text>
                          <Text style={[styles.paymentDesc, { color: colors.textSecondary }]}>
                            {isWallet ? `Balance: ₹${walletBalance}` : opt.desc}
                          </Text>
                          {insufficientWallet && (
                            <Text style={styles.insufficientText}>
                              Insufficient balance ·{' '}
                              <Text style={{ fontWeight: '700', color: Colors.primary }} onPress={() => router.push('/add-money')}>
                                Add Money
                              </Text>
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleActive, { borderColor: isSelected ? Colors.primary : colors.border }]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Safety banner */}
              <View style={[styles.safetyBanner, { backgroundColor: colors.iconBg, borderColor: colors.iconBorder }]}>
                <Shield size={16} color={Colors.primary} />
                <Text style={styles.safetyText}>{safetyLabel}</Text>
              </View>
            </ScrollView>

            {/* Confirm / Cancel actions, pinned at bottom of modal */}
            <View style={[styles.modalActionRow, { borderTopColor: colors.cardBorder, backgroundColor: colors.surface }]}>
              <Button
                label="Cancel"
                onPress={() => setShowTripDetails(false)}
                variant="outline"
                style={styles.cancelBtn}
                accessibilityLabel="Cancel ride"
              />
              <Button
                label={`Confirm · ₹${total}`}
                onPress={handleConfirm}
                loading={loading}
                style={styles.confirmBtn}
                accessibilityLabel={`Confirm booking for ₹${total}`}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  root: { flex: 1 },

  // Map
  mapContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  mapOverlay: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 8 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#FFD6B3',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },

  // Bottom sheet content padding (position/height/shadow handled by DraggableSheet)
  bottomSheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // Sheet container cards (Total Fare / Fare Breakdown / Payment Method)
  sheetCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  miniRouteRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4,
  },
  miniRouteText: { fontSize: 11, fontWeight: '500', flex: 1 },
  paymentSummaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  paymentSummaryValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },

  // Pinned action row (Confirm / Cancel) — white container over the orange body
  actionRow: {
    flexDirection: 'row', gap: 10, paddingTop: 14, paddingBottom: 16,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderTopWidth: 1, borderTopColor: '#F0E4D8',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 }, elevation: 8,
  },
  modalActionRow: {
    flexDirection: 'row', gap: 10,
    paddingTop: 14, paddingBottom: 18,
    marginHorizontal: -20, paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  cancelBtn: { flex: 1 },

  // Fare bar
  fareBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  fareBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vehicleThumb: { width: 48, height: 48, resizeMode: 'contain' },
  fareBarLabel: { fontSize: 11, fontWeight: '500' },
  fareBarAmount: { fontSize: 22, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  tripDetailsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
  },
  tripDetailsBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  // Progress bar
  progressBar: { height: 4, borderRadius: 2, marginBottom: 10 },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: Colors.primary },

  // Payment quick chips (legacy, kept for potential reuse)
  paymentRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  payChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5,
  },
  payChipActive: { backgroundColor: Colors.primaryLight },
  payChipImage: { width: 20, height: 20, resizeMode: 'contain' },
  payChipLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  payChipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  confirmBtn: { flex: 1.4 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalDismiss: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 20, paddingBottom: 0,
    maxHeight: SCREEN_HEIGHT * 0.88,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalClose: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },

  // Cards
  card: {
    borderRadius: 20, padding: 16,
    borderWidth: 1,
    shadowColor: '#FF6B00', shadowOpacity: 0.05, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6 },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  routeLine: { height: 1, marginLeft: 20, marginVertical: 2 },
  routeText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },

  // Pickup time
  pickupTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pickupTimeLabel: { fontSize: 15, fontWeight: '700' },
  pickupTimeDesc: { fontSize: 12, marginTop: 2 },

  // Fare breakdown
  breakdownHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
  },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  fareDivider: { height: 1 },
  fareLabel: { fontSize: 14 },
  fareValue: { fontSize: 14, fontWeight: '600' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 14, marginTop: 4,
    borderTopWidth: 2,
    marginHorizontal: -16, paddingHorizontal: 16, paddingBottom: 14,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: -16,
  },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 24, fontWeight: '800', color: Colors.primary },

  // Coupon
  couponInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 6, marginTop: 10,
  },
  couponInputRowError: { borderColor: '#EF4444' },
  couponInput: { flex: 1, fontSize: 15, fontWeight: '600', paddingVertical: 8 },
  applyBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  applyBtnDisabled: { backgroundColor: '#E5E7EB' },
  applyBtnText: { fontSize: 13, fontWeight: '800' },
  couponErrorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  couponErrorText: { fontSize: 12, color: Colors.danger, fontWeight: '500', flex: 1 },
  couponHint: { fontSize: 11, marginTop: 8, fontWeight: '500' },
  viewCouponsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, marginTop: 8, justifyContent: 'center',
  },
  viewCouponsBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  appliedCouponRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, padding: 12, borderWidth: 1, marginTop: 10,
  },
  appliedCouponCode: { fontSize: 14, fontWeight: '800', color: Colors.success },
  appliedCouponLabel: { fontSize: 12, color: '#166534', marginTop: 1 },
  removeCouponBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#FECACA',
  },

  // Payment
  paymentOptionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 16, padding: 14, gap: 12,
    borderWidth: 1.5, marginTop: 8,
  },
  paymentOptionRowActive: {},
  paymentOptionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  paymentOptionInfo: { flex: 1 },
  insufficientText: { fontSize: 11, color: Colors.danger, marginTop: 2 },
  radioCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  radioCircleActive: {},
  radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: Colors.primary },
  payImage: { width: 36, height: 36, resizeMode: 'contain' },
  paymentLabel: { fontSize: 14, fontWeight: '700' },
  paymentLabelActive: {},
  paymentDesc: { fontSize: 11, fontWeight: '500', marginTop: 2 },

  // Safety
  safetyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 16, padding: 14, borderWidth: 1,
  },
  safetyText: { flex: 1, fontSize: 13, lineHeight: 18, color: '#F59E0B', fontWeight: '500' },
});