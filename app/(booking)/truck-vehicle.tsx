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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Clock, Check, Minus, Plus, MapPin, Circle, ArrowUpDown } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';
import { TRUCK_VEHICLES, INTERCITY_TRUCK_VEHICLES, HELPER_PRICE_PER_PERSON, MAX_HELPERS } from '../../constants/mockData';
import HOME_BG from '../../assets/bg/homeBg';

const TRUCK_IMAGES: Record<string, ImageSourcePropType> = {
  mini_truck: require('../../assets/images/icon-mini-truck.png'),
  truck: require('../../assets/images/truck.png'),
};

// Porter-style dimension labels per vehicle
const VEHICLE_DIMENSIONS: Record<string, { length: string; width: string; height: string }> = {
  mini_truck:         { length: '7', width: '4', height: '5 FT' },
  pickup_8ft:         { length: '8', width: '5', height: '5 FT' },
  truck_14ft:         { length: '14', width: '7', height: '7 FT' },
  intercity_mini:     { length: '7', width: '4', height: '5 FT' },
  intercity_pickup:   { length: '8', width: '5', height: '5 FT' },
  intercity_truck14:  { length: '14', width: '7', height: '7 FT' },
  intercity_truck20:  { length: '20', width: '8', height: '8 FT' },
};

type VehicleItem = {
  id: string;
  name: string;
  description: string;
  capacity: string;
  eta: string;
  fare: number;
  icon: string;
};

