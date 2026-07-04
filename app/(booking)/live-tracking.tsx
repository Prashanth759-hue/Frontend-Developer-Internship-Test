import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ImageBackground, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Phone, MessageCircle, X, MapPin, Shield,
  Star, Navigation, Clock, ChevronRight, CheckCircle,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useBookingStore } from '../../store/bookingStore';
import { useComingSoon } from '../../components/common/ComingSoonModal';
import { MOCK_DRIVERS } from '../../constants/mockData';

function getDriverForService(serviceType: string | null) {
  switch (serviceType) {
    case 'heavy_cargo': return MOCK_DRIVERS.find((d) => d.icon === 'truck') ?? MOCK_DRIVERS[3];
    case 'packers_movers': return MOCK_DRIVERS.find((d) => d.icon === 'packers_movers') ?? MOCK_DRIVERS[4];
    case 'auto': return MOCK_DRIVERS.find((d) => d.icon === 'auto') ?? MOCK_DRIVERS[1];
    case 'car': return MOCK_DRIVERS.find((d) => d.icon === 'car') ?? MOCK_DRIVERS[2];
    default: return MOCK_DRIVERS[0];
  }
}

const TRIP_STEPS = [
  { key: 'assigned', label: 'Driver Assigned', done: true },
  { key: 'arriving', label: 'Driver Arriving', done: true },
  { key: 'picked_up', label: 'Picked Up', done: false },
  { key: 'en_route', label: 'En Route', done: false },
  { key: 'dropped', label: 'Dropped', done: false },
];

