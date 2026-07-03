import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Circle, MapPin, Truck, Clock, Package, User, Phone, Weight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { Button } from '../../components/common/Button';
import { AddressText } from '../../components/common/AddressText';
import { useBookingStore } from '../../store/bookingStore';
import { INTERCITY_TRUCK_VEHICLES, LONGTRIP_TRUCK_VEHICLES } from '../../constants/mockData';
import HOME_BG from '../../assets/bg/homeBg';

export default function ReviewBookingScreen() {
  const { colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const { pickup, drop, tripMode, selectedVehicle, scheduledSlot, packagingOption, goodsDetails, estimatedFare } =
    useBookingStore();

  const vehicleList = tripMode === 'long_trips' ? LONGTRIP_TRUCK_VEHICLES : INTERCITY_TRUCK_VEHICLES;
  const vehicle = vehicleList.find((v) => v.id === selectedVehicle) ?? null;

  const handleConfirm = () => {
    router.push('/(booking)/fare');
  };

  return (
    <ImageBackground
      source={HOME_BG}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
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
              <Text style={styles.heroTitle}>{t('confirm')}</Text>
              <Text style={styles.heroSubtitle}>{t('confirmVehicle')}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ── Route ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📍 ROUTE</Text>
            <View style={[styles.row, styles.rowWrap]}>
              <View style={[styles.iconWrap, styles.iconWrapTop]}>
                <Circle size={12} color={Colors.primary} fill={Colors.primary} />
              </View>
              <AddressText style={[styles.rowText, { color: colors.textPrimary }]}>
                {pickup?.address}
              </AddressText>
            </View>
            <View style={styles.divider} />
            <View style={[styles.row, styles.rowWrap]}>
              <View style={[styles.iconWrap, styles.iconWrapTop]}>
                <MapPin size={14} color={Colors.danger} fill={Colors.danger} />
              </View>
              <AddressText style={[styles.rowText, { color: colors.textPrimary }]}>
                {drop?.address}
              </AddressText>
            </View>
          </View>

          {/* ── Vehicle ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🚚 VEHICLE</Text>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Truck size={16} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                  {vehicle?.name ?? 'Selected truck'}
                </Text>
                {vehicle?.description && (
                  <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{vehicle.description}</Text>
                )}
              </View>
              {vehicle && (
                <Text style={styles.rowValue}>₹{vehicle.baseFare} base</Text>
              )}
            </View>
          </View>

          {/* ── Pickup Time ── */}
          {scheduledSlot && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🕐 PICKUP TIME</Text>
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <Clock size={16} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>{scheduledSlot.label}</Text>
                  {scheduledSlot.desc && (
                    <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{scheduledSlot.desc}</Text>
                  )}
                  {packagingOption && packagingOption.price > 0 && (
                    <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                      {packagingOption.label} · +₹{packagingOption.price}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* ── Sender & Receiver ── */}
          {goodsDetails && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>👤 SENDER & RECEIVER</Text>
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <User size={16} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                    {goodsDetails.senderName || '—'}
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.textSecondary }]}>Sender</Text>
                </View>
                <View style={styles.phoneWrap}>
                  <Phone size={12} color={Colors.primary} />
                  <Text style={styles.phoneText}>{goodsDetails.senderPhone || '—'}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <User size={16} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>
                    {goodsDetails.receiverName || '—'}
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.textSecondary }]}>Receiver</Text>
                </View>
                <View style={styles.phoneWrap}>
                  <Phone size={12} color={Colors.primary} />
                  <Text style={styles.phoneText}>{goodsDetails.receiverPhone || '—'}</Text>
                </View>
              </View>
            </View>
          )}

          {/* ── Goods ── */}
          {goodsDetails && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>📦 GOODS</Text>
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <Package size={16} color={Colors.primary} />
                </View>
                <Text style={[styles.rowText, { color: colors.textPrimary }]}>
                  {goodsDetails.category || '—'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <Weight size={16} color={Colors.primary} />
                </View>
                <Text style={[styles.rowText, { color: colors.textPrimary }]}>
                  {goodsDetails.weight || '—'}
                </Text>
              </View>
              {!!goodsDetails.description && (
                <>
                  <View style={styles.divider} />
                  <Text style={[styles.descText, { color: colors.textSecondary }]}>
                    {goodsDetails.description}
                  </Text>
                </>
              )}
            </View>
          )}

          {/* ── Fare Breakdown ── */}
          <View style={styles.fareCard}>
            <Text style={styles.cardLabel}>💳 FARE BREAKDOWN</Text>
            <View style={styles.fareBreakRow}>
              <Text style={styles.fareBreakLabel}>Base fare</Text>
              <Text style={styles.fareBreakValue}>₹{Math.round(estimatedFare * 0.55)}</Text>
            </View>
            <View style={styles.fareBreakDivider} />
            <View style={styles.fareBreakRow}>
              <Text style={styles.fareBreakLabel}>Distance fare</Text>
              <Text style={styles.fareBreakValue}>₹{Math.round(estimatedFare * 0.35)}</Text>
            </View>
            <View style={styles.fareBreakDivider} />
            <View style={styles.fareBreakRow}>
              <Text style={styles.fareBreakLabel}>Taxes & charges</Text>
              <Text style={styles.fareBreakValue}>₹{Math.round(estimatedFare * 0.10)}</Text>
            </View>
            {packagingOption && packagingOption.price > 0 && (
              <>
                <View style={styles.fareBreakDivider} />
                <View style={styles.fareBreakRow}>
                  <Text style={styles.fareBreakLabel}>{packagingOption.label}</Text>
                  <Text style={styles.fareBreakValue}>₹{packagingOption.price}</Text>
                </View>
              </>
            )}
            <View style={styles.fareTotalRow}>
              <Text style={styles.fareLabel}>Total Estimated Fare</Text>
              <Text style={styles.fareValue}>₹{estimatedFare + (packagingOption?.price ?? 0)}</Text>
            </View>
          </View>

          <Button
            label={t('confirm')}
            onPress={handleConfirm}
            style={styles.confirmBtn}
            accessibilityLabel="Confirm booking and proceed to payment"
          />
        </ScrollView>
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
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    marginBottom: 16,
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

  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF6B00',
    letterSpacing: -0.5,
  },

  heroSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 14,
    paddingTop: 4,
  },

  card: {
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

  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowWrap: { alignItems: 'flex-start', paddingVertical: 4 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.iconBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapTop: { marginTop: 2 },
  rowText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 19 },
  rowTitle: { fontSize: 14, fontWeight: '700' },
  rowSub: { fontSize: 12, marginTop: 1 },
  rowValue: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginLeft: 0 },

  phoneWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.iconBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  phoneText: { fontSize: 11, fontWeight: '700', color: Colors.primary },

  descText: { fontSize: 13, lineHeight: 19, paddingTop: 2 },

  fareCard: {
    backgroundColor: colors.iconBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.iconBorder,
  },
  fareBreakRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  fareBreakLabel: { fontSize: 13, color: '#F59E0B' },
  fareBreakValue: { fontSize: 13, fontWeight: '600', color: '#F59E0B' },
  fareBreakDivider: { height: 1, backgroundColor: colors.iconBorder },
  fareTotalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, paddingTop: 12, borderTopWidth: 2, borderTopColor: colors.iconBorder,
  },
  fareLabel: { fontSize: 14, fontWeight: '700', color: '#F59E0B' },
  fareValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },

  confirmBtn: { width: '100%' },
})
;