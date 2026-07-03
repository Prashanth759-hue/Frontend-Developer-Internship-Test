import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ImageBackground, Image, ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Clock, Check, Users } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { Button } from '../../components/common/Button';
import { useBookingStore, type ServiceType } from '../../store/bookingStore';
import { MOCK_VEHICLES } from '../../constants/mockData';
import HOME_BG from '../../assets/bg/homeBg';

const VEHICLE_IMAGES: Record<string, ImageSourcePropType> = {
  bike:   require('../../assets/images/bike-rider.png'),
  scooty: require('../../assets/images/scooty.png'),
  auto:   require('../../assets/images/auto.png'),
  car:    require('../../assets/images/car.png'),
  car_xl: require('../../assets/images/car-xl.png'),
};

export default function VehicleScreen() {
  const { colors, isDark } = useTheme();
  const s = makeStyles(colors);
  const { t } = useLanguage();
  const { pickup, drop, selectedVehicle, setSelectedVehicle, setEstimatedFare, setServiceType } =
    useBookingStore();

  const [selected, setSelected] = useState<string | null>(selectedVehicle);

  const handleSelect = (id: string) => {
    const v = MOCK_VEHICLES.find((v) => v.id === id);
    if (!v) return;
    setSelected(id);
    setSelectedVehicle(id);
    setEstimatedFare(v.fare);
    setServiceType(v.serviceType as ServiceType);
  };

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
              <Text style={s.heroTitle}>{t('chooseVehicle')}</Text>
              <Text style={s.heroSub} numberOfLines={1}>
                {pickup?.address ?? '—'} → {drop?.address ?? '—'}
              </Text>
            </View>
          </View>

          {/* Route mini-summary */}
          <View style={s.routeCard}>
            <View style={s.routeRow}>
              <View style={[s.dot, { backgroundColor: Colors.primary }]} />
              <Text style={[s.routeAddr, { color: colors.textPrimary }]} numberOfLines={1}>
                {pickup?.address ?? '—'}
              </Text>
            </View>
            <View style={s.routeDiv} />
            <View style={s.routeRow}>
              <View style={[s.dot, { backgroundColor: Colors.danger }]} />
              <Text style={[s.routeAddr, { color: colors.textPrimary }]} numberOfLines={1}>
                {drop?.address ?? '—'}
              </Text>
            </View>
          </View>

          <View style={s.chipsRow}>
            <View style={s.chip}><Text style={s.chipText}>🏍️ Fastest pickup</Text></View>
            <View style={s.chip}><Text style={s.chipText}>💰 Best fare</Text></View>
            <View style={s.chip}><Text style={s.chipText}>📍 Live tracking</Text></View>
          </View>
        </View>

        {/* ── Vehicle list ── */}
        <FlatList
          data={MOCK_VEHICLES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = selected === item.id;
            return (
              <TouchableOpacity
                style={[s.card, isActive && s.cardActive]}
                onPress={() => handleSelect(item.id)}
                accessibilityLabel={`Select ${item.name}, ₹${item.fare}, ETA ${item.eta}`}
                activeOpacity={0.85}
              >
                <Image
                  source={VEHICLE_IMAGES[item.icon] ?? VEHICLE_IMAGES.car}
                  style={s.vehicleImg}
                />

                <View style={s.info}>
                  <View style={s.nameRow}>
                    <Text style={[s.vehicleName, { color: colors.textPrimary }]}>{item.name}</Text>
                    {!!item.tag && (
                      <View style={s.tag}>
                        <Text style={s.tagText}>{item.tag}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[s.vehicleDesc, { color: colors.textSecondary }]}>{item.description}</Text>
                  <View style={s.metaRow}>
                    <View style={s.metaChip}>
                      <Clock size={11} color={Colors.primary} />
                      <Text style={s.metaText}>{item.eta}</Text>
                    </View>
                    <View style={s.metaChip}>
                      <Users size={11} color={Colors.primary} />
                      <Text style={s.metaText}>{item.capacity}</Text>
                    </View>
                  </View>
                </View>

                <View style={s.fareArea}>
                  <Text style={[s.fare, isActive && s.fareActive]}>₹{item.fare}</Text>
                  {isActive ? (
                    <View style={s.checkCircle}>
                      <Check size={12} color="#fff" />
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListFooterComponent={
            <View style={s.footer}>
              <Button
                label={t('confirmVehicle')}
                onPress={() => router.push('/(booking)/fare')}
                disabled={!selected}
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

  hero: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    backgroundColor: colors.surfaceElevated, marginBottom: 16,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSub: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },

  routeCard: {
    backgroundColor: colors.surface, borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: colors.iconBorder, gap: 6, marginBottom: 12,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  routeDiv: { height: 1, backgroundColor: colors.cardBorder, marginLeft: 18 },
  routeAddr: { flex: 1, fontSize: 13, fontWeight: '500' },

  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },

  list: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 24, padding: 16,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  cardActive: {
    borderColor: Colors.primary, borderWidth: 2,
    backgroundColor: colors.subtleBg ?? colors.iconBg,
  },
  vehicleImg: { width: 68, height: 68, resizeMode: 'contain' },

  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vehicleName: { fontSize: 16, fontWeight: '800' },
  tag: {
    backgroundColor: colors.iconBg, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: colors.iconBorder,
  },
  tagText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  vehicleDesc: { fontSize: 12, fontWeight: '500' },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '600', color: Colors.primary },

  fareArea: { alignItems: 'flex-end', gap: 8 },
  fare: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  fareActive: { color: Colors.primary },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },

  footer: { paddingTop: 8, paddingBottom: 32 },
});