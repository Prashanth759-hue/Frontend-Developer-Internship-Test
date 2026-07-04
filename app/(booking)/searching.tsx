import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, ImageSourcePropType, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, Shield, RefreshCw, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useComingSoon } from '../../components/common/ComingSoonModal';
import { useBookingStore } from '../../store/bookingStore';
import { Button } from '../../components/common/Button';

const SERVICE_IMAGES: Record<string, ImageSourcePropType> = {
  bike_taxi:      require('../../assets/images/Ride.png'),
  auto:           require('../../assets/images/auto.png'),
  car:            require('../../assets/images/car.png'),
  parcel:         require('../../assets/images/Ride.png'),
  courier:        require('../../assets/images/Ride.png'),
  heavy_cargo:    require('../../assets/images/truck.png'),
  packers_movers: require('../../assets/images/truck.png'),
};

const SERVICE_LABELS: Record<string, string> = {
  bike_taxi:      'Finding your driver',
  auto:           'Finding your auto',
  car:            'Finding your car',
  parcel:         'Finding a delivery partner',
  courier:        'Finding a courier partner',
  heavy_cargo:    'Finding a truck',
  packers_movers: 'Finding your moving team',
};

const SERVICE_SUBLABELS: Record<string, string> = {
  bike_taxi:      'Connecting you with a nearby driver',
  auto:           'Connecting you with a nearby auto',
  car:            'Connecting you with a nearby car',
  parcel:         'Looking for a nearby delivery partner',
  courier:        'Looking for a nearby courier partner',
  heavy_cargo:    'Matching you with a truck partner',
  packers_movers: 'Assembling your moving team nearby',
};

// Alternate vehicles to suggest when no driver found
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

function PulseRing({ delay, width, height }: { delay: number; width: number; height: number }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => setVisible((v) => !v), 900);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <View
      style={[styles.ring, { width, height, borderRadius: height / 2, opacity: visible ? 0.5 : 0.1 }]}
    />
  );
}

