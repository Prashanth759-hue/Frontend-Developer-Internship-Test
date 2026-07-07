import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Image,
  TextInput,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Circle, Check, Clock, Users, ChevronRight, ArrowUpDown } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';
import { useMapPickerStore } from '../../store/mapPickerStore';
import LocationSearchInput from '../../components/booking/LocationSearchInput';
import {
  INTERCITY_MOVERS_PACKAGES,
  PACKING_MATERIAL_PRICE,
} from '../../constants/mockData';
import HOME_BG from '../../assets/bg/homeBg';

const PACKAGE_IMAGES: Record<string, ImageSourcePropType> = {
  mini_truck: require('../../assets/images/icon-mini-truck.png'),
  truck:      require('../../assets/images/truck.png'),
};

const POPULAR_ROUTES = [
  { from: 'Bengaluru', to: 'Chennai' },
  { from: 'Bengaluru', to: 'Hyderabad' },
  { from: 'Bengaluru', to: 'Mumbai' },
  { from: 'Bengaluru', to: 'Pune' },
];

type Step = 'route' | 'package';

export default function MoversIntercityScreen() {
  const { colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const { setSelectedVehicle, setEstimatedFare, setHelperCount, setPickup, setDrop, setMoversFlow } = useBookingStore();
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
  const [selected, setSelected] = useState<string | null>(null);
  const [packingMaterial, setPackingMaterial] = useState(false);

  const selectedPackage = INTERCITY_MOVERS_PACKAGES.find((p) => p.id === selected) ?? null;
  const totalFare = selectedPackage
    ? selectedPackage.fare + (packingMaterial ? PACKING_MATERIAL_PRICE : 0)
    : 0;

  const canProceedRoute = fromCity.trim().length > 1 && toCity.trim().length > 1;

  const handleSwapLocations = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleRouteNext = () => {
    setPickup({ label: fromCity.trim(), address: fromCity.trim() });
    setDrop({ label: toCity.trim(), address: toCity.trim() });
    setStep('package');
  };

  const handleContinue = () => {
    if (!selectedPackage) return;
    setSelectedVehicle(selectedPackage.id);
    setEstimatedFare(totalFare);
    setHelperCount(selectedPackage.helpers);
    setMoversFlow('between_cities');
    router.push('/(booking)/pickup');
  };

  // ─── Step: Route ────────────────────────────────────────────────────────────
  if (step === 'route') {
    return (
      <ImageBackground source={HOME_BG} style={styles.bg} resizeMode="cover">
        <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTopRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <ArrowLeft size={20} color="#FF6B00" />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>Between Cities Move</Text>
                <Text style={styles.heroSubtitle}>Intercity packers & movers</Text>
              </View>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Route input */}
            <View style={[styles.card, { zIndex: 20 }]}>
              <Text style={styles.cardLabel}>📍 YOUR MOVE ROUTE</Text>
              <View style={styles.locationFieldsWrap}>
                <LocationSearchInput
                  value={fromCity}
                  onChangeText={setFromCity}
                  onSelect={setFromCity}
                  placeholder="Moving from  (e.g. Bengaluru)"
                  dotType="circle"
                  dotColor={Colors.primary}
                  fieldKey="from"
                />
                <View style={styles.routeDivider} />
                <LocationSearchInput
                  value={toCity}
                  onChangeText={setToCity}
                  onSelect={setToCity}
                  placeholder="Moving to  (e.g. Chennai)"
                  dotType="pin"
                  dotColor={Colors.primary}
                  fieldKey="to"
                />
                <TouchableOpacity
                  style={styles.swapBtn}
                  onPress={handleSwapLocations}
                  accessibilityLabel="Swap from and to cities"
                  accessibilityRole="button"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <ArrowUpDown size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Key features */}
            <View style={styles.featuresCard}>
              <Text style={styles.cardLabel}>✅ WHAT'S INCLUDED</Text>
              {[
                '🚚 Dedicated truck for your move',
                '🧑‍🤝‍🧑 Trained packing & moving team',
                '🛡️ Goods insured up to ₹50,000',
                '🌙 Driver night allowance included',
                '🔒 GPS tracked throughout the journey',
              ].map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Text style={[styles.featureText, { color: colors.textPrimary }]}>{f}</Text>
                </View>
              ))}
            </View>

            {/* Popular routes */}
            <Text style={styles.sectionTitle}>🔥 Popular Routes</Text>
            {POPULAR_ROUTES.map((r) => (
              <TouchableOpacity
                key={r.from + r.to}
                style={styles.popularCard}
                onPress={() => { setFromCity(r.from); setToCity(r.to); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.popularName, { color: colors.textPrimary }]}>
                  {r.from} → {r.to}
                </Text>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            ))}

            <View style={{ height: 16 }} />
            <Button
              label={t('confirm')}
              onPress={handleRouteNext}
              disabled={!canProceedRoute}
              style={{ width: '100%' }}
            />
            <View style={{ height: 32 }} />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  // ─── Step: Package ─────────────────────────────────────────────────────────
  return (
    <ImageBackground source={HOME_BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => setStep('route')} style={styles.backBtn}>
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Choose Package</Text>
              <Text style={styles.heroSubtitle}>{fromCity} → {toCity}</Text>
            </View>
          </View>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipText}>{t('chipInsuredMove')}</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>{t('chipFuelTolls')}</Text></View>
          </View>
        </View>

        <FlatList
          data={INTERCITY_MOVERS_PACKAGES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = selected === item.id;
            return (
              <TouchableOpacity
                style={[styles.packageCard, isActive && styles.packageCardActive]}
                onPress={() => setSelected(item.id)}
                activeOpacity={0.85}
              >
                <Image
                  source={PACKAGE_IMAGES[item.icon] ?? PACKAGE_IMAGES.mini_truck}
                  style={styles.packageImage}
                />
                <View style={styles.packageInfo}>
                  <Text style={[styles.packageName, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.packageDesc, { color: colors.textSecondary }]}>{item.description}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.helpersBadge}>
                      <Users size={11} color={Colors.primary} />
                      <Text style={styles.helpersBadgeText}>{item.helpers} helpers</Text>
                    </View>
                    <Clock size={12} color={Colors.primary} />
                    <Text style={styles.etaText}>{item.eta}</Text>
                  </View>
                  <Text style={[styles.nightNote, { color: colors.textSecondary }]}>
                    🌙 Night allowance included
                  </Text>
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
              {/* Packing material add-on */}
              <TouchableOpacity
                style={[styles.packingCard, packingMaterial && styles.packingCardActive]}
                onPress={() => setPackingMaterial((v) => !v)}
                activeOpacity={0.85}
              >
                <Image source={require('../../assets/images/icon-box-pallet.png')} style={styles.packingImage} />
                <View style={styles.packingInfo}>
                  <Text style={[styles.packingTitle, { color: colors.textPrimary }]}>Add Packing Material</Text>
                  <Text style={[styles.packingDesc, { color: colors.textSecondary }]}>
                    Boxes, bubble wrap & tape
                  </Text>
                </View>
                <View style={styles.packingRight}>
                  <Text style={styles.packingPrice}>+ ₹{PACKING_MATERIAL_PRICE}</Text>
                  <View style={[styles.checkbox, packingMaterial && styles.checkboxActive]}>
                    {packingMaterial && <Check size={12} color={Colors.white} />}
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.infoCard}>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  ℹ️ Intercity moves are typically completed in 1–3 days. Final fare may vary based on actual distance and additional services required.
                </Text>
              </View>

              <Button
                label={selectedPackage ? `Confirm Move · ₹${totalFare}` : 'Select a Package'}
                onPress={handleContinue}
                disabled={!selectedPackage}
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
  bg: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: colors.surfaceElevated, marginBottom: 16,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },

  card: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4, marginBottom: 16,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: colors.placeholder, letterSpacing: 1.2, marginBottom: 12 },

  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  routeInput: { flex: 1, fontSize: 15, fontWeight: '600', paddingVertical: 8 },
  routeDivider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: 4, marginLeft: 20 },
  locationFieldsWrap: { position: 'relative', paddingRight: 44 },
  swapBtn: {
  position: 'absolute',

  right: 0,
  top: 30,

  width: 36,
  height: 36,
  borderRadius: 18,

  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: colors.iconBg,
  borderWidth: 1.5,
  borderColor: colors.iconBorder,

  zIndex: 1000,
  elevation: 20,
},
  featuresCard: {
    backgroundColor: colors.subtleBg, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 20,
  },
  featureRow: { paddingVertical: 5 },
  featureText: { fontSize: 13, fontWeight: '500' },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },

  popularCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  popularName: { flex: 1, fontSize: 14, fontWeight: '700' },

  list: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },

  packageCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 24, padding: 16,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  packageCardActive: { borderColor: Colors.primary, borderWidth: 2, backgroundColor: colors.subtleBg },
  packageImage: { width: 72, height: 72, resizeMode: 'contain' },
  packageInfo: { flex: 1, gap: 3 },
  packageName: { fontSize: 16, fontWeight: '700' },
  packageDesc: { fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  helpersBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.iconBg, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, marginRight: 6,
  },
  helpersBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  etaText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  nightNote: { fontSize: 11, marginTop: 2 },
  fareArea: { alignItems: 'flex-end', gap: 8 },
  fareText: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  fareTextActive: { color: Colors.primary },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },

  footer: { paddingTop: 4, paddingBottom: 32, gap: 14 },

  packingCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: 24, padding: 16,
    borderWidth: 1.5, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  packingCardActive: { borderColor: Colors.primary, borderWidth: 2, backgroundColor: colors.subtleBg },
  packingImage: { width: 48, height: 48, resizeMode: 'contain' },
  packingInfo: { flex: 1, gap: 2 },
  packingTitle: { fontSize: 14, fontWeight: '700' },
  packingDesc: { fontSize: 12 },
  packingRight: { alignItems: 'flex-end', gap: 8 },
  packingPrice: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  checkbox: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1.5,
    borderColor: colors.iconBorder, backgroundColor: colors.inputBackground,
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },

  infoCard: {
    backgroundColor: colors.subtleBg, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  infoText: { fontSize: 12, lineHeight: 18 },
})
;