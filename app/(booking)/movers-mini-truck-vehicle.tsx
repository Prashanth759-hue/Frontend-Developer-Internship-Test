import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Clock, Check, Package2 } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';
import { MINI_TRUCK_VEHICLE_OPTIONS, HELPER_PRICE_PER_PERSON } from '../../constants/mockData';

const VEHICLE_IMAGES: Record<string, ImageSourcePropType> = {
  mini_truck: require('../../assets/images/icon-mini-truck.png'),
  truck: require('../../assets/images/truck.png'),
};

export default function MoversMiniTruckVehicleScreen() {
  const { colors } = useTheme();
  const { movingItemCount, helperCount, setSelectedVehicle, setEstimatedFare } = useBookingStore();
  const [selected, setSelected] = useState<string | null>(null);

  const helperCost = helperCount * HELPER_PRICE_PER_PERSON;

  const priced = MINI_TRUCK_VEHICLE_OPTIONS.map((v) => ({
    ...v,
    fare: v.baseFare + movingItemCount * v.perItemRate + helperCost,
  }));

  const selectedVehicleOption = priced.find((v) => v.id === selected) ?? null;

  const handleContinue = () => {
    if (!selectedVehicleOption) return;
    setSelectedVehicle(selectedVehicleOption.id);
    setEstimatedFare(selectedVehicleOption.fare);
    router.push('/(booking)/fare');
  };

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
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Choose Your Vehicle</Text>
              <Text style={styles.heroSubtitle}>Priced for your {movingItemCount} item{movingItemCount === 1 ? '' : 's'}</Text>
            </View>
          </View>
          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Package2 size={12} color="#FF6B00" />
              <Text style={styles.chipText}> {movingItemCount} items selected</Text>
            </View>
            {helperCount > 0 && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>🧑‍🤝‍🧑 {helperCount} helper{helperCount === 1 ? '' : 's'}</Text>
              </View>
            )}
          </View>
        </View>

        <FlatList
          data={priced}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = selected === item.id;
            return (
              <TouchableOpacity
                style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}
                onPress={() => setSelected(item.id)}
                accessibilityLabel={`Select ${item.name}, ₹${item.fare}, ETA ${item.eta}`}
                activeOpacity={0.85}
              >
                <Image
                  source={VEHICLE_IMAGES[item.icon] ?? VEHICLE_IMAGES.mini_truck}
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
                    <Text style={styles.etaText}>{item.eta} ETA</Text>
                  </View>
                </View>
                <View style={styles.fareArea}>
                  <Text style={[styles.fareText, isActive && styles.fareTextActive]}>₹{item.fare}</Text>
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
              <Button
                label={selectedVehicleOption ? `Confirm Vehicle · ₹${selectedVehicleOption.fare}` : 'Select a Vehicle'}
                onPress={handleContinue}
                disabled={!selectedVehicleOption}
                style={{ width: '100%' }}
                accessibilityLabel="Confirm selected vehicle"
              />
            </View>
          }
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1 },
  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 16,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#FFD6B3', justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: '#666', fontWeight: '500', marginTop: 2 },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },

  list: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },

  vehicleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 24, padding: 16,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  vehicleCardActive: { borderColor: Colors.primary, borderWidth: 2, backgroundColor: '#FFF7F2' },
  vehicleImage: { width: 72, height: 72, resizeMode: 'contain' },
  vehicleInfo: { flex: 1, gap: 3 },
  vehicleName: { fontSize: 16, fontWeight: '700' },
  vehicleDesc: { fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  capacityBadge: {
    backgroundColor: '#FFF0E6', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, marginRight: 6,
  },
  capacityBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  etaText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  fareArea: { alignItems: 'flex-end', gap: 8 },
  fareText: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  fareTextActive: { color: Colors.primary },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  footer: { paddingTop: 4, paddingBottom: 32, gap: 14 },
});