export default function TruckVehicleScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const {
    setSelectedVehicle,
    setEstimatedFare,
    setHelperCount,
    pickup,
    drop,
    tripMode,
  } = useBookingStore();

  const [selected, setSelected] = useState<string | null>(null);
  const [helpers, setHelpers] = useState(0);

  const vehicles: VehicleItem[] =
    tripMode === 'inter_cities'
      ? INTERCITY_TRUCK_VEHICLES.map((v) => ({ ...v, fare: v.baseFare }))
      : TRUCK_VEHICLES;

  const selectedTruck = vehicles.find((v) => v.id === selected) ?? null;
  const helperCost = helpers * HELPER_PRICE_PER_PERSON;
  const totalFare = selectedTruck ? selectedTruck.fare + helperCost : 0;

  const handleContinue = () => {
    if (!selectedTruck) return;
    setSelectedVehicle(selectedTruck.id);
    setEstimatedFare(totalFare);
    setHelperCount(helpers);
    router.push('/(booking)/fare');
  };

  const dims = selected ? VEHICLE_DIMENSIONS[selected] : null;

  return (
    <ImageBackground source={HOME_BG} style={styles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
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
              <Text style={styles.heroTitle}>Select Vehicle</Text>
              <Text style={styles.heroSubtitle}>
                {tripMode === 'inter_cities' ? 'Intercity · Choose your truck' : 'Local · Choose your truck'}
              </Text>
            </View>
          </View>

          {/* Route summary card — Porter style */}
          <View style={styles.routeCard}>
            <View style={styles.routeRow}>
              <View style={styles.routeDot}>
                <View style={styles.dotGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.routeContactName, { color: colors.textSecondary }]}>
                  {pickup?.label ?? 'Pickup'}
                </Text>
                <Text style={[styles.routeAddress, { color: colors.textPrimary }]} numberOfLines={1}>
                  {pickup?.address ?? '—'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.swapBtn}
                onPress={() => {
                  // swap is visual only on this screen; actual store swap would need store action
                }}
                accessibilityLabel="Swap pickup and drop"
              >
                <ArrowUpDown size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.routeDivider} />

            <View style={styles.routeRow}>
              <View style={styles.routeDot}>
                <View style={styles.dotRed} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.routeContactName, { color: colors.textSecondary }]}>
                  {drop?.label ?? 'Drop'}
                </Text>
                <Text style={[styles.routeAddress, { color: colors.textPrimary }]} numberOfLines={1}>
                  {drop?.address ?? '—'}
                </Text>
              </View>
            </View>

            <View style={styles.routeActions}>
              <TouchableOpacity style={styles.routeActionBtn} onPress={() => router.back()}>
                <Text style={styles.routeActionText}>+ Add Stop</Text>
              </TouchableOpacity>
              <View style={styles.routeActionDivider} />
              <TouchableOpacity style={styles.routeActionBtn} onPress={() => router.back()}>
                <Text style={styles.routeActionText}>✏ Edit Locations</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = selected === item.id;
            const vdims = VEHICLE_DIMENSIONS[item.id];
            return (
              <TouchableOpacity
                style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}
                onPress={() => setSelected(item.id)}
                accessibilityLabel={`Select ${item.name}`}
                activeOpacity={0.85}
              >
                {/* When selected — show the Porter-style dimension view */}
                {isActive && vdims ? (
                  <View style={styles.dimensionBox}>
                    <Text style={styles.dimTop}>{vdims.length}</Text>
                    <Text style={styles.dimRight}>{vdims.width}</Text>
                    <Text style={styles.dimHeight}>{vdims.height}</Text>
                    <Image
                      source={TRUCK_IMAGES[item.icon] ?? TRUCK_IMAGES.mini_truck}
                      style={styles.vehicleImageLarge}
                    />
                  </View>
                ) : (
                  <Image
                    source={TRUCK_IMAGES[item.icon] ?? TRUCK_IMAGES.mini_truck}
                    style={styles.vehicleImage}
                  />
                )}

                <View style={styles.vehicleInfo}>
                  <View style={styles.vehicleNameRow}>
                    <Text style={[styles.vehicleName, { color: colors.textPrimary }]}>{item.name}</Text>
                    {isActive && (
                      <View style={styles.checkCircle}>
                        <Check size={12} color={Colors.white} />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.vehicleDesc, { color: colors.textSecondary }]}>{item.description}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.capacityBadge}>
                      <Text style={styles.capacityBadgeText}>{item.capacity}</Text>
                    </View>
                    <Clock size={12} color={Colors.primary} />
                    <Text style={styles.etaText}>{item.eta}</Text>
                  </View>
                </View>

                <Text style={[styles.fareText, isActive && styles.fareTextActive]}>
                  ₹{item.fare}
                </Text>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListFooterComponent={
            <View style={styles.footer}>
              {/* ── Helper Stepper ── */}
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
                    >
                      <Minus size={16} color={helpers === 0 ? colors.border : Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.stepperCount}>{helpers}</Text>
                    <TouchableOpacity
                      style={[styles.stepperBtn, helpers === MAX_HELPERS && styles.stepperBtnDisabled]}
                      onPress={() => setHelpers((h) => Math.min(MAX_HELPERS, h + 1))}
                      disabled={helpers === MAX_HELPERS}
                    >
                      <Plus size={16} color={helpers === MAX_HELPERS ? colors.border : Colors.primary} />
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
                label={selectedTruck ? `Proceed with ${selectedTruck.name}` : 'Select a Vehicle'}
                onPress={handleContinue}
                disabled={!selectedTruck}
                style={{ width: '100%' }}
              />
            </View>
          }
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1 },

  heroHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    marginBottom: 16,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.iconBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },

  // Porter-style route card
  routeCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  routeDot: { width: 24, alignItems: 'center' },
  dotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#22C55E' },
  dotRed: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#EF4444' },
  routeContactName: { fontSize: 11, fontWeight: '600', marginBottom: 1 },
  routeAddress: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  routeDivider: { height: 1, backgroundColor: colors.cardBorder, marginLeft: 48 },
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.iconBg,
    borderWidth: 1,
    borderColor: colors.iconBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  routeActionBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  routeActionText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  routeActionDivider: { width: 1, backgroundColor: colors.cardBorder },

  list: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },

  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 24,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    shadowColor: '#FF6B00',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  vehicleCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: colors.subtleBg,
  },
  vehicleImage: { width: 72, height: 72, resizeMode: 'contain' },

  // Porter dimension box shown when selected
  dimensionBox: {
    width: 100,
    height: 80,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleImageLarge: { width: 80, height: 64, resizeMode: 'contain' },
  dimTop: {
    position: 'absolute',
    top: 0,
    left: '50%',
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    transform: [{ translateX: -6 }],
  },
  dimRight: {
    position: 'absolute',
    right: 0,
    top: '30%',
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  dimHeight: {
    position: 'absolute',
    left: 0,
    top: '40%',
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },

  vehicleInfo: { flex: 1, gap: 3 },
  vehicleNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vehicleName: { fontSize: 16, fontWeight: '700' },
  vehicleDesc: { fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  capacityBadge: {
    backgroundColor: colors.iconBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  capacityBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  etaText: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  fareText: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  fareTextActive: { color: Colors.primary },

  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  footer: { paddingTop: 4, paddingBottom: 32, gap: 14 },

  helperCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    color: colors.placeholder,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  helperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  helperImage: { width: 48, height: 48, resizeMode: 'contain' },
  helperInfo: { flex: 1, gap: 2 },
  helperTitle: { fontSize: 14, fontWeight: '700' },
  helperSubtitle: { fontSize: 12, fontWeight: '500' },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.subtleBg,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.iconBorder,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.iconBorder,
  },
  stepperBtnDisabled: { opacity: 0.5 },
  stepperCount: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    minWidth: 16,
    textAlign: 'center',
  },
  helperCostNote: { fontSize: 12, fontWeight: '600', color: Colors.primary, marginTop: 2 },
});