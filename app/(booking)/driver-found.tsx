import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Alert, ScrollView, Modal, Dimensions, Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, MapPin, Shield, Star, CheckCircle, Navigation } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { useBookingStore } from '../../store/bookingStore';
import { useComingSoon } from '../../components/common/ComingSoonModal';
import { Button } from '../../components/common/Button';
import { DraggableSheet } from '../../components/common/DraggableSheet';
import { MOCK_DRIVERS } from '../../constants/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function getDriverForService(serviceType: string | null) {
  switch (serviceType) {
    case 'heavy_cargo':
    case 'freight':
      return MOCK_DRIVERS.find((d) => d.icon === 'truck') ?? MOCK_DRIVERS[3];
    case 'packers_movers':
      return MOCK_DRIVERS.find((d) => d.icon === 'packers_movers') ?? MOCK_DRIVERS[4];
    case 'auto':
      return MOCK_DRIVERS.find((d) => d.icon === 'auto') ?? MOCK_DRIVERS[1];
    case 'car':
      return MOCK_DRIVERS.find((d) => d.icon === 'car') ?? MOCK_DRIVERS[2];
    case 'bike_taxi':
    case 'parcel':
    case 'courier':
      return MOCK_DRIVERS.find((d) => d.icon === 'bike') ?? MOCK_DRIVERS[0];
    default:
      return MOCK_DRIVERS[0];
  }
}

const VEHICLE_IMAGES: Record<string, any> = {
  bike:           require('../../assets/images/bike-rider.png'),
  scooty:         require('../../assets/images/scooty.png'),
  auto:           require('../../assets/images/auto.png'),
  car:            require('../../assets/images/car.png'),
  car_xl:         require('../../assets/images/car-xl.png'),
  truck:          require('../../assets/images/truck.png'),
  packers_movers: require('../../assets/images/truck.png'),
};

// 5-stage live tracking steps (same stages as the live-tracking screen)
const TRIP_STEPS = [
  { key: 'assigned', label: 'Driver\nAssigned' },
  { key: 'arriving', label: 'Driver\nArriving' },
  { key: 'picked_up', label: 'Picked\nUp' },
  { key: 'en_route', label: 'En\nRoute' },
  { key: 'dropped', label: 'Dropped' },
];

const DRIVER_POSITIONS = [
  { x: 28, y: 35 }, { x: 32, y: 30 }, { x: 38, y: 26 },
  { x: 46, y: 35 }, { x: 54, y: 45 }, { x: 60, y: 55 }, { x: 66, y: 60 },
];

// Generates a stable mock 4-digit PIN from the driver id, so it stays the
// same for a given driver across re-renders (like a real OTP would).
function getMockOtp(driverId: string): string {
  let hash = 0;
  for (let i = 0; i < driverId.length; i++) {
    hash = (hash * 31 + driverId.charCodeAt(i)) >>> 0;
  }
  const code = (hash % 10000).toString().padStart(4, '0');
  return code;
}

// Mock map identical to fare/searching/live-tracking style, with an
// animated driver marker so tracking can happen right on this screen.
function MockMap({
  driverPos,
  pulseAnim,
}: {
  driverPos: { x: number; y: number };
  pulseAnim: Animated.Value;
}) {
  return (
    <View style={mapStyles.mapArea}>
      {[20, 40, 60, 80].map((pct) => (
        <View key={`h${pct}`} style={[mapStyles.gridLine, { top: `${pct}%`, left: 0, right: 0, height: 1 }]} />
      ))}
      {[20, 40, 60, 80].map((pct) => (
        <View key={`v${pct}`} style={[mapStyles.gridLine, { left: `${pct}%`, top: 0, bottom: 0, width: 1 }]} />
      ))}
      {/* Route */}
      <View style={[mapStyles.routeV, { left: '30%', top: '20%', height: '50%' }]} />
      <View style={[mapStyles.routeH, { left: '30%', top: '62%', width: '42%' }]} />
      {/* Pickup */}
      <View style={[mapStyles.markerWrap, { left: '26%', top: '18%' }]}>
        <View style={mapStyles.markerGreen} />
        <Text style={mapStyles.markerLabelGreen}>Pickup</Text>
      </View>
      {/* Drop */}
      <View style={[mapStyles.markerWrap, { left: '66%', top: '60%' }]}>
        <View style={mapStyles.markerRed} />
        <Text style={mapStyles.markerLabelRed}>Drop</Text>
      </View>
      {/* Driver marker (animated, moves along the route as the trip progresses) */}
      <Animated.View style={[mapStyles.driverDot, { left: `${driverPos.x}%`, top: `${driverPos.y}%`, transform: [{ scale: pulseAnim }] }]}>
        <Navigation size={13} color="#fff" />
      </Animated.View>
      {/* Badge */}
      <View style={mapStyles.badge}>
        <View style={mapStyles.liveDot} />
        <Text style={mapStyles.badgeText}>LIVE</Text>
      </View>
    </View>
  );
}

