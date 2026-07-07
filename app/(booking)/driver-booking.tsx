import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  CheckCircle2,
  MapPin,
  Circle,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  Star,
  Shield,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';
import { MOCK_DRIVERS } from '../../constants/mockData';
import HOME_BG from '../../assets/bg/homeBg';

export default function DriverBookingScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const {
    pickup, drop, scheduledSlot, estimatedFare, appliedCoupon,
    moversFlow, movingItemCount, helperCount, resetBooking,
  } = useBookingStore();

  const driver = useMemo(
    () => MOCK_DRIVERS.find((d) => d.icon === 'packers_movers') ?? MOCK_DRIVERS[4],
    []
  );

  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, estimatedFare - discount);

  const bookingId = useMemo(() => `PM-${Math.floor(100000 + Math.random() * 900000)}`, []);

  const flowLabel =
    moversFlow === 'mini_truck' ? 'Mini Truck Shifting'
    : moversFlow === 'between_cities' ? 'Between Cities Shifting'
    : 'Within City Shifting';

  const handleDone = () => {
    resetBooking();
    router.replace('/(main)/home');
  };

  const handleViewOrders = () => {
    resetBooking();
    router.replace('/(main)/orders');
  };

  return (
    <ImageBackground source={HOME_BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.root, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ── Success header ── */}
          <View style={styles.successWrap}>
            <View style={styles.successIcon}>
              <CheckCircle2 size={40} color="#16A34A" />
            </View>
            <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Driver Booked!</Text>
            <Text style={[styles.successSub, { color: colors.textSecondary }]}>
              {flowLabel} · Booking ID {bookingId}
            </Text>
          </View>

          {/* ── Booked driver card ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🚚 YOUR MOVING TEAM</Text>
            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverAvatarText}>{driver.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.driverName, { color: colors.textPrimary }]}>{driver.name}</Text>
                <Text style={[styles.driverVehicle, { color: colors.textSecondary }]}>
                  {driver.vehicle} · {driver.vehicleNumber}
                </Text>
                <View style={styles.ratingRow}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingText}>{driver.rating} · {driver.totalRides} jobs</Text>
                </View>
              </View>
              <View style={styles.driverActions}>
                <TouchableOpacity style={styles.actionBtn} accessibilityLabel="Call driver">
                  <Phone size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} accessibilityLabel="Message driver">
                  <MessageSquare size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Scheduled date & time ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🗓️ BOOKED FOR</Text>
            <View style={styles.infoRow}>
              <Calendar size={16} color={Colors.primary} />
              <Text style={[styles.infoText, { color: colors.textPrimary }]}>
                {scheduledSlot?.label ?? 'Today'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Clock size={16} color={Colors.primary} />
              <Text style={[styles.infoText, { color: colors.textPrimary }]}>
                {scheduledSlot?.desc ?? '6 AM – 6 PM'}
              </Text>
            </View>
            <View style={styles.confirmBanner}>
              <Shield size={14} color="#16A34A" />
              <Text style={styles.confirmBannerText}>
                Your driver is confirmed and will arrive within this slot on the chosen date.
              </Text>
            </View>
          </View>

          {/* ── Locations ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📍 LOCATIONS</Text>
            <View style={styles.infoRow}>
              <Circle size={12} color={Colors.primary} fill={Colors.primary} />
              <Text style={[styles.infoText, { color: colors.textPrimary }]} numberOfLines={2}>
                {pickup?.address ?? '—'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={14} color={Colors.danger} />
              <Text style={[styles.infoText, { color: colors.textPrimary }]} numberOfLines={2}>
                {drop?.address ?? '—'}
              </Text>
            </View>
          </View>

          {/* ── Fare summary ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>💳 FARE SUMMARY</Text>
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
                {movingItemCount > 0 ? `${movingItemCount} item${movingItemCount === 1 ? '' : 's'}` : 'Estimated fare'}
                {helperCount > 0 ? ` · ${helperCount} helper${helperCount === 1 ? '' : 's'}` : ''}
              </Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>
          </View>

          <View style={{ height: 16 }} />
          <Button label="View My Bookings" onPress={handleViewOrders} style={{ width: '100%' }} />
          <View style={{ height: 10 }} />
          <Button label="Done" onPress={handleDone} variant="outline" style={{ width: '100%' }} />
          <View style={{ height: 24 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  bg: { flex: 1 },
  root: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16, gap: 14 },

  successWrap: { alignItems: 'center', gap: 6, marginBottom: 4 },
  successIcon: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  successTitle: { fontSize: 20, fontWeight: '800' },
  successSub: { fontSize: 12, fontWeight: '500' },

  card: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3, gap: 8,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: colors.placeholder, letterSpacing: 1.2, marginBottom: 2 },

  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.iconBg,
    justifyContent: 'center', alignItems: 'center',
  },
  driverAvatarText: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  driverName: { fontSize: 15, fontWeight: '700' },
  driverVehicle: { fontSize: 12, marginTop: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  ratingText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  driverActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.iconBg,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.iconBorder,
  },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 13, fontWeight: '600', flex: 1 },

  confirmBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#F0FDF4', borderRadius: 14, padding: 12, marginTop: 4,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  confirmBannerText: { flex: 1, fontSize: 12, lineHeight: 17, color: '#166534' },

  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fareLabel: { fontSize: 13, flex: 1 },
  totalValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
});