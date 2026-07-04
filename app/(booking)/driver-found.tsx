import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ImageBackground, Image, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Phone, MessageCircle, X, MapPin, Shield, Star, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useBookingStore } from '../../store/bookingStore';
import { useComingSoon } from '../../components/common/ComingSoonModal';
import { Button } from '../../components/common/Button';
import { MOCK_DRIVERS } from '../../constants/mockData';

function getDriverForService(serviceType: string | null) {
  switch (serviceType) {
    case 'heavy_cargo':
      return MOCK_DRIVERS.find((d) => d.icon === 'truck') ?? MOCK_DRIVERS[3];
    case 'packers_movers':
      return MOCK_DRIVERS.find((d) => d.icon === 'packers_movers') ?? MOCK_DRIVERS[4];
    case 'auto':
      return MOCK_DRIVERS.find((d) => d.icon === 'auto') ?? MOCK_DRIVERS[1];
    case 'car':
      return MOCK_DRIVERS.find((d) => d.icon === 'car') ?? MOCK_DRIVERS[2];
    default:
      return MOCK_DRIVERS[0];
  }
}

const VEHICLE_IMAGES: Record<string, any> = {
  bike:           require('../../assets/images/bike-rider.png'),
  auto:           require('../../assets/images/auto.png'),
  car:            require('../../assets/images/car.png'),
  truck:          require('../../assets/images/truck.png'),
  packers_movers: require('../../assets/images/truck.png'),
};

const ETA_EMOJI: Record<string, string> = {
  bike:           '🏍️',
  auto:           '🛺',
  car:            '🚗',
  truck:          '🚛',
  packers_movers: '🚚',
};

export default function DriverFoundScreen() {
  const { colors } = useTheme();
  const { show: showComingSoon, modal } = useComingSoon();
  const { pickup, drop, resetBooking, serviceType } = useBookingStore();

  const driver = getDriverForService(serviceType);

  const handleCancel = () => {
    Alert.alert('Cancel Booking', 'Cancel this booking?', [
      { text: 'Keep It', style: 'cancel' },
      {
        text: 'Cancel', style: 'destructive',
        onPress: () => { resetBooking(); router.replace('/(main)/home'); },
      },
    ]);
  };

  const handleTripDone = () => {
    router.replace('/(booking)/rate-trip');
  };

  const emoji = ETA_EMOJI[driver.icon] ?? '🏍️';
  const foundLabel = serviceType === 'packers_movers' ? '✅ Moving Team Found!' : '✅ Driver Found!';

  return (
    <ImageBackground
      source={require('../../assets/images/home-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {modal}

        {/* Hero: Driver Card */}
        <View style={styles.heroHeader}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleCancel}>
            <X size={20} color={Colors.danger} />
          </TouchableOpacity>

          <View style={styles.foundBadge}>
            <Text style={styles.foundBadgeText}>{foundLabel}</Text>
          </View>

          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>
                {driver.name.charAt(0)}
              </Text>
            </View>

            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driver.name}</Text>
              <View style={styles.ratingRow}>
                <Star size={13} color="#FF6B00" fill="#FF6B00" />
                <Text style={styles.ratingText}>{driver.rating}</Text>
                <Text style={styles.ridesText}>· {driver.totalRides} rides</Text>
              </View>
              <Text style={styles.vehicleText}>
                {driver.vehicle} · {driver.vehicleNumber}
              </Text>
            </View>

            <Image
              source={VEHICLE_IMAGES[driver.icon] ?? VEHICLE_IMAGES.bike}
              style={styles.vehicleImage}
            />
          </View>

          <View style={styles.etaChip}>
            <Text style={styles.etaChipText}>{emoji} Arriving in {driver.eta}</Text>
          </View>
        </View>

        {/* Scrollable content — prevents Cancel button clipping at large font sizes */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Route */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📍 YOUR ROUTE</Text>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
              <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={1}>
                {pickup?.address ?? '—'}
              </Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
              <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={1}>
                {drop?.address ?? '—'}
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => showComingSoon('Call Driver')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconWrap}>
                <Phone size={20} color={Colors.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => showComingSoon('Message Driver')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconWrap}>
                <MessageCircle size={20} color={Colors.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => showComingSoon('Share Trip')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconWrap}>
                <MapPin size={20} color={Colors.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Share Trip</Text>
            </TouchableOpacity>
          </View>

          {/* Safety */}
          <View style={styles.safetyBanner}>
            <Shield size={16} color={Colors.primary} />
            <Text style={styles.safetyText}>
              Your trip is covered under Vahan360 safety policy
            </Text>
          </View>

          {/* Track Live */}
          <Button
            label="Track Ride Live →"
            onPress={() => router.push('/(booking)/live-tracking')}
            style={styles.fullBtn}
          />

          {/* Simulate trip end */}
          <Button
            label="Simulate Trip Completed →"
            onPress={handleTripDone}
            style={styles.fullBtn}
            variant="outline"
          />

          <Button
            label="Cancel Booking"
            onPress={handleCancel}
            variant="outline"
            style={styles.fullBtn}
          />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 16, gap: 12,
  },
  closeBtn: {
    alignSelf: 'flex-end', width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFD6B3',
    justifyContent: 'center', alignItems: 'center',
  },
  foundBadge: {
    alignSelf: 'center', backgroundColor: '#ECFDF5',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#6EE7B7',
  },
  foundBadgeText: { fontSize: 14, fontWeight: '700', color: '#059669' },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  driverAvatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#FF6B00',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFF',
  },
  driverAvatarText: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  driverInfo: { flex: 1, gap: 3 },
  driverName: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#FF6B00' },
  ridesText: { fontSize: 12, color: '#666' },
  vehicleText: { fontSize: 12, color: '#555', fontWeight: '500' },
  vehicleImage: { width: 70, height: 70, resizeMode: 'contain' },
  etaChip: {
    alignSelf: 'center', backgroundColor: '#FFF0E6', paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#FFD6B3',
  },
  etaChipText: { fontSize: 13, fontWeight: '700', color: '#FF6B00' },
  content: { paddingHorizontal: 16, paddingBottom: 60, gap: 12 },
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
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 14,
    alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  actionIconWrap: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF0E6',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#FFD6B3',
  },
  actionLabel: { fontSize: 12, fontWeight: '700' },
  safetyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF0E6', borderRadius: 20, padding: 14,
    borderWidth: 1, borderColor: '#FFD6B3',
  },
  safetyText: { flex: 1, fontSize: 13, lineHeight: 18, color: '#7C4A00', fontWeight: '500' },
  fullBtn: { width: '100%' },
});