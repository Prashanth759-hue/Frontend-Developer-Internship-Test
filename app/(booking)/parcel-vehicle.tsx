import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ImageBackground, Image, ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Clock, Check, Info } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';
import { getParcelVehicleOptions } from '../../constants/mockData';
import HOME_BG from '../../assets/bg/homeBg';

const VEHICLE_IMAGES: Record<string, ImageSourcePropType> = {
  bike:       require('../../assets/images/bike-rider.png'),
  scooty:     require('../../assets/images/parcel.png'),
  auto:       require('../../assets/images/auto.png'),
  mini_truck: require('../../assets/images/icon-mini-truck.png'),
};

const WEIGHT_LABELS: Record<string, string> = {
  under_5:  'Under 5 kg',
  '5_to_15':  '5 – 15 kg',
  '15_to_50': '15 – 50 kg',
  '50_plus':  '50+ kg',
};

const GOODS_LABELS: Record<string, string> = {
  documents: 'Documents', clothes: 'Clothes', electronics: 'Electronics',
  food: 'Food / Grocery', medicine: 'Medicine', fragile: 'Fragile Items',
  boxes: 'Boxes', furniture: 'Furniture', other: 'Other',
};

export default function ParcelVehicleScreen() {
  const { colors, isDark } = useTheme();
  const s = makeStyles(colors);
  const { pickup, drop, goodsDetails, setSelectedVehicle, setEstimatedFare } = useBookingStore();

  const category    = goodsDetails?.category    ?? 'other';
  const weightRange = goodsDetails?.weight      ?? 'under_5';
  const qty         = goodsDetails?.qty         ?? '1_3';

  const vehicles = useMemo(
    () => getParcelVehicleOptions(category, weightRange, qty),
    [category, weightRange, qty]
  );

  // Pre-select cheapest (first in list).
  const [selected, setSelected] = useState<string>(vehicles[0]?.id ?? '');
  const selectedVehicle = vehicles.find((v) => v.id === selected) ?? null;

  const handleContinue = () => {
    if (!selectedVehicle) return;
    setSelectedVehicle(selectedVehicle.id);
    setEstimatedFare(selectedVehicle.fare);
    router.push('/(booking)/fare');
  };

  const goodsLabel  = GOODS_LABELS[category]    ?? category;
  const weightLabel = WEIGHT_LABELS[weightRange] ?? weightRange;

  return (
    <ImageBackground source={HOME_BG} style={s.bg} resizeMode="cover">
      <SafeAreaView style={[s.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        {/* ── Hero ── */}
        <View style={s.hero}>
          <View style={s.heroRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.heroTitle}>Choose Vehicle</Text>
              <Text style={s.heroSub} numberOfLines={1}>
                {pickup?.address ?? '—'} → {drop?.address ?? '—'}
              </Text>
            </View>
          </View>

          {/* Goods summary pill */}
          <View style={s.goodsPill}>
            <Text style={s.goodsPillText}>
              📦 {goodsLabel} · {weightLabel}
            </Text>
          </View>
        </View>

        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            vehicles.length === 0 ? null : (
              <View style={s.infoCard}>
                <Info size={14} color="#F59E0B" />
                <Text style={s.infoText}>
                  Showing {vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'} suitable for your goods.
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => {
            const isActive = selected === item.id;
            return (
              <TouchableOpacity
                style={[s.row, isActive && s.rowActive]}
                onPress={() => setSelected(item.id)}
                accessibilityLabel={`Select ${item.name}, ₹${item.fare}, ${item.eta}`}
                activeOpacity={0.85}
              >
                <Image
                  source={VEHICLE_IMAGES[item.icon] ?? VEHICLE_IMAGES.bike}
                  style={s.vehicleImg}
                />
                <View style={s.info}>
                  <Text style={[s.vehicleName, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[s.vehicleDesc, { color: colors.textSecondary }]}>{item.description}</Text>
                  <View style={s.etaRow}>
                    <Clock size={11} color={colors.textSecondary} />
                    <Text style={[s.etaText, { color: colors.textSecondary }]}>{item.eta}</Text>
                  </View>
                </View>
                <View style={s.fareArea}>
                  <Text style={[s.fare, { color: colors.textPrimary }]}>₹{item.fare}</Text>
                  {isActive && (
                    <View style={s.checkCircle}>
                      <Check size={11} color={Colors.white} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <Text style={[s.emptyTitle, { color: colors.textPrimary }]}>No vehicles available</Text>
              <Text style={[s.emptySub, { color: colors.textSecondary }]}>
                Go back and adjust the goods weight or type.
              </Text>
              <TouchableOpacity onPress={() => router.back()} style={s.emptyBtn}>
                <Text style={s.emptyBtnText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            vehicles.length > 0 ? (
              <View style={s.footer}>
                <Button
                  label={selectedVehicle ? `Book ${selectedVehicle.name} · ₹${selectedVehicle.fare}` : 'Select a vehicle'}
                  onPress={handleContinue}
                  disabled={!selectedVehicle}
                  style={{ width: '100%' }}
                />
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  hero: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    backgroundColor: colors.surfaceElevated, marginBottom: 12,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSub: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  goodsPill: {
    alignSelf: 'flex-start', backgroundColor: colors.iconBg,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: colors.iconBorder,
  },
  goodsPillText: { fontSize: 12, fontWeight: '700', color: '#F59E0B' },

  list: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4, gap: 0 },

  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.iconBg, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: colors.iconBorder, marginBottom: 12,
  },
  infoText: { flex: 1, fontSize: 12, color: '#F59E0B', fontWeight: '600' },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, padding: 14,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.cardBorder,
  },
  rowActive: { borderColor: Colors.primary, borderWidth: 2, backgroundColor: colors.subtleBg ?? colors.iconBg },
  vehicleImg: { width: 52, height: 52, resizeMode: 'contain' },
  info: { flex: 1, gap: 2 },
  vehicleName: { fontSize: 15, fontWeight: '800' },
  vehicleDesc: { fontSize: 12, fontWeight: '500' },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  etaText: { fontSize: 11, fontWeight: '600' },
  fareArea: { alignItems: 'flex-end', gap: 6 },
  fare: { fontSize: 17, fontWeight: '800' },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  footer: { paddingTop: 16, paddingBottom: 32 },
  emptyBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '800' },
  emptySub: { fontSize: 13, textAlign: 'center' },
  emptyBtn: {
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
