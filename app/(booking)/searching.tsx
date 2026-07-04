import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ImageSourcePropType, Modal, ScrollView, Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, Shield, RefreshCw, ChevronRight, MapPin } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { useComingSoon } from '../../components/common/ComingSoonModal';
import { useBookingStore, type ServiceType } from '../../store/bookingStore';
import { useAuthStore } from '../../store/authStore';
import {
  useTripHistoryStore,
  formatTripDate,
  formatTripTime,
  SERVICE_TYPE_TO_LABEL,
} from '../../store/tripHistoryStore';
import { Button } from '../../components/common/Button';
import { DraggableSheet } from '../../components/common/DraggableSheet';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SERVICE_IMAGES: Record<string, ImageSourcePropType> = {
  bike_taxi:      require('../../assets/images/Ride.png'),
  scooty:         require('../../assets/images/scooty.png'),
  auto:           require('../../assets/images/auto.png'),
  car:            require('../../assets/images/car.png'),
  car_xl:         require('../../assets/images/car-xl.png'),
  parcel:         require('../../assets/images/Ride.png'),
  courier:        require('../../assets/images/Ride.png'),
  freight:        require('../../assets/images/truck.png'),
  heavy_cargo:    require('../../assets/images/truck.png'),
  packers_movers: require('../../assets/images/truck.png'),
};

const SERVICE_LABELS: Record<string, string> = {
  bike_taxi:      'Finding your driver',
  scooty:         'Finding your scooty',
  auto:           'Finding your auto',
  car:            'Finding your car',
  car_xl:         'Finding your car',
  parcel:         'Finding a delivery partner',
  courier:        'Finding a courier partner',
  freight:        'Finding a truck',
  heavy_cargo:    'Finding a truck',
  packers_movers: 'Finding your moving team',
};

const SERVICE_VEHICLE_NAMES: Record<string, string> = {
  bike_taxi:      'Bike Direct',
  scooty:         'Scooty',
  auto:           'Auto',
  car:            'Car',
  car_xl:         'Car XL',
  parcel:         'Parcel',
  courier:        'Courier',
  freight:        'Truck',
  heavy_cargo:    'Truck',
  packers_movers: 'Packers & Movers',
};

const ALTERNATE_VEHICLES = [
  { id: 'bike_taxi', label: 'Bike Taxi', emoji: '🏍️', desc: 'Fastest option nearby' },
  { id: 'auto',      label: 'Auto',      emoji: '🛺', desc: 'Comfortable & affordable' },
  { id: 'car',       label: 'Car',       emoji: '🚗', desc: 'Premium experience' },
];

const CANCEL_REASONS = [
  'Driver is taking too long',
  'I changed my mind',
  'Wrong pickup location',
  'Found another option',
  'Other',
];

// Mock map — same style as fare.tsx
function MockMap({ hasRoute }: { hasRoute?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={mapStyles.mapArea}>
      {[20, 40, 60, 80].map((pct) => (
        <View key={`h${pct}`} style={[mapStyles.gridLine, { top: `${pct}%`, left: 0, right: 0, height: 1 }]} />
      ))}
      {[20, 40, 60, 80].map((pct) => (
        <View key={`v${pct}`} style={[mapStyles.gridLine, { left: `${pct}%`, top: 0, bottom: 0, width: 1 }]} />
      ))}
      {hasRoute && (
        <>
          <View style={[mapStyles.routeLine, { left: '30%', top: '25%', height: '50%' }]} />
          <View style={[mapStyles.routeLineH, { left: '30%', top: '65%', width: '40%' }]} />
        </>
      )}
      {/* Pulse circles to show searching */}
      <View style={[mapStyles.pulseOuter, { left: '45%', top: '40%' }]} />
      <View style={[mapStyles.pulseInner, { left: '45%', top: '40%' }]} />
      {/* Pickup marker */}
      <View style={[mapStyles.marker, { left: '28%', top: '22%' }]}>
        <View style={mapStyles.markerDotGreen} />
      </View>
      {/* Drop marker */}
      <View style={[mapStyles.marker, { left: '64%', top: '63%' }]}>
        <View style={mapStyles.markerDotRed} />
      </View>
      {/* Badge */}
      <View style={mapStyles.badge}>
        <MapPin size={10} color={Colors.white} />
        <Text style={mapStyles.badgeText}>SEARCHING</Text>
      </View>
    </View>
  );
}

