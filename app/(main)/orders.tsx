import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, ActivityIndicator, ImageBackground, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ChevronRight, Check, ClipboardList, SlidersHorizontal, X } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { MOCK_ORDERS } from '../../constants/mockData';

const VEHICLE_CATEGORIES = [
  {
    id: 'bike',
    name: 'Bike',
    description: 'Quick, affordable rides',
    image: require('../../assets/images/bike-rider.png'),
    services: ['Bike Taxi', 'Bike'],
    serviceType: 'Ride',
  },
  {
    id: 'auto',
    name: 'Auto',
    description: 'Comfortable, 3-seater rides',
    image: require('../../assets/images/auto.png'),
    services: ['Auto'],
    serviceType: 'Ride',
  },
  {
    id: 'car',
    name: 'Car',
    description: 'AC, 4-seater rides',
    image: require('../../assets/images/car.png'),
    services: ['Car'],
    serviceType: 'Ride',
  },
  {
    id: 'truck',
    name: 'Truck',
    description: 'Goods & local shifting',
    image: require('../../assets/images/truck.png'),
    services: ['Truck'],
    serviceType: 'Delivery',
  },
  {
    id: 'parcel',
    name: 'Parcel',
    description: 'Send & receive packages',
    image: require('../../assets/images/parcel.png'),
    services: ['Parcel', 'Courier'],
    serviceType: 'Delivery',
  },
  {
    id: 'packers',
    name: 'Packers & Movers',
    description: 'Home & office relocation',
    image: require('../../assets/images/Packers-Movers.png'),
    services: ['Packers & Movers', 'Movers'],
    serviceType: 'Delivery',
  },
];

const STATUS_OPTIONS = ['All', 'completed', 'cancelled', 'ongoing'];
const DATE_OPTIONS = ['All Time', 'Last 7 Days', 'Last 30 Days', 'Last 3 Months'];
const SERVICE_TYPE_OPTIONS = ['All', 'Ride', 'Delivery'];

