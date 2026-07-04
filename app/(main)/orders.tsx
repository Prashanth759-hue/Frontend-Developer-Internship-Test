import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, ActivityIndicator, ImageBackground, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronRight, ClipboardList, SlidersHorizontal, X } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { useTripHistoryStore, getUserTrips } from '../../store/tripHistoryStore';
import { MOCK_ORDERS, MOCK_USER } from '../../constants/mockData';
import HOME_BG from '../../assets/bg/homeBg';

const VEHICLE_CATEGORIES = [
  {
    id: 'bike',
    name: 'Bike',
    image: require('../../assets/images/bike-rider.png'),
    services: ['Bike Taxi', 'Bike'],
    serviceType: 'Ride',
  },
  {
    id: 'auto',
    name: 'Auto',
    image: require('../../assets/images/auto.png'),
    services: ['Auto'],
    serviceType: 'Ride',
  },
  {
    id: 'car',
    name: 'Car',
    image: require('../../assets/images/car.png'),
    services: ['Car'],
    serviceType: 'Ride',
  },
  {
    id: 'truck',
    name: 'Truck',
    image: require('../../assets/images/truck.png'),
    services: ['Truck'],
    serviceType: 'Delivery',
  },
  {
    id: 'parcel',
    name: 'Parcel',
    image: require('../../assets/images/parcel.png'),
    services: ['Parcel', 'Courier'],
    serviceType: 'Delivery',
  },
  {
    id: 'packers',
    name: 'Packers & Movers',
    image: require('../../assets/images/Packers-Movers.png'),
    services: ['Packers & Movers', 'Movers'],
    serviceType: 'Delivery',
  },
];

function getCategoryForService(service: string) {
  return VEHICLE_CATEGORIES.find((c) => c.services.includes(service)) ?? null;
}