const mapStyles = StyleSheet.create({
  mapArea: { flex: 1, backgroundColor: '#E8F4F8', position: 'relative', overflow: 'hidden' },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.06)' },
  routeLine: { position: 'absolute', width: 3, backgroundColor: Colors.primary, borderRadius: 2, opacity: 0.85 },
  routeLineH: { position: 'absolute', height: 3, backgroundColor: Colors.primary, borderRadius: 2, opacity: 0.85 },
  pulseOuter: {
    position: 'absolute', width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,107,0,0.12)',
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  pulseInner: {
    position: 'absolute', width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,107,0,0.3)',
    transform: [{ translateX: -14 }, { translateY: -14 }],
  },
  marker: { position: 'absolute', alignItems: 'center' },
  markerDotGreen: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.primary, borderWidth: 2, borderColor: '#fff',
  },
  markerDotRed: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.danger, borderWidth: 2, borderColor: '#fff',
  },
  badge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});

// Animated progress bar
function SearchingBar() {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: false }),
      ])
    ).start();
  }, []);
  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={{ height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', marginVertical: 10 }}>
      <Animated.View style={{ height: 4, borderRadius: 2, backgroundColor: Colors.primary, width }} />
    </View>
  );
}

export default function SearchingScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const { modal } = useComingSoon();
  const {
    pickup, drop, estimatedFare, resetBooking, serviceType, setServiceType,
    appliedCoupon, activeBookingId, setActiveBookingId,
  } = useBookingStore();
  const { user } = useAuthStore();
  const upsertTrip = useTripHistoryStore((s) => s.upsertTrip);
  const updateTripStatus = useTripHistoryStore((s) => s.updateTripStatus);
  const [searchDots, setSearchDots] = useState('.');
  const [driverNotFound, setDriverNotFound] = useState(false);
  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [showTripDetails, setShowTripDetails] = useState(false);

  const svcKey = serviceType ?? 'bike_taxi';
  const centreImage = SERVICE_IMAGES[svcKey] ?? SERVICE_IMAGES.bike_taxi;
  const title = SERVICE_LABELS[svcKey] ?? 'Finding your driver';
  const vehicleName = SERVICE_VEHICLE_NAMES[svcKey] ?? 'Bike Direct';

  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, estimatedFare - discount);

  useEffect(() => {
    if (driverNotFound || retrying) return;
    const dotTimer = setInterval(() => {
      setSearchDots((d) => (d.length >= 3 ? '.' : d + '.'));
    }, 600);
    const outcome = Math.random() < 0.3 ? 'not_found' : 'found';
    const delay = outcome === 'found' ? 4000 : 6000;
    const foundTimer = setTimeout(() => {
      clearInterval(dotTimer);
      if (outcome === 'found') {
        // Record the order as "Booked" the moment a driver/partner is
        // confirmed, so it shows up in Order History immediately — for
        // every domain (ride, truck, parcel, packers & movers) — instead
        // of only appearing once the trip is later rated as completed.
        if (user) {
          const now = new Date();
          const bookingId = activeBookingId ?? `TRIP-${now.getTime()}`;
          setActiveBookingId(bookingId);
          upsertTrip(user.id, {
            id: bookingId,
            service: serviceType ? SERVICE_TYPE_TO_LABEL[serviceType] ?? 'Ride' : 'Ride',
            pickup: pickup?.address ?? pickup?.label ?? 'Pickup Location',
            drop: drop?.address ?? drop?.label ?? 'Drop Location',
            date: formatTripDate(now),
            time: formatTripTime(now),
            fare: `₹${estimatedFare}`,
            status: 'booked',
            driverName: null,
            driverPhone: null,
            vehicleNumber: null,
            rating: null,
            distance: null,
            duration: null,
          });
        }

        if (serviceType === 'packers_movers') {
          router.replace('/(booking)/driver-booking');
        } else {
          router.replace('/(booking)/driver-found');
        }
      } else {
        setDriverNotFound(true);
      }
    }, delay);
    return () => { clearInterval(dotTimer); clearTimeout(foundTimer); };
  }, [retrying, driverNotFound]);

  const handleRetry = () => {
    setDriverNotFound(false);
    setRetrying((v) => !v);
  };

  const handleChangeVehicle = (vehicleId: string) => {
    setServiceType(vehicleId as ServiceType);
    setDriverNotFound(false);
    setRetrying((v) => !v);
  };

  const handleCancelConfirm = () => {
    if (!selectedReason) return;
    setShowCancelSheet(false);

    // Make sure a cancelled order always shows up in Order History — if a
    // "booked" record already exists (driver was found) flip it to
    // cancelled, otherwise create one now so cancelling during the search
    // itself is still recorded.
    if (user) {
      const now = new Date();
      const bookingId = activeBookingId ?? `TRIP-${now.getTime()}`;
      if (activeBookingId) {
        updateTripStatus(user.id, bookingId, 'cancelled');
      } else {
        upsertTrip(user.id, {
          id: bookingId,
          service: serviceType ? SERVICE_TYPE_TO_LABEL[serviceType] ?? 'Ride' : 'Ride',
          pickup: pickup?.address ?? pickup?.label ?? 'Pickup Location',
          drop: drop?.address ?? drop?.label ?? 'Drop Location',
          date: formatTripDate(now),
          time: formatTripTime(now),
          fare: `₹${estimatedFare}`,
          status: 'cancelled',
          driverName: null,
          driverPhone: null,
          vehicleNumber: null,
          rating: null,
          distance: null,
          duration: null,
        });
      }
    }

    resetBooking();
    router.replace('/(main)/home');
  };

  // ── No driver found state ──
  if (driverNotFound) {
    return (
      <View style={[styles.root, { backgroundColor: isDark ? colors.background : '#E8F4F8' }]}>
        <View style={styles.mapContainer}>
          <MockMap />
          <SafeAreaView style={styles.mapOverlay} edges={['top']}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCancelSheet(true)}>
              <X size={20} color={Colors.danger} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <DraggableSheet
          backgroundColor={colors.surface}
          defaultHeight={0.5}
          expandedHeight={0.70}
          collapsedHeight={0.32}
        >
          <View style={styles.bottomSheetContent}>
          <Text style={styles.noDriverEmoji}>😔</Text>
          <Text style={[styles.noDriverTitle, { color: colors.textPrimary }]}>
            No {vehicleName} available
          </Text>
          <Text style={[styles.noDriverSubtitle, { color: colors.textSecondary }]}>
            We couldn't find a driver nearby. Try again or choose a different vehicle.
          </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingBottom: 20 }}
          >
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.85}>
              <RefreshCw size={18} color="#FFFFFF" />
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>

            <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}>
              <Text style={[styles.cardLabel, { color: colors.placeholder }]}>🔄 TRY A DIFFERENT VEHICLE</Text>
              {ALTERNATE_VEHICLES.filter((v) => v.id !== svcKey).map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.altVehicleRow, { borderBottomColor: colors.cardBorder }]}
                  onPress={() => handleChangeVehicle(v.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.altVehicleEmoji}>{v.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.altVehicleName, { color: colors.textPrimary }]}>{v.label}</Text>
                    <Text style={[styles.altVehicleDesc, { color: colors.textSecondary }]}>{v.desc}</Text>
                  </View>
                  <ChevronRight size={18} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </View>

            <Button label={t('cancel')} onPress={() => setShowCancelSheet(true)} variant="outline" style={{ width: '100%' }} />
          </ScrollView>
        </DraggableSheet>

        {/* Cancel sheet */}
        <Modal visible={showCancelSheet} transparent animationType="slide">
          <View style={styles.sheetOverlay}>
            <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Why are you cancelling?</Text>
              <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>Help us improve by selecting a reason</Text>
              {CANCEL_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonRow, { borderBottomColor: colors.cardBorder }, selectedReason === reason && styles.reasonRowActive]}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.reasonRadio, { borderColor: selectedReason === reason ? Colors.primary : colors.border }, selectedReason === reason && styles.reasonRadioActive]}>
                    {selectedReason === reason && <View style={styles.reasonRadioInner} />}
                  </View>
                  <Text style={[styles.reasonText, { color: colors.textPrimary }]}>{reason}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.sheetActions}>
                <TouchableOpacity style={[styles.sheetCancelBtn, { borderColor: colors.cardBorder }]} onPress={() => { setShowCancelSheet(false); setSelectedReason(null); }}>
                  <Text style={[styles.sheetCancelText, { color: colors.textSecondary }]}>Go Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sheetConfirmBtn, !selectedReason && styles.sheetConfirmBtnDisabled]}
                  onPress={handleCancelConfirm}
                  disabled={!selectedReason}
                >
                  <Text style={styles.sheetConfirmText}>Confirm Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ── Normal searching state ──
  return (
    <View style={[styles.root, { backgroundColor: isDark ? colors.background : '#E8F4F8' }]}>
      {modal}
      {/* Map */}
      <View style={styles.mapContainer}>
        <MockMap />
        <SafeAreaView style={styles.mapOverlay} edges={['top']}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCancelSheet(true)}>
            <X size={20} color={Colors.danger} />
          </TouchableOpacity>
        </SafeAreaView>
        {/* Searching progress overlay on map */}
        <View style={styles.mapProgressOverlay}>
          <Text style={styles.mapProgressText}>Waiting for Captain to accept</Text>
          <View style={styles.mapProgressBar}>
            <Animated.View style={styles.mapProgressFill} />
          </View>
        </View>
      </View>

      {/* Bottom sheet (drag up for full details, drag down for more map) */}
      <DraggableSheet
        backgroundColor={colors.surface}
        defaultHeight={0.5}
        expandedHeight={0.65}
        collapsedHeight={0.23}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.bottomSheetContent, { paddingBottom: 4 }]}
        >
        {/* Searching in progress */}
        <Text style={styles.searchingTitle}>Searching in progress{searchDots}</Text>
        <SearchingBar />

        {/* Fare bar with Trip Details button */}
        <View style={[styles.fareBar, { borderColor: colors.cardBorder }]}>
          <View style={styles.fareBarLeft}>
            <Image source={centreImage} style={styles.vehicleThumb} />
            <View>
              <Text style={[styles.fareBarVehicle, { color: colors.textPrimary }]}>{vehicleName}</Text>
              <Text style={[styles.fareBarLabel, { color: colors.textSecondary }]}>Total Fare</Text>
              <Text style={styles.fareBarAmount}>₹{total > 0 ? total : estimatedFare}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.tripDetailsBtn, { borderColor: colors.cardBorder }]}
            onPress={() => setShowTripDetails(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.tripDetailsBtnText}>Trip Details</Text>
          </TouchableOpacity>
        </View>

        {/* Location Details container */}
        <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.surface, marginBottom: 12 }]}>
          <Text style={[styles.cardLabel, { color: colors.placeholder }]}>📍 LOCATION DETAILS</Text>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
            <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={2}>
              {pickup?.address ?? '—'}
            </Text>
          </View>
          <View style={[styles.routeDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
            <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={2}>
              {drop?.address ?? '—'}
            </Text>
          </View>
        </View>

        {/* Total Fare container */}
        <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.surface, marginBottom: 12 }]}>
          <View style={styles.totalFareRow}>
            <Text style={[styles.totalFareLabel, { color: colors.textPrimary }]}>Total Fare</Text>
            <Text style={styles.totalFareAmount}>₹{total > 0 ? total : estimatedFare}</Text>
          </View>
        </View>

        {/* Safety banner */}
        <View style={[styles.safetyBanner, { backgroundColor: colors.iconBg, borderColor: colors.iconBorder }]}>
          <Shield size={14} color={Colors.primary} />
          <Text style={styles.safetyText}>Your trip is covered under Vahan360 safety policy</Text>
        </View>

        <Button label={t('cancel')} onPress={() => setShowCancelSheet(true)} variant="outline" style={{ width: '100%', marginTop: 10 }} />
        </ScrollView>
      </DraggableSheet>

      {/* ── Trip Details Modal ── */}
      <Modal visible={showTripDetails} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismiss} onPress={() => setShowTripDetails(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Image source={centreImage} style={styles.modalVehicleImage} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{vehicleName}</Text>
              <TouchableOpacity
                onPress={() => setShowTripDetails(false)}
                style={[styles.modalClose, { backgroundColor: colors.inputBackground, borderColor: colors.cardBorder }]}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 32 }}>
              {/* Searching service label */}
              <View style={[styles.searchingForCard, { backgroundColor: colors.iconBg, borderColor: colors.iconBorder }]}>
                <Text style={[styles.searchingForLabel, { color: colors.textSecondary }]}>Searching for below services...</Text>
                <View style={styles.searchingServiceRow}>
                  <Image source={centreImage} style={styles.searchingServiceImage} />
                  <Text style={[styles.searchingServiceName, { color: colors.textPrimary }]}>{vehicleName}</Text>
                  <Text style={styles.searchingServiceFare}>₹{total > 0 ? total : estimatedFare}</Text>
                </View>
              </View>

              {/* Location Details */}
              <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}>
                <Text style={[styles.cardLabel, { color: colors.placeholder }]}>📍 LOCATION DETAILS</Text>
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
                  <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={2}>
                    {pickup?.address ?? '—'}
                  </Text>
                </View>
                <View style={[styles.routeDivider, { backgroundColor: colors.cardBorder }]} />
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
                  <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={2}>
                    {drop?.address ?? '—'}
                  </Text>
                </View>
              </View>

              {/* Total fare */}
              <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}>
                <View style={styles.totalFareRow}>
                  <Text style={[styles.totalFareLabel, { color: colors.textPrimary }]}>Total Fare</Text>
                  <Text style={styles.totalFareAmount}>₹{total > 0 ? total : estimatedFare}</Text>
                </View>
              </View>

              {/* Paying via */}
              <View style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}>
                <View style={styles.payingRow}>
                  <Image source={require('../../assets/images/icon-cash.png')} style={styles.payingIcon} />
                  <Text style={[styles.payingText, { color: colors.textSecondary }]}>Paying via cash</Text>
                </View>
              </View>

              {/* Safety */}
              <View style={[styles.safetyBanner, { backgroundColor: colors.iconBg, borderColor: colors.iconBorder }]}>
                <Shield size={14} color={Colors.primary} />
                <Text style={styles.safetyText}>Your trip is covered under Vahan360 safety policy</Text>
              </View>

              {/* Buttons */}
              <View style={styles.modalActions}>
                <Button label="Back" onPress={() => setShowTripDetails(false)} style={{ flex: 1 }} />
                <Button label="Cancel Ride" onPress={() => { setShowTripDetails(false); setShowCancelSheet(true); }} variant="outline" style={{ flex: 1 }} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Cancel bottom sheet */}
      <Modal visible={showCancelSheet} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Why are you cancelling?</Text>
            <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>Help us improve by selecting a reason</Text>
            {CANCEL_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[styles.reasonRow, { borderBottomColor: colors.cardBorder }, selectedReason === reason && styles.reasonRowActive]}
                onPress={() => setSelectedReason(reason)}
                activeOpacity={0.8}
              >
                <View style={[styles.reasonRadio, { borderColor: selectedReason === reason ? Colors.primary : colors.border }, selectedReason === reason && styles.reasonRadioActive]}>
                  {selectedReason === reason && <View style={styles.reasonRadioInner} />}
                </View>
                <Text style={[styles.reasonText, { color: colors.textPrimary }]}>{reason}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.sheetActions}>
              <TouchableOpacity style={[styles.sheetCancelBtn, { borderColor: colors.cardBorder }]} onPress={() => { setShowCancelSheet(false); setSelectedReason(null); }}>
                <Text style={[styles.sheetCancelText, { color: colors.textSecondary }]}>Keep Searching</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetConfirmBtn, !selectedReason && styles.sheetConfirmBtnDisabled]}
                onPress={handleCancelConfirm}
                disabled={!selectedReason}
              >
                <Text style={styles.sheetConfirmText}>Confirm Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  root: { flex: 1 },
  mapContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  mapOverlay: { position: 'absolute', top: 0, right: 0, paddingHorizontal: 16, paddingTop: 8, alignItems: 'flex-end' },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#FFD6B3', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },
  mapProgressOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: 'rgba(30,30,40,0.82)',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  mapProgressText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', marginBottom: 6 },
  mapProgressBar: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  mapProgressFill: { height: 4, borderRadius: 2, width: '55%', backgroundColor: '#5B8DEF' },

  // Bottom sheet content padding (position/height/shadow/handle now handled by DraggableSheet)
  bottomSheetContent: {
    paddingHorizontal: 16, paddingBottom: 28,
  },

  searchingTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },

  fareBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 14,
  },
  fareBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vehicleThumb: { width: 48, height: 36, resizeMode: 'contain' },
  fareBarVehicle: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  fareBarLabel: { fontSize: 10, fontWeight: '500' },
  fareBarAmount: { fontSize: 20, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  tripDetailsBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5,
  },
  tripDetailsBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  safetyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 14, padding: 12, borderWidth: 1, marginBottom: 4,
  },
  safetyText: { flex: 1, fontSize: 12, lineHeight: 16, color: '#F59E0B', fontWeight: '500' },

  // No driver state
  noDriverEmoji: { fontSize: 42, textAlign: 'center', marginBottom: 8, marginTop: 4 },
  noDriverTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3, marginBottom: 4 },
  noDriverSubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 18, marginBottom: 14 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary, borderRadius: 18, paddingVertical: 14,
    shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }, elevation: 6,
  },
  retryBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  altVehicleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1,
  },
  altVehicleEmoji: { fontSize: 24 },
  altVehicleName: { fontSize: 14, fontWeight: '700' },
  altVehicleDesc: { fontSize: 12, marginTop: 2 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalDismiss: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 20, paddingBottom: 0,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16,
  },
  modalVehicleImage: { width: 40, height: 32, resizeMode: 'contain' },
  modalTitle: { fontSize: 18, fontWeight: '800', flex: 1 },
  modalClose: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  modalActions: { flexDirection: 'row', gap: 12 },

  // Trip details modal content
  searchingForCard: {
    borderRadius: 16, padding: 14, borderWidth: 1,
  },
  searchingForLabel: { fontSize: 12, fontWeight: '600', marginBottom: 10 },
  searchingServiceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchingServiceImage: { width: 44, height: 34, resizeMode: 'contain' },
  searchingServiceName: { fontSize: 15, fontWeight: '700', flex: 1 },
  searchingServiceFare: { fontSize: 16, fontWeight: '800', color: Colors.primary },

  card: {
    borderRadius: 18, padding: 14, borderWidth: 1,
    shadowColor: '#FF6B00', shadowOpacity: 0.04, shadowRadius: 8, elevation: 3,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6 },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  routeDivider: { height: 1, marginLeft: 20, marginVertical: 2 },
  routeText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },

  totalFareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalFareLabel: { fontSize: 16, fontWeight: '700' },
  totalFareAmount: { fontSize: 20, fontWeight: '800', color: Colors.primary },

  payingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payingIcon: { width: 28, height: 28, resizeMode: 'contain' },
  payingText: { fontSize: 14, fontWeight: '500' },

  // Cancel sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  sheetTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  sheetSubtitle: { fontSize: 13, marginBottom: 20 },
  reasonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, borderBottomWidth: 1,
  },
  reasonRowActive: { backgroundColor: Colors.primaryLight, marginHorizontal: -24, paddingHorizontal: 24 },
  reasonRadio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  reasonRadioActive: {},
  reasonRadioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  reasonText: { fontSize: 15, fontWeight: '500' },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  sheetCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 16,
    borderWidth: 1.5, alignItems: 'center',
  },
  sheetCancelText: { fontSize: 14, fontWeight: '700' },
  sheetConfirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 16,
    backgroundColor: Colors.danger, alignItems: 'center',
  },
  sheetConfirmBtnDisabled: { backgroundColor: '#FECACA' },
  sheetConfirmText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});