export default function SearchingScreen() {
  const { colors } = useTheme();
  const { show: showComingSoon, modal } = useComingSoon();
  const { pickup, drop, resetBooking, serviceType, setServiceType } = useBookingStore();
  const [searchDots, setSearchDots] = useState('.');
  const [driverNotFound, setDriverNotFound] = useState(false);
  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const svcKey = serviceType ?? 'bike_taxi';
  const centreImage = SERVICE_IMAGES[svcKey] ?? SERVICE_IMAGES.bike_taxi;
  const title = SERVICE_LABELS[svcKey] ?? 'Finding your driver';
  const subtitle = SERVICE_SUBLABELS[svcKey] ?? 'Connecting you with a nearby driver';

  useEffect(() => {
    if (driverNotFound || retrying) return;

    const dotTimer = setInterval(() => {
      setSearchDots((d) => (d.length >= 3 ? '.' : d + '.'));
    }, 600);

    // Simulate: 30% chance no driver found, else found after 4s
    const outcome = Math.random() < 0.3 ? 'not_found' : 'found';
    const delay = outcome === 'found' ? 4000 : 6000;

    const foundTimer = setTimeout(() => {
      clearInterval(dotTimer);
      if (outcome === 'found') {
        router.replace('/(booking)/driver-found');
      } else {
        setDriverNotFound(true);
      }
    }, delay);

    return () => { clearInterval(dotTimer); clearTimeout(foundTimer); };
  }, [retrying, driverNotFound]);

  const handleRetry = () => {
    setDriverNotFound(false);
    setRetrying((v) => !v); // toggle to re-trigger useEffect
  };

  const handleChangeVehicle = (vehicleId: string) => {
    setServiceType(vehicleId as any);
    setDriverNotFound(false);
    setRetrying((v) => !v);
  };

  const handleCancelConfirm = () => {
    if (!selectedReason) return;
    setShowCancelSheet(false);
    resetBooking();
    router.replace('/(main)/home');
  };

  if (driverNotFound) {
    return (
      <ImageBackground
        source={require('../../assets/images/home-bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safe}>
          {modal}
          <View style={styles.heroHeader}>
            <Text style={styles.noDriverEmoji}>😔</Text>
            <Text style={styles.noDriverTitle}>No {title.replace('Finding your ', '').replace('Finding a ', '')} available</Text>
            <Text style={styles.noDriverSubtitle}>
              We couldn't find a driver nearby right now. Please try again or choose a different vehicle type.
            </Text>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Retry */}
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.85}>
              <RefreshCw size={20} color="#FFFFFF" />
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>

            {/* Change vehicle */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🔄 TRY A DIFFERENT VEHICLE</Text>
              {ALTERNATE_VEHICLES.filter((v) => v.id !== svcKey).map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={styles.altVehicleRow}
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

            {/* Cancel */}
            <Button
              label="Cancel Booking"
              onPress={() => setShowCancelSheet(true)}
              variant="outline"
              style={styles.cancelBtn}
            />
          </ScrollView>

          {/* Cancel bottom sheet */}
          <Modal visible={showCancelSheet} transparent animationType="slide">
            <View style={styles.sheetOverlay}>
              <View style={styles.sheet}>
                <Text style={styles.sheetTitle}>Why are you cancelling?</Text>
                <Text style={styles.sheetSubtitle}>Help us improve by selecting a reason</Text>
                {CANCEL_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonRow, selectedReason === reason && styles.reasonRowActive]}
                    onPress={() => setSelectedReason(reason)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.reasonRadio, selectedReason === reason && styles.reasonRadioActive]}>
                      {selectedReason === reason && <View style={styles.reasonRadioInner} />}
                    </View>
                    <Text style={[styles.reasonText, { color: colors.textPrimary }]}>{reason}</Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.sheetActions}>
                  <TouchableOpacity
                    style={styles.sheetCancelBtn}
                    onPress={() => { setShowCancelSheet(false); setSelectedReason(null); }}
                  >
                    <Text style={styles.sheetCancelText}>Go Back</Text>
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
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/home-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {modal}
        <View style={styles.heroHeader}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCancelSheet(true)}>
            <X size={20} color={Colors.danger} />
          </TouchableOpacity>
          <View style={styles.pulseContainer}>
            <PulseRing delay={0}   width={220} height={92} />
            <PulseRing delay={300} width={220} height={92} />
            <PulseRing delay={600} width={220} height={92} />
            <Image source={centreImage} style={styles.centreImage} />
          </View>
          <Text style={styles.heroTitle}>{title}{searchDots}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📍 YOUR ROUTE</Text>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
              <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={1}>{pickup?.address ?? '—'}</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
              <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={1}>{drop?.address ?? '—'}</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => showComingSoon('Call Driver')} activeOpacity={0.8}>
              <Image source={require('../../assets/images/icon-call.png')} style={styles.actionImage} />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => showComingSoon('Message Driver')} activeOpacity={0.8}>
              <Image source={require('../../assets/images/icon-message.png')} style={styles.actionImage} />
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => showComingSoon('SOS Emergency')} activeOpacity={0.8}>
              <Image source={require('../../assets/images/icon-sos.png')} style={styles.actionImage} />
              <Text style={[styles.actionLabel, { color: Colors.danger }]}>SOS</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.safetyBanner}>
            <Shield size={16} color={Colors.primary} />
            <Text style={styles.safetyText}>Your trip is covered under Vahan360 safety policy</Text>
          </View>

          <Button label="Cancel Booking" onPress={() => setShowCancelSheet(true)} variant="outline" style={styles.cancelBtn} />
        </ScrollView>

        {/* Cancel bottom sheet (during searching) */}
        <Modal visible={showCancelSheet} transparent animationType="slide">
          <View style={styles.sheetOverlay}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>Why are you cancelling?</Text>
              <Text style={styles.sheetSubtitle}>Help us improve by selecting a reason</Text>
              {CANCEL_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonRow, selectedReason === reason && styles.reasonRowActive]}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.reasonRadio, selectedReason === reason && styles.reasonRadioActive]}>
                    {selectedReason === reason && <View style={styles.reasonRadioInner} />}
                  </View>
                  <Text style={[styles.reasonText, { color: colors.textPrimary }]}>{reason}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.sheetActions}>
                <TouchableOpacity
                  style={styles.sheetCancelBtn}
                  onPress={() => { setShowCancelSheet(false); setSelectedReason(null); }}
                >
                  <Text style={styles.sheetCancelText}>Keep Searching</Text>
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
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1 },
  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', marginBottom: 16,
  },
  closeBtn: {
    alignSelf: 'flex-end', width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFD6B3',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  pulseContainer: { width: 260, height: 130, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  ring: { position: 'absolute', borderWidth: 2, borderColor: '#FFD6B3' },
  centreImage: { width: 210, height: 86, resizeMode: 'contain' },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5, textAlign: 'center' },
  heroSubtitle: { fontSize: 13, color: '#666', fontWeight: '500', marginTop: 4, textAlign: 'center' },

  // No driver state
  noDriverEmoji: { fontSize: 56, marginBottom: 12, marginTop: 8 },
  noDriverTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', letterSpacing: -0.3 },
  noDriverSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, lineHeight: 20, paddingHorizontal: 8 },

  content: { paddingHorizontal: 16, paddingBottom: 60, gap: 14 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.2, marginBottom: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeLine: { height: 1, backgroundColor: '#FFE8D6', marginLeft: 20 },
  routeText: { flex: 1, fontSize: 14, fontWeight: '500' },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 16,
    alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  actionImage: { width: 44, height: 44, resizeMode: 'contain' },
  actionLabel: { fontSize: 12, fontWeight: '700' },
  safetyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF0E6', borderRadius: 20, padding: 14,
    borderWidth: 1, borderColor: '#FFD6B3',
  },
  safetyText: { flex: 1, fontSize: 13, lineHeight: 18, color: '#7C4A00', fontWeight: '500' },
  cancelBtn: { width: '100%' },

  retryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary, borderRadius: 20, paddingVertical: 16,
    shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  retryBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },

  altVehicleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#FFE8D6',
  },
  altVehicleEmoji: { fontSize: 28 },
  altVehicleName: { fontSize: 15, fontWeight: '700' },
  altVehicleDesc: { fontSize: 12, marginTop: 2 },

  // Cancel sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 24, paddingBottom: 40,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  sheetSubtitle: { fontSize: 13, color: '#666', marginBottom: 20 },
  reasonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#FFE8D6',
  },
  reasonRowActive: { backgroundColor: '#FFF7F2', marginHorizontal: -24, paddingHorizontal: 24, borderRadius: 0 },
  reasonRadio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#D1D5DB',
    justifyContent: 'center', alignItems: 'center',
  },
  reasonRadioActive: { borderColor: Colors.primary },
  reasonRadioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  reasonText: { fontSize: 15, fontWeight: '500' },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  sheetCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 16,
    borderWidth: 1.5, borderColor: '#FFE8D6', alignItems: 'center',
  },
  sheetCancelText: { fontSize: 14, fontWeight: '700', color: '#666' },
  sheetConfirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 16,
    backgroundColor: Colors.danger, alignItems: 'center',
  },
  sheetConfirmBtnDisabled: { backgroundColor: '#FECACA' },
  sheetConfirmText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});