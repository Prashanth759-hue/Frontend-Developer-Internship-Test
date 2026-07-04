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
import { ArrowLeft, Clock, Check, Minus, Plus } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';
import { TRUCK_VEHICLES, HELPER_PRICE_PER_PERSON, MAX_HELPERS } from '../../constants/mockData';

const TRUCK_IMAGES: Record<string, ImageSourcePropType> = {
  mini_truck: require('../../assets/images/icon-mini-truck.png'),
  truck: require('../../assets/images/truck.png'),
};

export default function TruckVehicleScreen() {
  const { colors } = useTheme();
  const { setSelectedVehicle, setEstimatedFare, setHelperCount } = useBookingStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [helpers, setHelpers] = useState(0);

  const selectedTruck = TRUCK_VEHICLES.find((v) => v.id === selected) ?? null;
  const helperCost = helpers * HELPER_PRICE_PER_PERSON;
  const totalFare = selectedTruck ? selectedTruck.fare + helperCost : 0;

  const handleContinue = () => {
    if (!selectedTruck) return;
    setSelectedVehicle(selectedTruck.id);
    setEstimatedFare(totalFare);
    setHelperCount(helpers);
    router.push('/(booking)/schedule');
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
              <Text style={styles.heroTitle}>Choose Truck</Text>
              <Text style={styles.heroSubtitle}>Select a vehicle for your goods</Text>
            </View>
          </View>

          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>💡 Price includes fuel & tolls</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={TRUCK_VEHICLES}
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
              {/* ── Loading & Unloading Help ── */}
              <View style={styles.helperCard}>
                <Text style={styles.cardLabel}>🧑‍🤝‍🧑 LOADING & UNLOADING HELP</Text>
                <View style={styles.helperRow}>
                  <Image
                    source={require('../../assets/images/icon-handtruck.png')}
                    style={styles.helperImage}
                  />
                  <View style={styles.helperInfo}>
                    <Text style={[styles.helperTitle, { color: colors.textPrimary }]}>
                      Need help with loading?
                    </Text>
                    <Text style={[styles.helperSubtitle, { color: colors.textSecondary }]}>
                      ₹{HELPER_PRICE_PER_PERSON} per helper
                    </Text>
                  </View>

                  <View style={styles.stepper}>
                    <TouchableOpacity
                      style={[styles.stepperBtn, helpers === 0 && styles.stepperBtnDisabled]}
                      onPress={() => setHelpers((h) => Math.max(0, h - 1))}
                      disabled={helpers === 0}
                      accessibilityLabel="Remove a helper"
                    >
                      <Minus size={16} color={helpers === 0 ? '#C4C4C4' : Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.stepperCount}>{helpers}</Text>
                    <TouchableOpacity
                      style={[styles.stepperBtn, helpers === MAX_HELPERS && styles.stepperBtnDisabled]}
                      onPress={() => setHelpers((h) => Math.min(MAX_HELPERS, h + 1))}
                      disabled={helpers === MAX_HELPERS}
                      accessibilityLabel="Add a helper"
                    >
                      <Plus size={16} color={helpers === MAX_HELPERS ? '#C4C4C4' : Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {helpers > 0 && (
                  <Text style={styles.helperCostNote}>
                    Helper cost: ₹{helperCost} ({helpers} × ₹{HELPER_PRICE_PER_PERSON})
                  </Text>
                )}
              </View>

              <Button
                label={selectedTruck ? `Confirm Truck · ₹${totalFare}` : 'Confirm Truck'}
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

  chipsRow: {
    flexDirection: 'row',
    gap: 8,
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
    paddingTop: 4,
    paddingBottom: 32,
    gap: 14,
  },

  helperCard: {
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
    gap: 8,
  },

  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.2,
    marginBottom: 4,
  },

  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  helperImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },

  helperInfo: {
    flex: 1,
    gap: 2,
  },

  helperTitle: {
    fontSize: 14,
    fontWeight: '700',
  },

  helperSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF7F2',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FFD6B3',
  },

  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD6B3',
  },

  stepperBtnDisabled: {
    opacity: 0.5,
  },

  stepperCount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
    minWidth: 16,
    textAlign: 'center',
  },

  helperCostNote: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
});