export default function LiveTrackingScreen() {
  const { colors } = useTheme();
  const { show: showComingSoon, modal } = useComingSoon();
  const { pickup, drop, resetBooking, serviceType, estimatedFare, paymentMode } = useBookingStore();

  const driver = getDriverForService(serviceType);
  const [etaMin, setEtaMin] = useState(8);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setEtaMin((prev) => (prev > 1 ? prev - 1 : 1));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel?', [
      { text: 'Keep Ride', style: 'cancel' },
      {
        text: 'Cancel Ride', style: 'destructive',
        onPress: () => { resetBooking(); router.replace('/(main)/home'); },
      },
    ]);
  };

  const handleTripDone = () => {
    router.replace('/(booking)/rate-trip');
  };

  const paymentLabel = paymentMode === 'cash' ? 'Cash' : paymentMode === 'wallet' ? 'Vahan Pay' : 'UPI';

  return (
    <ImageBackground
      source={require('../../assets/images/home-bg.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {modal}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.liveDot} />
            <Text style={styles.headerTitle}>Live Tracking</Text>
          </View>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
            <X size={18} color={Colors.danger} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Map Placeholder */}
          <View style={styles.mapCard}>
            <View style={styles.mapPlaceholder}>
              <Navigation size={32} color={Colors.primary} />
              <Text style={styles.mapLabel}>Live Map</Text>
              <Text style={styles.mapSub}>Driver location updates in real-time</Text>
              <TouchableOpacity
                style={styles.openMapBtn}
                onPress={() => showComingSoon('Full Map View')}
              >
                <Text style={styles.openMapText}>Open Full Map</Text>
                <ChevronRight size={14} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Route overlay */}
            <View style={styles.routeOverlay}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.routeText} numberOfLines={1}>
                  {pickup?.label ?? 'Pickup'}
                </Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
                <Text style={styles.routeText} numberOfLines={1}>
                  {drop?.label ?? 'Drop'}
                </Text>
              </View>
            </View>
          </View>

          {/* ETA Banner */}
          <View style={styles.etaBanner}>
            <View style={styles.etaLeft}>
              <Clock size={20} color={Colors.primary} />
              <View>
                <Text style={styles.etaValue}>{etaMin} min away</Text>
                <Text style={styles.etaSub}>Estimated arrival at pickup</Text>
              </View>
            </View>
            <View style={styles.etaBadge}>
              <Text style={styles.etaBadgeText}>ON THE WAY</Text>
            </View>
          </View>

          {/* Trip Progress */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🗺️ TRIP STATUS</Text>
            <View style={styles.stepsRow}>
              {TRIP_STEPS.map((step, idx) => {
                const active = idx === currentStep;
                const done = idx < currentStep;
                return (
                  <View key={step.key} style={styles.stepItem}>
                    <View style={[
                      styles.stepDot,
                      done && styles.stepDotDone,
                      active && styles.stepDotActive,
                    ]}>
                      {done && <CheckCircle size={14} color="#fff" />}
                      {active && <View style={styles.stepDotInner} />}
                    </View>
                    {idx < TRIP_STEPS.length - 1 && (
                      <View style={[styles.stepConnector, done && styles.stepConnectorDone]} />
                    )}
                    <Text style={[
                      styles.stepLabel,
                      done && styles.stepLabelDone,
                      active && styles.stepLabelActive,
                    ]}>{step.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Driver Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>👤 YOUR DRIVER</Text>
            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverAvatarText}>
                  {(driver.name ?? 'D').charAt(0)}
                </Text>
              </View>
              <View style={styles.driverInfo}>
                <Text style={[styles.driverName, { color: colors.textPrimary }]}>
                  {driver.name ?? 'Driver'}
                </Text>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s} size={12}
                      color={Colors.primary}
                      fill={s <= Math.round(driver.rating ?? 4) ? Colors.primary : 'transparent'}
                    />
                  ))}
                  <Text style={styles.ratingText}>{driver.rating ?? '4.8'}</Text>
                </View>
                <Text style={styles.vehicleNum}>{driver.vehicleNumber ?? 'KA 01 AB 1234'}</Text>
              </View>
              <View style={styles.driverActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => showComingSoon('Call Driver')}
                >
                  <Phone size={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => showComingSoon('Message Driver')}
                >
                  <MessageCircle size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Fare Summary */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>💳 FARE & PAYMENT</Text>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Estimated Fare</Text>
              <Text style={styles.fareValue}>
                ₹{estimatedFare > 0 ? estimatedFare : 72}
              </Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Payment Method</Text>
              <View style={styles.payBadge}>
                <Text style={styles.payBadgeText}>{paymentLabel}</Text>
              </View>
            </View>
          </View>

          {/* Safety */}
          <View style={styles.safetyCard}>
            <Shield size={16} color="#16A34A" />
            <Text style={styles.safetyText}>
              Your ride is covered under Vahan360 safety policy. Share trip with emergency contacts.
            </Text>
            <TouchableOpacity onPress={() => showComingSoon('Emergency SOS')}>
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
          </View>

          {/* Simulate trip done */}
          <TouchableOpacity style={styles.doneBanner} onPress={handleTripDone}>
            <CheckCircle size={18} color="#16A34A" />
            <Text style={styles.doneText}>Simulate Trip Completed</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    marginBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  liveDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E', shadowOpacity: 0.8, shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 }, elevation: 4,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FF6B00' },
  cancelBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FFCDD2',
    justifyContent: 'center', alignItems: 'center',
  },

  content: { paddingHorizontal: 16, paddingBottom: 80, gap: 12 },

  mapCard: {
    backgroundColor: '#FFF', borderRadius: 24, overflow: 'hidden',
    borderWidth: 1.5, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  mapPlaceholder: {
    height: 180, backgroundColor: '#F0F9FF',
    justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  mapLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginTop: 4 },
  mapSub: { fontSize: 12, color: '#666' },
  openMapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 8, backgroundColor: '#FFF0E6',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#FFD6B3',
  },
  openMapText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  routeOverlay: {
    padding: 14, gap: 6,
    borderTopWidth: 1, borderTopColor: '#FFE8D6',
  },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', flex: 1 },
  routeLine: { width: 2, height: 12, backgroundColor: '#FFE8D6', marginLeft: 4 },

  etaBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF7F2', borderRadius: 20, padding: 16,
    borderWidth: 1.5, borderColor: '#FFD6B3',
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  etaLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  etaValue: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  etaSub: { fontSize: 12, color: '#666', marginTop: 2 },
  etaBadge: {
    backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#BBF7D0',
  },
  etaBadgeText: { fontSize: 11, fontWeight: '800', color: '#16A34A', letterSpacing: 0.5 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18,
    borderWidth: 1.5, borderColor: '#FFE8D6', gap: 14,
    shadowColor: '#FF6B00', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.2 },

  stepsRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  stepItem: { alignItems: 'center', flex: 1, position: 'relative' },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#E5E7EB',
  },
  stepDotDone: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  stepDotActive: { backgroundColor: '#FFF', borderColor: Colors.primary },
  stepDotInner: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary,
  },
  stepConnector: {
    position: 'absolute', top: 14, left: '50%', right: '-50%',
    height: 2, backgroundColor: '#E5E7EB',
  },
  stepConnectorDone: { backgroundColor: '#22C55E' },
  stepLabel: { fontSize: 9, color: '#9CA3AF', textAlign: 'center', marginTop: 6, fontWeight: '600' },
  stepLabelDone: { color: '#22C55E' },
  stepLabelActive: { color: Colors.primary },

  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  driverAvatar: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  driverAvatarText: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  driverInfo: { flex: 1, gap: 4 },
  driverName: { fontSize: 16, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 12, color: '#666', marginLeft: 4 },
  vehicleNum: { fontSize: 12, color: '#666' },
  driverActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#FFD6B3',
  },

  fareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fareLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  fareValue: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  payBadge: {
    backgroundColor: '#FFF0E6', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 14, borderWidth: 1, borderColor: '#FFD6B3',
  },
  payBadgeText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  safetyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F0FDF4', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  safetyText: { flex: 1, fontSize: 12, color: '#166534', lineHeight: 18 },
  sosText: { fontSize: 12, fontWeight: '800', color: Colors.danger },

  doneBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#DCFCE7', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  doneText: { fontSize: 14, fontWeight: '700', color: '#16A34A' },
});