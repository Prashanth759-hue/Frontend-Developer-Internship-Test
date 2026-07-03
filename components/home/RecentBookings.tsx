import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bike, Car, Package, Mail, Truck, ChevronRight, RotateCcw } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { BorderRadius, Layout, Shadow, Spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { StatusBadge } from '../common/StatusBadge';
import { useAuthStore } from '../../store/authStore';
import { useTripHistoryStore, getUserTrips, type TripRecord } from '../../store/tripHistoryStore';
import { MOCK_ORDERS, MOCK_USER } from '../../constants/mockData';

type RecentOrder = (typeof MOCK_ORDERS)[0] | TripRecord;

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'Bike Taxi':        <Bike size={18} color="#FFFFFF" />,
  'Auto':             <Truck size={18} color="#FFFFFF" />,
  'Car':              <Car size={18} color="#FFFFFF" />,
  'Parcel':           <Package size={18} color="#FFFFFF" />,
  'Courier':          <Mail size={18} color="#FFFFFF" />,
  'Freight':          <Truck size={18} color="#FFFFFF" />,
  'Truck':            <Truck size={18} color="#FFFFFF" />,
  'Heavy Cargo':      <Truck size={18} color="#FFFFFF" />,
  'Packers & Movers': <Truck size={18} color="#FFFFFF" />,
};

// Map order service labels to serviceType for rebook routing
const SERVICE_TYPE_MAP: Record<string, string> = {
  'Bike Taxi':        'bike_taxi',
  'Auto':             'auto',
  'Car':              'car',
  'Parcel':           'parcel',
  'Courier':          'courier',
  'Freight':          'heavy_cargo',
  'Truck':            'heavy_cargo',
  'Heavy Cargo':      'heavy_cargo',
  'Packers & Movers': 'packers_movers',
};

interface RecentBookingsProps {
  onRebook: (order: RecentOrder) => void;
}

export function RecentBookings({ onRebook }: RecentBookingsProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { user } = useAuthStore();

  // Only the seeded demo account sees the demo MOCK_ORDERS. Every account
  // sees its own real trips (added live as trips are completed), so a
  // new/real user never sees someone else's fake "Recent Trips".
  const isDemoAccount = user?.id === MOCK_USER.id;
  const realTrips = useTripHistoryStore((s) => getUserTrips(s, user?.id));
  const recent = [...realTrips, ...(isDemoAccount ? MOCK_ORDERS : [])].slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: colors.textPrimary }]}>
          Recent Trips
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(main)/orders')}
          style={styles.seeAllBtn}
          accessibilityLabel="View all orders"
          accessibilityRole="button"
        >
          <Text style={styles.seeAll}>See all</Text>
          <ChevronRight size={14} color="#FF6B00" />
        </TouchableOpacity>
      </View>

      {/* Cards */}
      {recent.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() => router.push('/(main)/orders')}
          accessibilityLabel={`Order ${item.id}, ${item.service}, ${item.status}`}
          activeOpacity={0.85}
        >
          {/* Left icon */}
          <LinearGradient
            colors={['#FF6B00', '#FF9A4D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconWrap}
          >
            {SERVICE_ICONS[item.service] ?? (
              <Package size={18} color="#FFFFFF" />
            )}
          </LinearGradient>

          {/* Info */}
          <View style={styles.info}>
            <Text style={[styles.service, { color: colors.textPrimary }]}>
              {item.service}
            </Text>
            <Text
              style={[styles.route, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.pickup} → {item.drop}
            </Text>
            <Text style={[styles.datetime, { color: colors.textSecondary }]}>
              {item.date} · {item.time}
            </Text>
          </View>

          {/* Right area */}
          <View style={styles.rightArea}>
            <Text style={[styles.fare, { color: colors.textPrimary }]}>
              {item.fare}
            </Text>
            <StatusBadge status={item.status as any} />

            {/* Rebook button - only for completed */}
            {item.status === 'completed' && (
              <TouchableOpacity
                style={styles.rebookBtn}
                onPress={() => onRebook(item)}
                accessibilityLabel={`Rebook ${item.service}`}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <RotateCcw size={12} color="#FF6B00" />
                <Text style={styles.rebookText}>Rebook</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export { SERVICE_TYPE_MAP };

const makeStyles = (colors: any) => StyleSheet.create({
  section: {
    paddingHorizontal: Layout.screenPadding,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.iconBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.iconBorder,
  },
  seeAll: { fontSize: 12, fontWeight: '600', color: '#FF6B00' },
  card: {
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#FFE5D0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#FF6B00',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    flexShrink: 0,
  },
  info: { flex: 1, gap: 3 },
  service: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  route: { fontSize: 12, color: colors.placeholder, lineHeight: 16 },
  datetime: { fontSize: 11, color: colors.placeholder },
  rightArea: { alignItems: 'flex-end', gap: 5, flexShrink: 0 },
  fare: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  rebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginTop: 2,
    backgroundColor: colors.iconBg,
  },
  rebookText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
});