const mapStyles = StyleSheet.create({
  mapArea: { flex: 1, backgroundColor: '#E8F4F8', position: 'relative', overflow: 'hidden' },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.06)' },
  routeV: { position: 'absolute', width: 3, backgroundColor: Colors.primary, borderRadius: 2, opacity: 0.85 },
  routeH: { position: 'absolute', height: 3, backgroundColor: Colors.primary, borderRadius: 2, opacity: 0.85 },
  driverDot: {
    position: 'absolute', width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#1D4ED8', borderWidth: 2.5, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  markerWrap: { position: 'absolute', alignItems: 'center' },
  markerGreen: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.primary, borderWidth: 2, borderColor: '#fff' },
  markerRed: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.danger, borderWidth: 2, borderColor: '#fff' },
  markerLabelGreen: {
    fontSize: 9, fontWeight: '700', color: Colors.primary,
    backgroundColor: '#fff', paddingHorizontal: 4, paddingVertical: 1,
    borderRadius: 4, marginTop: 2, overflow: 'hidden',
  },
  markerLabelRed: {
    fontSize: 9, fontWeight: '700', color: Colors.danger,
    backgroundColor: '#fff', paddingHorizontal: 4, paddingVertical: 1,
    borderRadius: 4, marginTop: 2, overflow: 'hidden',
  },
  badge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.52)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#22C55E' },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});

