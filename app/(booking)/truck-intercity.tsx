import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Image,
  TextInput,
  ScrollView,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { ArrowLeft, Clock, Check, MapPin, Circle, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';
import { useMapPickerStore } from '../../store/mapPickerStore';
import LocationSearchInput from '../../components/booking/LocationSearchInput';
import { INTERCITY_TRUCK_VEHICLES } from '../../constants/mockData';

const TRUCK_IMAGES: Record<string, ImageSourcePropType> = {
  mini_truck: require('../../assets/images/icon-mini-truck.png'),
  truck: require('../../assets/images/truck.png'),
};

const POPULAR_ROUTES = [
  { from: 'Bengaluru', to: 'Mysuru', distance: '145 km' },
  { from: 'Bengaluru', to: 'Chennai', distance: '350 km' },
  { from: 'Bengaluru', to: 'Hyderabad', distance: '570 km' },
  { from: 'Bengaluru', to: 'Pune', distance: '840 km' },
];

export default function TruckIntercityScreen() {
  const { colors } = useTheme();
  const { setSelectedVehicle, setEstimatedFare, setPickup, setDrop } = useBookingStore();
  const { result: mapResult, clearResult } = useMapPickerStore();

  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      if (mapResult) {
        if (mapResult.fieldKey === 'from') setFromCity(mapResult.address);
        else if (mapResult.fieldKey === 'to') setToCity(mapResult.address);
        clearResult();
      }
    }, [mapResult])
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [step, setStep] = useState<'route' | 'vehicle'>('route');

  const selectedTruck = INTERCITY_TRUCK_VEHICLES.find((v) => v.id === selectedVehicleId) ?? null;

  const canProceedRoute = fromCity.trim().length > 1 && toCity.trim().length > 1;

  const handleRouteConfirm = () => {
    setPickup({ label: fromCity.trim(), address: fromCity.trim() });
    setDrop({ label: toCity.trim(), address: toCity.trim() });
    setStep('vehicle');
  };

  const handlePopularRoute = (route: (typeof POPULAR_ROUTES)[number]) => {
    setFromCity(route.from);
    setToCity(route.to);
  };

  const handleContinue = () => {
    if (!selectedTruck) return;
    setSelectedVehicle(selectedTruck.id);
    setEstimatedFare(selectedTruck.baseFare);
    router.push('/(booking)/pickup');
  };

  if (step === 'vehicle') {
    return (
      <ImageBackground
        source={require('../../assets/images/home-bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safe}>
          {/* Header */}
          <View style={styles.heroHeader}>
            <View style={styles.heroTopRow}>
              <TouchableOpacity onPress={() => setStep('route')} style={styles.backBtn}>
                <ArrowLeft size={20} color="#FF6B00" />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>Choose Vehicle</Text>
                <Text style={styles.heroSubtitle}>
                  {fromCity} → {toCity}
                </Text>
              </View>
            </View>
            <View style={styles.chipsRow}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>🚚 Fare includes fuel & tolls</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>🔒 Insured cargo</Text>
              </View>
            </View>
          </View>

          <FlatList
            data={INTERCITY_TRUCK_VEHICLES}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isActive = selectedVehicleId === item.id;
              return (
                <TouchableOpacity
                  style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}
                  onPress={() => setSelectedVehicleId(item.id)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={TRUCK_IMAGES[item.icon] ?? TRUCK_IMAGES.mini_truck}
                    style={styles.vehicleImage}
                  />
                  <View style={styles.vehicleInfo}>
                    <Text style={[styles.vehicleName, { color: colors.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.vehicleDesc, { color: colors.textSecondary }]}>{item.description}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.capacityBadge}>
                        <Text style={styles.capacityBadgeText}>{item.capacity}</Text>
                      </View>
                      <Clock size={12} color={Colors.primary} />
                      <Text style={styles.etaText}>{item.eta}</Text>
                    </View>
                    <Text style={[styles.perKmText, { color: colors.textSecondary }]}>
                      ₹{item.perKmRate}/km · Base ₹{item.baseFare}
                    </Text>
                  </View>
                  <View style={styles.fareArea}>
                    <Text style={[styles.fareText, isActive && styles.fareTextActive]}>
                      ₹{item.baseFare}
                    </Text>
                    <Text style={styles.fareNote}>starting</Text>
                    {isActive && (
                      <View style={styles.checkCircle}>
                        <Check size={12} color={Colors.white} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListFooterComponent={
              <View style={styles.footer}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardLabel}>ℹ️ HOW INTERCITY PRICING WORKS</Text>
                  <Text style={[styles.infoCardText, { color: colors.textSecondary }]}>
                    You pay a base fare + per-km rate for the actual distance. Final fare is confirmed after the trip. Tolls, fuel & driver night allowance are included.
                  </Text>
                </View>
                <Button
                  label={selectedTruck ? `Confirm · From ₹${selectedTruck.baseFare}` : 'Select a Vehicle'}
                  onPress={handleContinue}
                  disabled={!selectedTruck}
                  style={{ width: '100%' }}
                  accessibilityLabel="Confirm selected truck"
                />
              </View>
            }
          />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  // Step: route selection
  return (
    <ImageBackground
      source={require('../../assets/images/home-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Inter City Truck</Text>
              <Text style={styles.heroSubtitle}>City to city goods transport</Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Route Input Card */}
          <View style={[styles.routeCard, { zIndex: 20 }]}>
            <Text style={styles.cardLabel}>📍 YOUR ROUTE</Text>
            <LocationSearchInput
              value={fromCity}
              onChangeText={setFromCity}
              onSelect={setFromCity}
              placeholder="From city  (e.g. Bengaluru)"
              dotType="circle"
              dotColor={Colors.primary}
              fieldKey="from"
            />
            <View style={styles.routeDivider} />
            <LocationSearchInput
              value={toCity}
              onChangeText={setToCity}
              onSelect={setToCity}
              placeholder="To city  (e.g. Chennai)"
              dotType="pin"
              dotColor={Colors.primary}
              fieldKey="to"
            />
          </View>

          {/* Popular Routes */}
          <Text style={styles.sectionTitle}>🔥 Popular Routes</Text>
          {POPULAR_ROUTES.map((route) => (
            <TouchableOpacity
              key={`${route.from}-${route.to}`}
              style={styles.popularRouteCard}
              onPress={() => handlePopularRoute(route)}
              activeOpacity={0.8}
            >
              <View style={styles.popularRouteInfo}>
                <Text style={[styles.popularRouteName, { color: colors.textPrimary }]}>
                  {route.from} → {route.to}
                </Text>
                <Text style={[styles.popularRouteDistance, { color: colors.textSecondary }]}>
                  {route.distance}
                </Text>
              </View>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          ))}

          <View style={{ height: 16 }} />
          <Button
            label="View Available Trucks"
            onPress={handleRouteConfirm}
            disabled={!canProceedRoute}
            style={{ width: '100%' }}
          />
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1 },

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

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 8,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFD6B3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF6B00',
    letterSpacing: -0.5,
  },

  heroSubtitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
  },

  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },

  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B00',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FFE8D6',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 20,
  },

  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  routeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },

  routeInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 8,
  },

  routeDivider: {
    height: 1,
    backgroundColor: '#FFE8D6',
    marginVertical: 4,
    marginLeft: 20,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },

  popularRouteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFE8D6',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  popularRouteInfo: { flex: 1, gap: 2 },

  popularRouteName: {
    fontSize: 14,
    fontWeight: '700',
  },

  popularRouteDistance: {
    fontSize: 12,
  },

  // Vehicle selection step
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },

  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFE8D6',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  vehicleCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: '#FFF7F2',
  },

  vehicleImage: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
  },

  vehicleInfo: { flex: 1, gap: 3 },

  vehicleName: { fontSize: 16, fontWeight: '700' },

  vehicleDesc: { fontSize: 12 },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    flexWrap: 'wrap',
  },

  capacityBadge: {
    backgroundColor: '#FFF0E6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },

  capacityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },

  etaText: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  perKmText: { fontSize: 11, marginTop: 2 },

  fareArea: { alignItems: 'flex-end', gap: 4 },

  fareText: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },

  fareTextActive: { color: Colors.primary },

  fareNote: { fontSize: 10, color: '#9CA3AF', fontWeight: '600' },

  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  footer: { paddingTop: 4, paddingBottom: 32, gap: 14 },

  infoCard: {
    backgroundColor: '#FFF7F2',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE8D6',
    gap: 6,
  },

  infoCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
  },

  infoCardText: { fontSize: 12, lineHeight: 18 },
});
