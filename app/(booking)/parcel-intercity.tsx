import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Circle, Package, ChevronRight, Check } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';
import { useMapPickerStore } from '../../store/mapPickerStore';
import LocationSearchInput from '../../components/booking/LocationSearchInput';
import { INTERCITY_PARCEL_CATEGORIES, INTERCITY_PARCEL_WEIGHT_SLABS } from '../../constants/mockData';

const POPULAR_ROUTES = [
  { from: 'Bengaluru', to: 'Chennai', eta: '1-2 days' },
  { from: 'Bengaluru', to: 'Hyderabad', eta: '1-2 days' },
  { from: 'Bengaluru', to: 'Mumbai', eta: '2-3 days' },
  { from: 'Bengaluru', to: 'Pune', eta: '2-3 days' },
];

const PICKUP_SLOTS = ['Today', 'Tomorrow', 'Day after tomorrow'];

type Step = 'route' | 'details' | 'confirm';

export default function ParcelIntercityScreen() {
  const { colors } = useTheme();
  const { setPickup, setDrop, setEstimatedFare, setSelectedVehicle } = useBookingStore();
  const { result: mapResult, clearResult } = useMapPickerStore();

  const [step, setStep] = useState<Step>('route');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      if (mapResult) {
        if (mapResult.fieldKey === 'from') setFromCity(mapResult.address);
        else if (mapResult.fieldKey === 'to') setToCity(mapResult.address);
        clearResult();
      }
    }, [mapResult])
  );
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWeightId, setSelectedWeightId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('Today');
  const [parcelDesc, setParcelDesc] = useState('');

  const selectedSlab = INTERCITY_PARCEL_WEIGHT_SLABS.find((s) => s.id === selectedWeightId);
  const canProceedRoute = fromCity.trim().length > 1 && toCity.trim().length > 1;
  const canProceedDetails =
    senderName.trim().length > 1 &&
    senderPhone.trim().length >= 10 &&
    receiverName.trim().length > 1 &&
    receiverPhone.trim().length >= 10 &&
    selectedCategory !== null &&
    selectedWeightId !== null;

  const handleRouteNext = () => {
    setPickup({ label: fromCity.trim(), address: fromCity.trim() });
    setDrop({ label: toCity.trim(), address: toCity.trim() });
    setStep('details');
  };

  const handleConfirm = () => {
    if (!selectedSlab) return;
    setSelectedVehicle('intercity_parcel');
    setEstimatedFare(selectedSlab.price);
    router.push('/(booking)/fare');
  };

  // ─── Step: Route ───────────────────────────────────────────────────────────
  if (step === 'route') {
    return (
      <ImageBackground source={require('../../assets/images/home-bg.png')} style={styles.bg} resizeMode="cover">
        <SafeAreaView style={styles.safe}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTopRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <ArrowLeft size={20} color="#FF6B00" />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>Inter City Parcel</Text>
                <Text style={styles.heroSubtitle}>Send parcels across cities</Text>
              </View>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Route Input */}
            <View style={[styles.card, { zIndex: 20 }]}>
              <Text style={styles.cardLabel}>📍 FROM & TO</Text>
              <LocationSearchInput
                value={fromCity}
                onChangeText={setFromCity}
                onSelect={setFromCity}
                placeholder="From city  (e.g. Bengaluru)"
                dotType="circle"
                dotColor={Colors.primary}
                fieldKey="from"
              />
              <View style={styles.routeDivider} />
              <LocationSearchInput
                value={toCity}
                onChangeText={setToCity}
                onSelect={setToCity}
                placeholder="To city  (e.g. Chennai)"
                dotType="pin"
                dotColor={Colors.primary}
                fieldKey="to"
              />
            </View>

            {/* Pickup Slot */}
            <Text style={styles.sectionTitle}>📅 Pickup Schedule</Text>
            <View style={styles.slotRow}>
              {PICKUP_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotChip, selectedSlot === slot && styles.slotChipActive]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Popular Routes */}
            <Text style={styles.sectionTitle}>🔥 Popular Routes</Text>
            {POPULAR_ROUTES.map((r) => (
              <TouchableOpacity
                key={r.from + r.to}
                style={styles.popularCard}
                onPress={() => { setFromCity(r.from); setToCity(r.to); }}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.popularName, { color: colors.textPrimary }]}>
                    {r.from} → {r.to}
                  </Text>
                  <Text style={[styles.popularEta, { color: colors.textSecondary }]}>
                    Delivery in {r.eta}
                  </Text>
                </View>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            ))}

            <View style={{ height: 16 }} />
            <Button label="Next: Parcel Details" onPress={handleRouteNext} disabled={!canProceedRoute} style={{ width: '100%' }} />
            <View style={{ height: 32 }} />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  // ─── Step: Details ─────────────────────────────────────────────────────────
  if (step === 'details') {
    return (
      <ImageBackground source={require('../../assets/images/home-bg.png')} style={styles.bg} resizeMode="cover">
        <SafeAreaView style={styles.safe}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTopRow}>
              <TouchableOpacity onPress={() => setStep('route')} style={styles.backBtn}>
                <ArrowLeft size={20} color="#FF6B00" />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>Parcel Details</Text>
                <Text style={styles.heroSubtitle}>{fromCity} → {toCity}</Text>
              </View>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Sender */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>👤 SENDER DETAILS</Text>
              <TextInput
                style={[styles.inputField, { color: colors.textPrimary }]}
                placeholder="Your name"
                placeholderTextColor="#AAAAAA"
                value={senderName}
                onChangeText={setSenderName}
              />
              <View style={styles.inputDivider} />
              <TextInput
                style={[styles.inputField, { color: colors.textPrimary }]}
                placeholder="Your phone number"
                placeholderTextColor="#AAAAAA"
                value={senderPhone}
                onChangeText={setSenderPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            {/* Receiver */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>📦 RECEIVER DETAILS</Text>
              <TextInput
                style={[styles.inputField, { color: colors.textPrimary }]}
                placeholder="Receiver's name"
                placeholderTextColor="#AAAAAA"
                value={receiverName}
                onChangeText={setReceiverName}
              />
              <View style={styles.inputDivider} />
              <TextInput
                style={[styles.inputField, { color: colors.textPrimary }]}
                placeholder="Receiver's phone number"
                placeholderTextColor="#AAAAAA"
                value={receiverPhone}
                onChangeText={setReceiverPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            {/* Category */}
            <Text style={styles.sectionTitle}>📦 Parcel Category</Text>
            <View style={styles.categoryGrid}>
              {INTERCITY_PARCEL_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryCard, isActive && styles.categoryCardActive]}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.categoryName, isActive && styles.categoryNameActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Weight */}
            <Text style={styles.sectionTitle}>⚖️ Parcel Weight</Text>
            {INTERCITY_PARCEL_WEIGHT_SLABS.map((slab) => {
              const isActive = selectedWeightId === slab.id;
              return (
                <TouchableOpacity
                  key={slab.id}
                  style={[styles.weightCard, isActive && styles.weightCardActive]}
                  onPress={() => setSelectedWeightId(slab.id)}
                  activeOpacity={0.85}
                >
                  <Package size={18} color={isActive ? Colors.primary : '#9CA3AF'} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.weightLabel, isActive && { color: Colors.primary }]}>
                      {slab.label}
                    </Text>
                    <Text style={[styles.weightSublabel, { color: colors.textSecondary }]}>
                      {slab.description}
                    </Text>
                  </View>
                  <Text style={[styles.weightPrice, isActive && { color: Colors.primary }]}>
                    ₹{slab.price}
                  </Text>
                  {isActive && (
                    <View style={styles.checkCircle}>
                      <Check size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Optional description */}
            <Text style={styles.sectionTitle}>📝 Parcel Description (Optional)</Text>
            <View style={styles.card}>
              <TextInput
                style={[styles.inputField, { color: colors.textPrimary, minHeight: 60 }]}
                placeholder="e.g. Electronics, fragile items, documents..."
                placeholderTextColor="#AAAAAA"
                value={parcelDesc}
                onChangeText={setParcelDesc}
                multiline
              />
            </View>

            <View style={{ height: 16 }} />
            <Button
              label={selectedSlab ? `Review Booking · ₹${selectedSlab.price}` : 'Review Booking'}
              onPress={() => setStep('confirm')}
              disabled={!canProceedDetails}
              style={{ width: '100%' }}
            />
            <View style={{ height: 32 }} />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  // ─── Step: Confirm ─────────────────────────────────────────────────────────
  return (
    <ImageBackground source={require('../../assets/images/home-bg.png')} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => setStep('details')} style={styles.backBtn}>
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Review Booking</Text>
              <Text style={styles.heroSubtitle}>Confirm your parcel details</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Route summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>🗺️ ROUTE</Text>
            <View style={styles.summaryRow}>
              <Circle size={8} color={Colors.primary} fill={Colors.primary} />
              <Text style={[styles.summaryText, { color: colors.textPrimary }]}>{fromCity}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <MapPin size={8} color="#FF6B00" />
              <Text style={[styles.summaryText, { color: colors.textPrimary }]}>{toCity}</Text>
            </View>
          </View>

          {/* Parcel summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>📦 PARCEL</Text>
            <View style={styles.summaryItemRow}>
              <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Category</Text>
              <Text style={[styles.summaryItemValue, { color: colors.textPrimary }]}>
                {INTERCITY_PARCEL_CATEGORIES.find((c) => c.id === selectedCategory)?.name ?? '—'}
              </Text>
            </View>
            <View style={styles.summaryItemRow}>
              <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Weight</Text>
              <Text style={[styles.summaryItemValue, { color: colors.textPrimary }]}>
                {selectedSlab?.label ?? '—'}
              </Text>
            </View>
            <View style={styles.summaryItemRow}>
              <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Pickup</Text>
              <Text style={[styles.summaryItemValue, { color: colors.textPrimary }]}>{selectedSlot}</Text>
            </View>
          </View>

          {/* People summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>👥 CONTACTS</Text>
            <View style={styles.summaryItemRow}>
              <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Sender</Text>
              <Text style={[styles.summaryItemValue, { color: colors.textPrimary }]}>{senderName}</Text>
            </View>
            <View style={styles.summaryItemRow}>
              <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Receiver</Text>
              <Text style={[styles.summaryItemValue, { color: colors.textPrimary }]}>{receiverName}</Text>
            </View>
          </View>

          {/* Fare */}
          <View style={styles.fareCard}>
            <Text style={styles.cardLabel}>💳 FARE BREAKDOWN</Text>
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Delivery charge</Text>
              <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹{selectedSlab?.price ?? 0}</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Platform fee</Text>
              <Text style={[styles.fareValue, { color: colors.textPrimary }]}>₹0</Text>
            </View>
            <View style={[styles.fareRow, styles.fareTotalRow]}>
              <Text style={styles.fareTotalLabel}>Total</Text>
              <Text style={styles.fareTotalValue}>₹{selectedSlab?.price ?? 0}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              🛡️ Parcel insured up to ₹5,000. Delivery in 1–3 business days depending on route.
            </Text>
          </View>

          <View style={{ height: 16 }} />
          <Button
            label={`Confirm Booking · ₹${selectedSlab?.price ?? 0}`}
            onPress={handleConfirm}
            style={{ width: '100%' }}
          />
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 16,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#FFD6B3', justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: '#666', fontWeight: '500', marginTop: 2 },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4, marginBottom: 16,
  },
  cardLabel: {
    fontSize: 10, fontWeight: '700', color: '#9CA3AF',
    letterSpacing: 1.2, marginBottom: 12,
  },

  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  routeInput: { flex: 1, fontSize: 15, fontWeight: '600', paddingVertical: 8 },
  routeDivider: { height: 1, backgroundColor: '#FFE8D6', marginVertical: 4, marginLeft: 20 },

  inputField: { fontSize: 14, fontWeight: '500', paddingVertical: 10 },
  inputDivider: { height: 1, backgroundColor: '#FFE8D6', marginVertical: 4 },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 10, marginTop: 4 },

  slotRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  slotChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#FFE8D6',
  },
  slotChipActive: { borderColor: Colors.primary, backgroundColor: '#FFF7F2' },
  slotText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  slotTextActive: { color: Colors.primary },

  popularCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  popularName: { fontSize: 14, fontWeight: '700' },
  popularEta: { fontSize: 12, marginTop: 2 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  categoryCard: {
    width: '30%', alignItems: 'center', gap: 6,
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12,
    borderWidth: 1.5, borderColor: '#FFE8D6',
  },
  categoryCardActive: { borderColor: Colors.primary, backgroundColor: '#FFF7F2' },
  categoryEmoji: { fontSize: 24 },
  categoryName: { fontSize: 11, fontWeight: '700', color: '#6B7280', textAlign: 'center' },
  categoryNameActive: { color: Colors.primary },

  weightCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  weightCardActive: { borderColor: Colors.primary, backgroundColor: '#FFF7F2' },
  weightLabel: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  weightSublabel: { fontSize: 12, marginTop: 1 },
  weightPrice: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },

  summaryCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4, marginBottom: 12,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  summaryText: { fontSize: 14, fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: '#FFE8D6', marginVertical: 4, marginLeft: 18 },
  summaryItemRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: '#FFF3EC',
  },
  summaryItemLabel: { fontSize: 13 },
  summaryItemValue: { fontSize: 13, fontWeight: '600' },

  fareCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4, marginBottom: 12,
  },
  fareRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 6,
  },
  fareLabel: { fontSize: 13 },
  fareValue: { fontSize: 13, fontWeight: '600' },
  fareTotalRow: {
    borderTopWidth: 1, borderTopColor: '#FFE8D6', marginTop: 4, paddingTop: 12,
  },
  fareTotalLabel: { fontSize: 15, fontWeight: '800', color: '#1A1A1A' },
  fareTotalValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },

  infoCard: {
    backgroundColor: '#FFF7F2', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#FFE8D6', marginBottom: 8,
  },
  infoText: { fontSize: 12, lineHeight: 18 },
});