export default function DriverFoundScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const { show: showComingSoon, modal } = useComingSoon();
  const { pickup, drop, resetBooking, serviceType, estimatedFare, paymentMode } = useBookingStore();
  const [showTripDetails, setShowTripDetails] = useState(false);
  // Measured content height — lets the DraggableSheet know exactly how
  // tall the content is, so dragging up stops right where it ends instead
  // of leaving blank space below it.

  const driver = getDriverForService(serviceType);
  const otp = getMockOtp(driver.id);
  const paymentLabel = paymentMode === 'cash' ? 'Cash' : paymentMode === 'wallet' ? 'Vahan Pay' : 'UPI';

  // ── Live trip-progress state (tracking happens right on this screen) ──
  const [etaMin, setEtaMin] = useState(3);
  const [pickupDistanceM, setPickupDistanceM] = useState(458);
  const [currentStep, setCurrentStep] = useState(0);
  const [driverPosIdx, setDriverPosIdx] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // ETA + pickup distance tick down as the captain approaches.
  useEffect(() => {
    const interval = setInterval(() => {
      setEtaMin((prev) => (prev > 1 ? prev - 1 : 1));
      setPickupDistanceM((prev) => (prev > 50 ? prev - 50 : prev));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Move the driver marker along the route over time.
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPosIdx((prev) => (prev < DRIVER_POSITIONS.length - 1 ? prev + 1 : prev));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Advance the assigned → arriving → picked up → en route → dropped stepper.
  useEffect(() => {
    if (currentStep >= TRIP_STEPS.length - 1) return;
    const timings = [10000, 15000, 20000, 30000];
    const timeout = setTimeout(() => setCurrentStep((prev) => prev + 1), timings[currentStep] ?? 15000);
    return () => clearTimeout(timeout);
  }, [currentStep]);

  const handleCancel = () => {
    Alert.alert('Cancel Booking', 'Cancel this booking?', [
      { text: 'Keep It', style: 'cancel' },
      { text: 'Cancel', style: 'destructive', onPress: () => { resetBooking(); router.replace('/(main)/home'); } },
    ]);
  };

  const handleTripDone = () => { router.replace('/(booking)/rate-trip'); };

  const driverPos = DRIVER_POSITIONS[driverPosIdx];

  return (
    <View style={[styles.root, { backgroundColor: isDark ? colors.background : '#E8F4F8' }]}>
      {modal}

      {/* Full-screen map (sheet floats on top, draggable) */}
      <View style={styles.mapContainer}>
        <MockMap driverPos={driverPos} pulseAnim={pulseAnim} />
        {/* Close button floating over map */}
        <SafeAreaView style={styles.mapOverlay} edges={['top']}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleCancel}>
            <X size={20} color={Colors.danger} />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Bottom sheet (drag up for full details, drag down for more map) */}
      <DraggableSheet
        backgroundColor="#FFF3E6"
        defaultHeight={0.48}
        expandedHeight={0.92}
        collapsedHeight={0.16}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.bottomSheetContent, { paddingBottom: 4 }]}
        >

          {/* ══ Container 1: Pickup ETA + distance ══ */}
          <View style={[styles.sheetCard, styles.etaCard, { borderColor: '#BBF7D0', backgroundColor: '#FFFFFF' }]}>
            <Text style={[styles.etaTitle, { color: colors.textPrimary }]}>
              Pickup in <Text style={styles.etaTitleAccent}>{etaMin} min{etaMin === 1 ? '' : 's'}</Text>
            </Text>
            <Text style={[styles.etaSubtitle, { color: colors.textSecondary }]}>
              Captain {pickupDistanceM} m away
            </Text>
          </View>

          {/* ══ Container 2: Driver + vehicle details + OTP ══ */}
          <View style={[styles.sheetCard, { borderColor: colors.cardBorder, backgroundColor: '#FFFFFF' }]}>
            <View style={styles.otpRow}>
              <Text style={[styles.otpLabel, { color: colors.textSecondary }]}>Start your ride with PIN</Text>
              <View style={styles.otpBoxRow}>
                {otp.split('').map((digit, idx) => (
                  <View key={idx} style={[styles.otpBox, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}>
                    <Text style={[styles.otpDigit, { color: colors.textPrimary }]}>{digit}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.driverFareBar, { borderColor: colors.cardBorder, backgroundColor: colors.iconBg, marginTop: 12 }]}>
              <View style={styles.driverAvatarWrap}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>{driver.name.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={[styles.driverName, { color: colors.textPrimary }]}>{driver.name}</Text>
                  <View style={styles.ratingRow}>
                    <Star size={11} color="#FF6B00" fill="#FF6B00" />
                    <Text style={styles.ratingText}>{driver.rating}</Text>
                    <Text style={[styles.ridesText, { color: colors.textSecondary }]}>· {driver.totalRides} rides</Text>
                  </View>
                  <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
                    {driver.vehicle} · {driver.vehicleNumber}
                  </Text>
                </View>
              </View>
              <Image source={VEHICLE_IMAGES[driver.icon] ?? VEHICLE_IMAGES.bike} style={styles.vehicleImage} />
            </View>
          </View>

          {/* ══ Container 3: Location + Trip Details + Total Fare ══ */}
          <View style={[styles.sheetCard, { borderColor: colors.cardBorder, backgroundColor: '#FFFFFF' }]}>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.routePointLabel, { color: colors.placeholder }]}>PICKUP FROM</Text>
                <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={1}>{pickup?.address ?? '—'}</Text>
              </View>
            </View>
            <View style={[styles.routeDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.routePointLabel, { color: colors.placeholder }]}>DROP AT</Text>
                <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={1}>{drop?.address ?? '—'}</Text>
              </View>
            </View>

            <View style={[styles.fareTripRow, { borderTopColor: colors.cardBorder }]}>
              <View>
                <Text style={[styles.fareLabelSmall, { color: colors.textSecondary }]}>Total Fare</Text>
                <Text style={styles.fareAmount}>₹{estimatedFare > 0 ? estimatedFare : 72}</Text>
              </View>
              <TouchableOpacity
                style={[styles.tripDetailsBtn, { borderColor: colors.cardBorder }]}
                onPress={() => setShowTripDetails(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.tripDetailsBtnText}>Trip Details</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ══ Container 4: Call / Message / SOS ══ */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]} onPress={() => showComingSoon('Call Driver')} activeOpacity={0.8}>
              <Image source={require('../../assets/images/icon-call.png')} style={styles.actionImage} />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]} onPress={() => showComingSoon('Message Driver')} activeOpacity={0.8}>
              <Image source={require('../../assets/images/message.jpg')} style={styles.actionImage} />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]} onPress={() => showComingSoon('SOS Emergency')} activeOpacity={0.8}>
              <Image source={require('../../assets/images/sos.jpg')} style={styles.actionImage} />
              <Text style={[styles.actionLabel, { color: Colors.danger }]}>SOS</Text>
            </TouchableOpacity>
          </View>

          {/* ══ Live trip-progress stepper ══ */}
          <View style={[styles.stepsCard, { backgroundColor: colors.iconBg, borderColor: colors.iconBorder }]}>
            <View style={styles.stepsRow}>
              {TRIP_STEPS.map((step, idx) => {
                const active = idx === currentStep;
                const done = idx < currentStep;
                return (
                  <View key={step.key} style={styles.stepItem}>
                    <View style={[styles.stepDot, done && styles.stepDotDone, active && styles.stepDotActive, { borderColor: done ? '#22C55E' : active ? Colors.primary : colors.border }]}>
                      {done && <CheckCircle size={12} color="#fff" />}
                      {active && <View style={styles.stepDotInner} />}
                    </View>
                    {idx < TRIP_STEPS.length - 1 && (
                      <View style={[styles.stepConnector, { backgroundColor: done ? '#22C55E' : colors.border }]} />
                    )}
                    <Text style={[
                      styles.stepLabel,
                      { color: done ? '#22C55E' : active ? Colors.primary : colors.placeholder },
                    ]}>{step.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Safety */}
          <View style={[styles.safetyBanner, { backgroundColor: colors.iconBg, borderColor: colors.iconBorder }]}>
            <Shield size={14} color={Colors.primary} />
            <Text style={styles.safetyText}>Your trip is covered under Vahan360 safety policy</Text>
          </View>

          {/* Simulate Trip Completed — only message/button shown at the bottom */}
          <TouchableOpacity style={[styles.doneBanner, { backgroundColor: '#FFFFFF', borderColor: '#BBF7D0' }]} onPress={handleTripDone} activeOpacity={0.85}>
            <CheckCircle size={16} color="#16A34A" />
            <Text style={styles.doneText}>Simulate Trip Completed</Text>
          </TouchableOpacity>
        </ScrollView>
      </DraggableSheet>

      {/* ── Trip Details Modal ── */}
      <Modal visible={showTripDetails} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismiss} onPress={() => setShowTripDetails(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Image source={VEHICLE_IMAGES[driver.icon] ?? VEHICLE_IMAGES.bike} style={styles.modalVehicleImg} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{driver.vehicle}</Text>
              <TouchableOpacity onPress={() => setShowTripDetails(false)} style={[styles.modalClose, { backgroundColor: colors.inputBackground, borderColor: colors.cardBorder }]}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 32 }}>
              {/* Driver card */}
              <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}>
                <Text style={[styles.cardLabel, { color: colors.placeholder }]}>👤 YOUR DRIVER</Text>
                <View style={styles.driverAvatarWrap}>
                  <View style={styles.driverAvatar}>
                    <Text style={styles.driverAvatarText}>{driver.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.driverName, { color: colors.textPrimary }]}>{driver.name}</Text>
                    <View style={styles.ratingRow}>
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={11} color={Colors.primary} fill={s <= Math.round(driver.rating) ? Colors.primary : 'transparent'} />
                      ))}
                      <Text style={styles.ratingText}>{driver.rating}</Text>
                      <Text style={[styles.ridesText, { color: colors.textSecondary }]}>· {driver.totalRides} rides</Text>
                    </View>
                    <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>{driver.vehicle} · {driver.vehicleNumber}</Text>
                  </View>
                </View>
              </View>

              {/* Location details */}
              <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}>
                <Text style={[styles.cardLabel, { color: colors.placeholder }]}>📍 LOCATION DETAILS</Text>
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
                  <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={2}>{pickup?.address ?? '—'}</Text>
                </View>
                <View style={[styles.routeDivider, { backgroundColor: colors.cardBorder }]} />
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
                  <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={2}>{drop?.address ?? '—'}</Text>
                </View>
              </View>

              {/* Fare */}
              <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}>
                <View style={styles.totalFareRow}>
                  <Text style={[styles.totalFareLabel, { color: colors.textPrimary }]}>Total Fare</Text>
                  <Text style={styles.totalFareAmount}>₹{estimatedFare > 0 ? estimatedFare : 72}</Text>
                </View>
              </View>

              {/* Payment */}
              <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}>
                <View style={styles.payingRow}>
                  <Image source={require('../../assets/images/icon-cash.png')} style={styles.payingIcon} />
                  <Text style={[styles.payingText, { color: colors.textSecondary }]}>Paying via {paymentLabel}</Text>
                </View>
              </View>

              {/* Safety */}
              <View style={[styles.safetyBanner, { backgroundColor: colors.iconBg, borderColor: colors.iconBorder }]}>
                <Shield size={14} color={Colors.primary} />
                <Text style={styles.safetyText}>Your trip is covered under Vahan360 safety policy</Text>
              </View>

              <Button label="Cancel Ride" onPress={() => { setShowTripDetails(false); handleCancel(); }} variant="outline" style={{ width: '100%' }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  root: { flex: 1 },
  mapContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  mapOverlay: { position: 'absolute', top: 0, right: 0, paddingHorizontal: 16, paddingTop: 8 },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#FFD6B3', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },

  // Bottom sheet content padding (position/height/shadow/handle now handled by DraggableSheet)
  bottomSheetContent: {
    paddingHorizontal: 16, paddingBottom: 24,
  },

  // Generic container card used for the 4 main boxes
  sheetCard: {
    borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 12,
  },

  // Container 1: ETA banner
  etaCard: { paddingVertical: 16 },
  etaTitle: { fontSize: 18, fontWeight: '800' },
  etaTitleAccent: { color: '#059669' },
  etaSubtitle: { fontSize: 14, fontWeight: '500', marginTop: 4 },

  // Container 2: OTP + driver
  otpRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  otpLabel: { fontSize: 13, fontWeight: '600', flex: 1, marginRight: 8 },
  otpBoxRow: { flexDirection: 'row', gap: 6 },
  otpBox: {
    width: 32, height: 38, borderRadius: 8, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center',
  },
  otpDigit: { fontSize: 18, fontWeight: '800' },

  driverFareBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 16, borderWidth: 1, padding: 12,
  },
  driverAvatarWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  driverAvatar: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  driverAvatarText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  driverName: { fontSize: 15, fontWeight: '800' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#FF6B00' },
  ridesText: { fontSize: 11 },
  vehicleText: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  vehicleImage: { width: 56, height: 48, resizeMode: 'contain' },

  // Container 3: Location + Trip details + Fare
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6 },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  routeDivider: { height: 1, marginLeft: 20, marginVertical: 2 },
  routePointLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginBottom: 1 },
  routeText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  fareTripRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, marginTop: 8, paddingTop: 12,
  },
  fareLabelSmall: { fontSize: 11, fontWeight: '500' },
  fareAmount: { fontSize: 22, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  tripDetailsBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  tripDetailsBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  // Container 4: Call / Message / SOS
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  actionBtn: {
    flex: 1, borderRadius: 18, paddingVertical: 12,
    alignItems: 'center', gap: 6, borderWidth: 1,
  },
  actionImage: { width: 34, height: 34, resizeMode: 'contain' },
  actionLabel: { fontSize: 11, fontWeight: '700' },

  // Live trip-progress stepper
  stepsCard: { borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 12 },
  stepsRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  stepItem: { alignItems: 'center', flex: 1, position: 'relative' },
  stepDot: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: 'transparent',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2,
  },
  stepDotDone: { backgroundColor: '#22C55E' },
  stepDotActive: { backgroundColor: '#fff' },
  stepDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  stepConnector: {
    position: 'absolute', top: 13, left: '50%', right: '-50%', height: 2,
  },
  stepLabel: { fontSize: 8, textAlign: 'center', marginTop: 5, fontWeight: '600' },

  safetyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 14, padding: 12, borderWidth: 1, marginBottom: 12,
  },
  safetyText: { flex: 1, fontSize: 12, lineHeight: 16, color: '#F59E0B', fontWeight: '500' },

  doneBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 16, padding: 14, borderWidth: 1,
  },
  doneText: { fontSize: 14, fontWeight: '700', color: Colors.success },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalDismiss: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 20, paddingBottom: 0,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  modalVehicleImg: { width: 40, height: 32, resizeMode: 'contain' },
  modalTitle: { fontSize: 18, fontWeight: '800', flex: 1 },
  modalClose: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },

  card: {
    borderRadius: 18, padding: 14, borderWidth: 1,
    shadowColor: '#FF6B00', shadowOpacity: 0.04, shadowRadius: 8, elevation: 3,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  totalFareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalFareLabel: { fontSize: 16, fontWeight: '700' },
  totalFareAmount: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  payingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payingIcon: { width: 28, height: 28, resizeMode: 'contain' },
  payingText: { fontSize: 14, fontWeight: '500' },
});