function daysSinceOrder(dateStr: string): number {
  const parts = dateStr.split(' ');
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const d = new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default function OrdersScreen() {
  const { colors } = useTheme();
  const [loading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  // Filter state
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDate, setFilterDate] = useState('All Time');
  const [filterServiceType, setFilterServiceType] = useState('All');

  // Pending (in-modal) filter state
  const [pendingStatus, setPendingStatus] = useState('All');
  const [pendingDate, setPendingDate] = useState('All Time');
  const [pendingServiceType, setPendingServiceType] = useState('All');

  const openFilter = () => {
    setPendingStatus(filterStatus);
    setPendingDate(filterDate);
    setPendingServiceType(filterServiceType);
    setShowFilter(true);
  };

  const applyFilter = () => {
    setFilterStatus(pendingStatus);
    setFilterDate(pendingDate);
    setFilterServiceType(pendingServiceType);
    setShowFilter(false);
  };

  const resetFilter = () => {
    setPendingStatus('All');
    setPendingDate('All Time');
    setPendingServiceType('All');
  };

  const isFilterActive =
    filterStatus !== 'All' || filterDate !== 'All Time' || filterServiceType !== 'All';

  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; completed: number }> = {};
    VEHICLE_CATEGORIES.forEach((cat) => {
      const orders = MOCK_ORDERS.filter((o) => cat.services.includes(o.service));
      stats[cat.id] = {
        count: orders.length,
        completed: orders.filter((o) => o.status === 'completed').length,
      };
    });
    return stats;
  }, []);

  const selectedCategory = VEHICLE_CATEGORIES.find((c) => c.id === selectedCategoryId) ?? null;

  const historyOrders = useMemo(() => {
    if (!selectedCategory) return [];
    let orders = MOCK_ORDERS.filter((o) => selectedCategory.services.includes(o.service));

    if (filterStatus !== 'All') {
      orders = orders.filter((o) => o.status === filterStatus);
    }
    if (filterDate !== 'All Time') {
      const maxDays = filterDate === 'Last 7 Days' ? 7 : filterDate === 'Last 30 Days' ? 30 : 90;
      orders = orders.filter((o) => daysSinceOrder(o.date) <= maxDays);
    }
    return orders;
  }, [selectedCategory, filterStatus, filterDate]);

  // Filtered vehicle categories by service type
  const filteredCategories = useMemo(() => {
    if (filterServiceType === 'All') return VEHICLE_CATEGORIES;
    return VEHICLE_CATEGORIES.filter((c) => c.serviceType === filterServiceType);
  }, [filterServiceType]);

  // Check if there are any orders at all (for empty state)
  const hasAnyOrders = MOCK_ORDERS.length > 0;

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
      source={require('../../assets/images/home-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {selectedCategory ? (
          <>
            <View style={styles.heroHeader}>
              <View style={styles.heroTopRow}>
                <TouchableOpacity
                  onPress={() => setSelectedCategoryId(null)}
                  style={styles.backBtn}
                  accessibilityLabel="Back to all vehicles"
                >
                  <ArrowLeft size={20} color="#FF6B00" />
                </TouchableOpacity>
                <Image source={selectedCategory.image} style={styles.heroVehicleImage} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>{selectedCategory.name}</Text>
                  <Text style={styles.heroSubtitle} numberOfLines={1}>
                    {selectedCategory.description}
                  </Text>
                </View>
                {/* Filter button */}
                <TouchableOpacity
                  onPress={openFilter}
                  style={[styles.filterBtn, isFilterActive && styles.filterBtnActive]}
                  accessibilityLabel="Filter orders"
                >
                  <SlidersHorizontal size={18} color={isFilterActive ? '#FFFFFF' : '#FF6B00'} />
                </TouchableOpacity>
              </View>

              <View style={styles.chipsRow}>
                <View style={styles.chip}>
                  <Check size={12} color="#FF6B00" />
                  <Text style={styles.chipText}>
                    {categoryStats[selectedCategory.id].completed} completed
                  </Text>
                </View>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>
                    {categoryStats[selectedCategory.id].count}{' '}
                    {categoryStats[selectedCategory.id].count === 1 ? 'trip' : 'trips'} total
                  </Text>
                </View>
                {/* Service type badge */}
                <View style={[styles.chip, styles.serviceTypeBadge]}>
                  <Text style={[styles.chipText, { color: '#FFFFFF' }]}>
                    {selectedCategory.serviceType}
                  </Text>
                </View>
              </View>
            </View>

            {historyOrders.length === 0 ? (
              <EmptyState
                title={isFilterActive ? 'No matching orders' : `No ${selectedCategory.name} trips yet`}
                subtitle={
                  isFilterActive
                    ? 'Try adjusting or resetting your filters.'
                    : `Your ${selectedCategory.name.toLowerCase()} trips will show up here once you book one.`
                }
                actionLabel={isFilterActive ? 'Reset Filters' : 'Book Now'}
                onAction={
                  isFilterActive
                    ? () => { setFilterStatus('All'); setFilterDate('All Time'); setFilterServiceType('All'); }
                    : () => router.push('/(main)/home')
                }
                icon={<Image source={selectedCategory.image} style={styles.emptyVehicleImage} />}
              />
            ) : (
              <FlatList
                data={historyOrders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.orderCard}
                    onPress={() => router.push({ pathname: '/order-detail', params: { id: item.id } })}
                    activeOpacity={0.85}
                  >
                    <View style={styles.cardTopRow}>
                      <View style={styles.serviceChip}>
                        <Text style={styles.serviceChipText}>{item.service}</Text>
                      </View>
                      <View style={styles.serviceTypeChip}>
                        <Text style={styles.serviceTypeChipText}>{selectedCategory.serviceType}</Text>
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
                )}
                ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
              />
            )}
          </>
        ) : (
          <>
            <View style={styles.heroHeader}>
              <View style={styles.heroTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>My Orders</Text>
                  <Text style={styles.heroSubtitle}>Tap a vehicle to see its trip history</Text>
                </View>
                {/* Filter button on main list */}
                <TouchableOpacity
                  onPress={openFilter}
                  style={[styles.filterBtn, isFilterActive && styles.filterBtnActive]}
                  accessibilityLabel="Filter by service type"
                >
                  <SlidersHorizontal size={18} color={isFilterActive ? '#FFFFFF' : '#FF6B00'} />
                </TouchableOpacity>
              </View>
            </View>

            {!hasAnyOrders ? (
              <EmptyState
                title="No trips yet"
                subtitle="Book your first ride or delivery and it will show up here."
                actionLabel="Book Now"
                onAction={() => router.push('/(main)/home')}
                icon={<ClipboardList size={56} color={colors.border} />}
              />
            ) : filteredCategories.length === 0 ? (
              <EmptyState
                title="No categories match"
                subtitle="Try resetting the service type filter."
                actionLabel="Reset Filters"
                onAction={() => { setFilterStatus('All'); setFilterDate('All Time'); setFilterServiceType('All'); }}
                icon={<ClipboardList size={56} color={colors.border} />}
              />
            ) : (
              <FlatList
                data={filteredCategories}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const stats = categoryStats[item.id];
                  return (
                    <TouchableOpacity
                      style={styles.vehicleCard}
                      onPress={() => setSelectedCategoryId(item.id)}
                      activeOpacity={0.85}
                      accessibilityLabel={`${item.name}, ${stats.completed} completed trips`}
                    >
                      <Image source={item.image} style={styles.vehicleImage} resizeMode="contain" />

                      <View style={styles.vehicleInfo}>
                        <Text style={[styles.vehicleName, { color: colors.textPrimary }]}>{item.name}</Text>
                        <Text style={[styles.vehicleDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                          {item.description}
                        </Text>
                        {/* Service type label */}
                        <View style={styles.vehicleServiceTypeBadge}>
                          <Text style={styles.vehicleServiceTypeText}>{item.serviceType}</Text>
                        </View>
                      </View>

                      <View style={styles.vehicleRight}>
                        <View style={styles.completedChip}>
                          <Check size={12} color={Colors.white} />
                          <Text style={styles.completedChipText}>{stats.completed} completed</Text>
                        </View>
                        <ChevronRight size={18} color={colors.textSecondary} />
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              />
            )}
          </>
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

                {/* Status */}
                <Text style={[styles.filterSectionLabel, { color: colors.textSecondary }]}>Status</Text>
                <View style={styles.filterChipsRow}>
                  {STATUS_OPTIONS.map((opt) => (
                    <FilterChip
                      key={opt}
                      label={opt === 'All' ? 'All' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                      selected={pendingStatus === opt}
                      onPress={() => setPendingStatus(opt)}
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

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  heroHeader: {
    paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.25)',
    borderBottomWidth: 1, borderColor: '#FF6B00',
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#FFD6B3', justifyContent: 'center', alignItems: 'center',
  },
  heroVehicleImage: { width: 44, height: 44, resizeMode: 'contain' },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#000000', letterSpacing: -0.5 },
  heroSubtitle: { marginTop: 4, fontSize: 14, color: '#555', fontWeight: '500' },

  filterBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#FFD6B3', justifyContent: 'center', alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#FF6B00', borderColor: '#FF6B00',
  },

  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 14 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: '#FFD6B3',
  },
  chipText: { fontSize: 12, fontWeight: '700', color: '#FF6B00' },
  serviceTypeBadge: {
    backgroundColor: '#FF6B00', borderColor: '#FF6B00',
  },

  list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 },

  vehicleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 24, padding: 16,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  vehicleImage: { width: 64, height: 64 },
  vehicleInfo: { flex: 1, gap: 3 },
  vehicleName: { fontSize: 16, fontWeight: '700' },
  vehicleDesc: { fontSize: 12 },
  vehicleServiceTypeBadge: {
    alignSelf: 'flex-start', backgroundColor: '#FFF0E6',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
    borderWidth: 1, borderColor: '#FFD6B3', marginTop: 4,
  },
  vehicleServiceTypeText: { fontSize: 10, fontWeight: '700', color: '#FF6B00' },
  vehicleRight: { alignItems: 'flex-end', gap: 8 },
  completedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 14,
  },
  completedChipText: { fontSize: 11, fontWeight: '700', color: Colors.white },

  emptyVehicleImage: { width: 64, height: 64, resizeMode: 'contain', opacity: 0.5 },
  orderCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: '#FF6B00',
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4, gap: 12,
  },
  cardTopRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  serviceChip: {
    alignSelf: 'flex-start', backgroundColor: '#FFF0E6',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: '#FF6B00',
  },
  serviceChipText: { fontSize: 11, fontWeight: '700', color: '#FF6B00' },
  serviceTypeChip: {
    alignSelf: 'flex-start', backgroundColor: '#FF6B00',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  serviceTypeChipText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardLeft: { flex: 1, gap: 4 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'center', gap: 6 },
  orderId: { fontSize: 12, color: '#888', fontWeight: '500' },
  route: { fontSize: 15, fontWeight: '600', color: '#222', lineHeight: 22 },
  datetime: { fontSize: 12, color: '#777' },
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
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB',
    alignSelf: 'center', marginBottom: 16,
  },
  filterSheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  filterSheetTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  filterSectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10, marginTop: 16 },
  filterChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#FFF0E6', borderColor: '#FF6B00',
  },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
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
  applyBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
