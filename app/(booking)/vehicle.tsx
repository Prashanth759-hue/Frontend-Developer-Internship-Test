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
import { ArrowLeft, Clock, Check } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Layout, BorderRadius, Shadow, Spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';
import { MOCK_VEHICLES } from '../../constants/mockData';

export default function VehicleScreen() {
  const { colors } = useTheme();
  const { pickup, drop, selectedVehicle, setSelectedVehicle, setEstimatedFare } = useBookingStore();
  const [selected, setSelected] = useState<string | null>(selectedVehicle);

  const handleSelect = (id: string, fare: number) => {
    setSelected(id);
    setSelectedVehicle(id);
    setEstimatedFare(fare);
  };

  const handleContinue = () => {
    router.push('/(booking)/fare');
  };

  const VEHICLE_IMAGES: Record<string, ImageSourcePropType> = {
    bike: require('../../assets/images/bike-rider.png'),
    auto: require('../../assets/images/auto.png'),
    car: require('../../assets/images/car.png'),
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color="#FF6B00" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Choose Vehicle</Text>
            <Text style={styles.heroSubtitle} numberOfLines={1}>
              {pickup?.address ?? '—'} → {drop?.address ?? '—'}
            </Text>
          </View>
        </View>

        {/* Route summary card */}
        <View style={styles.routeSummary}>
          <View style={styles.routeCol}>
            <View style={styles.routeDot} />
            <Text style={styles.routeAddr} numberOfLines={1}>{pickup?.address ?? '—'}</Text>
          </View>
          <View style={styles.routeDividerLine} />
          <View style={styles.routeCol}>
            <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
            <Text style={styles.routeAddr} numberOfLines={1}>{drop?.address ?? '—'}</Text>
          </View>
        </View>
        <View style={styles.chipsRow}>
          <View style={styles.chip}><Text style={styles.chipText}>🏍️ Fastest pickup</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}>💰 Best fare</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}>📍 Live tracking</Text></View>
        </View>
      </View>

      <FlatList
        data={MOCK_VEHICLES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isActive = selected === item.id;
          return (
            <TouchableOpacity
              style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}
              onPress={() => handleSelect(item.id, item.fare)}
              accessibilityLabel={`Select ${item.name}, ₹${item.fare}, ETA ${item.eta}`}
              activeOpacity={0.85}
            >
              <Image
                source={VEHICLE_IMAGES[item.icon] ?? VEHICLE_IMAGES.car}
                style={styles.vehicleImage}
              />

              <View style={styles.vehicleInfo}>
                <Text style={[styles.vehicleName, { color: colors.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.vehicleDesc, { color: colors.textSecondary }]}>{item.description}</Text>
                <View style={styles.etaRow}>
                  <Clock size={12} color={Colors.primary} />
                  <Text style={styles.etaText}>{item.eta}</Text>
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
              label="Confirm Vehicle"
              onPress={handleContinue}
              disabled={!selected}
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
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  backgroundImage: {
    flex: 1,
  },

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
    marginBottom: 16,
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

  routeSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFD6B3',
    gap: 6,
  },

  routeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  routeDividerLine: {
    height: 1,
    backgroundColor: '#FFE8D6',
    marginLeft: 18,
  },

  routeAddr: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#444',
  },

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

  vehicleInfo: {
    flex: 1,
    gap: 3,
  },

  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
  },

  vehicleDesc: {
    fontSize: 12,
  },

  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },

  etaText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },

  fareArea: {
    alignItems: 'flex-end',
    gap: 8,
  },

  fareText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },

  fareTextActive: {
    color: Colors.primary,
  },

  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  footer: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 10 },
  chip: { backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },
});