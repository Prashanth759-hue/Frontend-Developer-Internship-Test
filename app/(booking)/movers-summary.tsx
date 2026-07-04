import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Circle, Calendar, Clock, Users, Package2, Info } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';
import { HELPER_PRICE_PER_PERSON, MINI_TRUCK_MOVERS_PRICING } from '../../constants/mockData';
import HOME_BG from '../../assets/bg/homeBg';

export default function MoversSummaryScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const {
    pickup, drop, scheduledSlot, packagingOption, goodsDetails, helperCount,
    movingItemCount, setSelectedVehicle, setEstimatedFare,
  } = useBookingStore();

  const weightNum = useMemo(() => {
    const parsed = parseFloat((goodsDetails?.weight ?? '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 100;
  }, [goodsDetails?.weight]);

  const baseFare = MINI_TRUCK_MOVERS_PRICING.baseFare;
  const weightFare = Math.round(weightNum * MINI_TRUCK_MOVERS_PRICING.perKgRate);
  const helperFare = helperCount * HELPER_PRICE_PER_PERSON;
  const packagingFare = packagingOption?.price ?? 0;
  const total = baseFare + weightFare + helperFare + packagingFare;

  const handleContinue = () => {
    setSelectedVehicle('mini_truck_movers');
    setEstimatedFare(total);
    router.push('/(booking)/fare');
  };

  return (
    <ImageBackground source={HOME_BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Order Summary</Text>
              <Text style={styles.heroSubtitle}>Review your mini truck booking</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ── About Mini Truck ── */}
          <View style={styles.truckCard}>
            <Image source={require('../../assets/images/icon-mini-truck.png')} style={styles.truckImage} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.truckName, { color: colors.textPrimary }]}>Mini Truck (Tata Ace)</Text>
              <Text style={[styles.truckDesc, { color: colors.textSecondary }]}>
                Open/closed mini truck · upto 750 kg · ideal for light household & office goods
              </Text>
            </View>
          </View>

          {/* ── Locations ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📍 LOCATIONS</Text>
            <View style={styles.locRow}>
              <Circle size={12} color={Colors.primary} fill={Colors.primary} />
              <Text style={[styles.locText, { color: colors.textPrimary }]} numberOfLines={2}>
                {pickup?.address ?? '—'}
              </Text>
            </View>
            <View style={styles.locDivider} />
            <View style={styles.locRow}>
              <MapPin size={14} color={Colors.danger} />
              <Text style={[styles.locText, { color: colors.textPrimary }]} numberOfLines={2}>
                {drop?.address ?? '—'}
              </Text>
            </View>
          </View>

          {/* ── Schedule ── */}
          {scheduledSlot && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🗓️ SCHEDULE</Text>
              <View style={styles.locRow}>
                <Calendar size={14} color={Colors.primary} />
                <Text style={[styles.locText, { color: colors.textPrimary }]}>{scheduledSlot.label}</Text>
              </View>
              {scheduledSlot.desc && (
                <View style={styles.locRow}>
                  <Clock size={14} color={Colors.primary} />
                  <Text style={[styles.locText, { color: colors.textPrimary }]}>{scheduledSlot.desc}</Text>
                </View>
              )}
              {packagingOption && packagingOption.price > 0 && (
                <View style={styles.locRow}>
                  <Package2 size={14} color={Colors.primary} />
                  <Text style={[styles.locText, { color: colors.textPrimary }]}>
                    {packagingOption.label} · +₹{packagingOption.price}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── Goods ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📦 GOODS DETAILS</Text>
            <View style={styles.locRow}>
              <Package2 size={14} color={Colors.primary} />
              <Text style={[styles.locText, { color: colors.textPrimary }]}>
                {goodsDetails?.category || 'Goods'} · {goodsDetails?.weight || `${weightNum} kg`}
              </Text>
            </View>
            {helperCount > 0 && (
              <View style={styles.locRow}>
                <Users size={14} color={Colors.primary} />
                <Text style={[styles.locText, { color: colors.textPrimary }]}>
                  {helperCount} helper{helperCount === 1 ? '' : 's'} for loading & unloading
                </Text>
              </View>
            )}
          </View>

          {/* ── Payment breakdown ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>💳 PAYMENT BREAKDOWN</Text>
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Base fare</Text>
              <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{baseFare}</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Goods charge (~{weightNum} kg)</Text>
              <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{weightFare}</Text>
            </View>
            {helperCount > 0 && (
              <View style={styles.fareRow}>
                <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
                  Helpers ({helperCount} × ₹{HELPER_PRICE_PER_PERSON})
                </Text>
                <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{helperFare}</Text>
              </View>
            )}
            {packagingFare > 0 && (
              <View style={styles.fareRow}>
                <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>{packagingOption?.label}</Text>
                <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{packagingFare}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.fareRow}>
              <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Estimated Total</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>
          </View>

          <View style={styles.infoBanner}>
            <Info size={15} color="#F59E0B" />
            <Text style={styles.infoText}>
              Final fare may vary slightly based on actual load and distance, confirmed at pickup.
            </Text>
          </View>

          <Button
            label={`Continue · ₹${total}`}
            onPress={handleContinue}
            style={{ width: '100%', marginTop: 4 }}
          />
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  safe: { flex: 1, backgroundColor: 'transparent' },
  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: colors.surfaceElevated, marginBottom: 16,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },

  content: { paddingHorizontal: 16, paddingBottom: 16, gap: 14 },

  truckCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderRadius: 24, padding: 16,
    borderWidth: 1.5, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  truckImage: { width: 64, height: 64, resizeMode: 'contain' },
  truckName: { fontSize: 15, fontWeight: '700' },
  truckDesc: { fontSize: 12, lineHeight: 17, marginTop: 2 },

  card: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4, gap: 8,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: colors.placeholder, letterSpacing: 1.2, marginBottom: 2 },

  locRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locText: { fontSize: 13, fontWeight: '600', flex: 1 },
  locDivider: { height: 1, backgroundColor: colors.cardBorder, marginLeft: 6, marginVertical: 2 },

  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  fareLabel: { fontSize: 13, flex: 1 },
  fareValue: { fontSize: 13, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: 6 },
  totalLabel: { fontSize: 15, fontWeight: '800' },
  totalValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },

  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 20,
    backgroundColor: colors.iconBg, borderWidth: 1, borderColor: colors.iconBorder,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18, color: '#F59E0B' },
});