// Status tabs shown at the top of the list — covers every state an order can be in.
const STATUS_TABS = ['All', 'booked', 'ongoing', 'completed', 'cancelled'] as const;
const STATUS_TAB_LABELS: Record<string, string> = {
  All: 'All',
  booked: 'Booked',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const DATE_OPTIONS = ['All Time', 'Last 7 Days', 'Last 30 Days', 'Last 3 Months'];
const SERVICE_TYPE_OPTIONS = ['All', 'Ride', 'Delivery'];

function parseOrderDate(dateStr: string): Date {
  const parts = dateStr.split(' ');
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  return new Date(parseInt(parts[2], 10), months[parts[1]] ?? 0, parseInt(parts[0], 10));
}

function daysSinceOrder(dateStr: string): number {
  return Math.floor((Date.now() - parseOrderDate(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export default function OrdersScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const [loading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // The mock backend only has seeded demo trip history for the original
  // demo account (MOCK_USER). Every account also gets its own REAL trips
  // saved as they're completed / cancelled / booked (see
  // store/tripHistoryStore.ts), so Orders always reflects actual activity,
  // not just the seeded demo data.
  const isDemoAccount = user?.id === MOCK_USER.id;
  const realTrips = useTripHistoryStore((s) => getUserTrips(s, user?.id));
  const accountOrders = useMemo(
    () => [...realTrips, ...(isDemoAccount ? MOCK_ORDERS : [])],
    [realTrips, isDemoAccount]
  );

  // Every order, any status (booked, ongoing, completed, cancelled...), newest first.
  const allOrders = useMemo(
    () =>
      [...accountOrders].sort(
        (a, b) => parseOrderDate(b.date).getTime() - parseOrderDate(a.date).getTime()
      ),
    [accountOrders]
  );

  // Quick status tab (All / Booked / Ongoing / Completed / Cancelled)
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>('All');

  // Filter state (service type + date range, via the filter sheet)
  const [filterDate, setFilterDate] = useState('All Time');
  const [filterServiceType, setFilterServiceType] = useState('All');

  // Pending (in-modal) filter state
  const [pendingDate, setPendingDate] = useState('All Time');
  const [pendingServiceType, setPendingServiceType] = useState('All');

  const openFilter = () => {
    setPendingDate(filterDate);
    setPendingServiceType(filterServiceType);
    setShowFilter(true);
  };

  const applyFilter = () => {
    setFilterDate(pendingDate);
    setFilterServiceType(pendingServiceType);
    setShowFilter(false);
  };

  const resetFilter = () => {
    setPendingDate('All Time');
    setPendingServiceType('All');
  };

  const clearAllFilters = () => {
    setFilterDate('All Time');
    setFilterServiceType('All');
    setActiveTab('All');
  };

  const isFilterActive = filterDate !== 'All Time' || filterServiceType !== 'All';

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allOrders.length };
    STATUS_TABS.forEach((s) => {
      if (s !== 'All') counts[s] = allOrders.filter((o) => o.status === s).length;
    });
    return counts;
  }, [allOrders]);

  const visibleOrders = useMemo(() => {
    let orders = allOrders;

    if (activeTab !== 'All') {
      orders = orders.filter((o) => o.status === activeTab);
    }
    if (filterServiceType !== 'All') {
      orders = orders.filter((o) => getCategoryForService(o.service)?.serviceType === filterServiceType);
    }
    if (filterDate !== 'All Time') {
      const maxDays = filterDate === 'Last 7 Days' ? 7 : filterDate === 'Last 30 Days' ? 30 : 90;
      orders = orders.filter((o) => daysSinceOrder(o.date) <= maxDays);
    }
    return orders;
  }, [allOrders, activeTab, filterServiceType, filterDate]);

  const isAnyFilterActive = isFilterActive || activeTab !== 'All';

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const FilterChip = ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.filterChip, selected && styles.filterChipActive]}
    >
      <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={HOME_BG}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{t('ordersTitle')}</Text>
              <Text style={styles.heroSubtitle}>
                {allOrders.length} {allOrders.length === 1 ? 'order' : 'orders'} in total
              </Text>
            </View>
            <TouchableOpacity
              onPress={openFilter}
              style={[styles.filterBtn, isFilterActive && styles.filterBtnActive]}
              accessibilityLabel="Filter orders"
            >
              <SlidersHorizontal size={18} color={isFilterActive ? colors.surface : '#FF6B00'} />
            </TouchableOpacity>
          </View>

          {/* Status tabs — All / Booked / Ongoing / Completed / Cancelled */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 14 }}
            contentContainerStyle={{ gap: 8 }}
          >
            {STATUS_TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}
              >
                <Text style={[styles.tabChipText, activeTab === tab && styles.tabChipTextActive]}>
                  {STATUS_TAB_LABELS[tab]} ({tabCounts[tab] ?? 0})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {visibleOrders.length === 0 ? (
          <EmptyState
            title={isAnyFilterActive ? 'No matching orders' : t('noCategoriesMatch')}
            subtitle={
              isAnyFilterActive
                ? 'Try adjusting or resetting your filters.'
                : 'Your bookings will show up here once you book a ride or delivery.'
            }
            actionLabel={isAnyFilterActive ? t('back') : t('confirm')}
            onAction={isAnyFilterActive ? clearAllFilters : () => router.push('/(main)/home')}
            icon={<ClipboardList size={56} color={colors.border} />}
          />
        ) : (
          <FlatList
            data={visibleOrders}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const category = getCategoryForService(item.service);
              return (
                <TouchableOpacity
                  style={styles.orderCard}
                  onPress={() => router.push({ pathname: '/order-detail', params: { id: item.id } })}
                  activeOpacity={0.85}
                >
                  <View style={styles.cardTopRow}>
                    {category?.image && (
                      <Image source={category.image} style={styles.cardServiceIcon} resizeMode="contain" />
                    )}
                    <View style={{ flex: 1, gap: 6 }}>
                      <View style={styles.cardTopChipsRow}>
                        <View style={styles.serviceChip}>
                          <Text style={styles.serviceChipText}>{item.service}</Text>
                        </View>
                        {category?.serviceType && (
                          <View style={styles.serviceTypeChip}>
                            <Text style={styles.serviceTypeChipText}>{category.serviceType}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardRow}>
                    <View style={styles.cardLeft}>
                      <Text style={[styles.orderId, { color: colors.textSecondary }]}>{item.id}</Text>
                      <Text style={[styles.route, { color: colors.textPrimary }]} numberOfLines={2}>
                        {item.pickup} → {item.drop}
                      </Text>
                      <Text style={[styles.datetime, { color: colors.textSecondary }]}>
                        {item.date} · {item.time}
                      </Text>
                    </View>

                    <View style={styles.cardRight}>
                      <Text style={[styles.fare, { color: colors.textPrimary }]}>{item.fare}</Text>
                      <StatusBadge status={item.status as any} />
                      <ChevronRight size={16} color={colors.textSecondary} style={{ marginTop: 2 }} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          />
        )}

        {/* Filter Modal */}
        <Modal
          visible={showFilter}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFilter(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.filterSheet, { backgroundColor: colors.surface }]}>
              <View style={styles.sheetHandle} />

              {/* Header */}
              <View style={styles.filterSheetHeader}>
                <Text style={[styles.filterSheetTitle, { color: colors.textPrimary }]}>Filter Orders</Text>
                <TouchableOpacity onPress={() => setShowFilter(false)} style={styles.closeBtn}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Service Type */}
                <Text style={[styles.filterSectionLabel, { color: colors.textSecondary }]}>Service Type</Text>
                <View style={styles.filterChipsRow}>
                  {SERVICE_TYPE_OPTIONS.map((opt) => (
                    <FilterChip
                      key={opt}
                      label={opt}
                      selected={pendingServiceType === opt}
                      onPress={() => setPendingServiceType(opt)}
                    />
                  ))}
                </View>

                {/* Date Range */}
                <Text style={[styles.filterSectionLabel, { color: colors.textSecondary }]}>Date Range</Text>
                <View style={styles.filterChipsRow}>
                  {DATE_OPTIONS.map((opt) => (
                    <FilterChip
                      key={opt}
                      label={opt}
                      selected={pendingDate === opt}
                      onPress={() => setPendingDate(opt)}
                    />
                  ))}
                </View>
              </ScrollView>

              {/* Actions */}
              <View style={styles.filterActions}>
                <TouchableOpacity style={styles.resetBtn} onPress={resetFilter}>
                  <Text style={styles.resetBtnText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={applyFilter}>
                  <Text style={styles.applyBtnText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  safe: { flex: 1, backgroundColor: 'transparent' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  heroHeader: {
    paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: colors.surfaceElevated,
    borderBottomWidth: 1, borderColor: '#FF6B00',
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  heroSubtitle: { marginTop: 4, fontSize: 14, color: colors.textSecondary, fontWeight: '500' },

  filterBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#FF6B00', borderColor: '#FF6B00',
  },

  tabChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.iconBorder,
  },
  tabChipActive: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
  tabChipText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  tabChipTextActive: { color: colors.surface },

  list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 },

  orderCard: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: '#FF6B00',
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4, gap: 12,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardServiceIcon: { width: 34, height: 34 },
  cardTopChipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  serviceChip: {
    alignSelf: 'flex-start', backgroundColor: colors.iconBg,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: '#FF6B00',
  },
  serviceChipText: { fontSize: 11, fontWeight: '700', color: '#FF6B00' },
  serviceTypeChip: {
    alignSelf: 'flex-start', backgroundColor: '#FF6B00',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  serviceTypeChipText: { fontSize: 11, fontWeight: '700', color: colors.surface },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardLeft: { flex: 1, gap: 4 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'center', gap: 6 },
  orderId: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  route: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, lineHeight: 22 },
  datetime: { fontSize: 12, color: colors.textSecondary },
  fare: { fontSize: 20, fontWeight: '800', color: '#FF6B00' },

  // Filter Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  filterSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, maxHeight: '80%',
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: 16,
  },
  filterSheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  filterSheetTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.divider,
    justifyContent: 'center', alignItems: 'center',
  },
  filterSectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10, marginTop: 16 },
  filterChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
    backgroundColor: colors.divider, borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.iconBg, borderColor: '#FF6B00',
  },
  filterChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterChipTextActive: { color: '#FF6B00' },
  filterActions: {
    flexDirection: 'row', gap: 12, marginTop: 24,
  },
  resetBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: '#FF6B00',
    alignItems: 'center', justifyContent: 'center',
  },
  resetBtnText: { fontSize: 15, fontWeight: '700', color: '#FF6B00' },
  applyBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 16, backgroundColor: '#FF6B00',
    alignItems: 'center', justifyContent: 'center',
  },
  applyBtnText: { fontSize: 15, fontWeight: '700', color: colors.surface },
})
;