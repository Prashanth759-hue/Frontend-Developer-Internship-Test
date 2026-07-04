/**
 * Vahan360 — Home Screen
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { Bell, Search, MapPin, ChevronDown, Zap, Shield, Star, Tag } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Layout, BorderRadius, Shadow, Spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { useMapPickerStore } from '../../store/mapPickerStore';
import { useComingSoon } from '../../components/common/ComingSoonModal';
import { LocationPermissionModal } from '../../components/common/LocationPermissionModal';
import { LocationDeniedFallback } from '../../components/common/LocationDeniedFallback';
import { useLocation } from '../../hooks/useLocation';
import { BannerCarousel } from '../../components/home/BannerCarousel';
import { LocationCard } from '../../components/home/LocationCard';
import { RecentBookings, SERVICE_TYPE_MAP } from '../../components/home/RecentBookings';
import { MOCK_ORDERS, MOCK_NOTIFICATIONS } from '../../constants/mockData';
import { ServiceType } from '../../store/bookingStore';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const { setPickup, setDrop, setServiceType } = useBookingStore();
  const { result: mapResult, clearResult } = useMapPickerStore();
  const { show: showComingSoon, modal } = useComingSoon();
  const {
    locationLabel,
    permissionStatus,
    needsRationale,
    confirmRationale,
    dismissRationale,
  } = useLocation();
  const [homeLocation, setHomeLocation] = useState('Bengaluru');
  const [hasManualLocation, setHasManualLocation] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (mapResult && mapResult.fieldKey === 'homeLocation') {
        setHomeLocation(mapResult.address);
        setHasManualLocation(true);
        clearResult();
      }
    }, [mapResult])
  );

  // Once GPS resolves a real address, use it as the displayed location —
  // unless the user has already manually picked one via the map picker.
  useEffect(() => {
    if (!hasManualLocation && locationLabel && locationLabel !== 'Your Location') {
      setHomeLocation(locationLabel);
    }
  }, [locationLabel, hasManualLocation]);

  // When the user taps "Enter Address Manually" on the denied-permission
  // fallback, send them to the map picker so they can search/select an
  // address with a clear instruction, rather than leaving them stuck.
  useEffect(() => {
    if (showManualEntry) {
      setShowManualEntry(false);
      router.push({
        pathname: '/map-picker',
        params: { fieldKey: 'homeLocation', currentValue: homeLocation },
      });
    }
  }, [showManualEntry, homeLocation]);

  const firstName = user?.name?.trim().split(' ')[0] ?? 'there';
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  const handleSavedAddress = useCallback(
    (addr: { label: string; address: string }) => {
      // Reuse the favorite as the drop location and head straight into
      // the booking flow — this is what makes a "favorite" actually
      // reusable, rather than just a bookmark you can look at.
      setServiceType('bike_taxi');
      setDrop({ label: addr.label, address: addr.address });
      router.push('/(booking)/pickup');
    },
    [setServiceType, setDrop]
  );

  const handleAddNewAddress = useCallback(() => {
    router.push('/saved-addresses');
  }, []);

  const handleRebook = useCallback(
    (order: (typeof MOCK_ORDERS)[0]) => {
      setPickup({ label: 'Pickup', address: order.pickup });
      setDrop({ label: 'Drop', address: order.drop });
      const svcType = SERVICE_TYPE_MAP[order.service] as ServiceType | undefined;
      if (svcType) setServiceType(svcType);
      // Route to the right flow
      if (svcType === 'heavy_cargo') {
        router.push('/(booking)/truck');
      } else if (svcType === 'packers_movers') {
        router.push('/(booking)/packers-movers');
      } else {
        router.push('/(booking)/pickup');
      }
    },
    [setPickup, setDrop, setServiceType]
  );

  return (
    <ImageBackground
      source={require('../../assets/images/home-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {modal}
        <LocationPermissionModal
          visible={needsRationale}
          onAllow={confirmRationale}
          onDeny={dismissRationale}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* ─── Hero Header ─────────────────────────────── */}
          <View style={styles.heroGradient}>
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
            <View style={styles.decorCircle3} />

            {/* Top bar */}
            <View style={styles.topBar}>
              <View style={styles.greetingCol}>
                <Text style={styles.welcomeLabel}>{t('welcomeBack')}</Text>
                <Text style={styles.greeting}>{t('hi')}, {firstName}</Text>
                <TouchableOpacity
                  style={styles.locationPill}
                  onPress={() => router.push({ pathname: '/map-picker', params: { fieldKey: 'homeLocation', currentValue: homeLocation } })}
                >
                  <MapPin size={13} color="#FF6B00" />
                  <Text style={styles.locationText} numberOfLines={1}>{homeLocation}</Text>
                  <ChevronDown size={13} color="#FF6B00" />
                </TouchableOpacity>
              </View>

              <View style={styles.topActions}>
                {/* Offers button */}
                <TouchableOpacity
                  style={styles.topActionBtn}
                  onPress={() => router.push('/(main)/offers')}
                >
                  <Tag size={18} color={Colors.primary} />
                </TouchableOpacity>

                {/* Notifications button */}
                <TouchableOpacity
                  style={styles.notificationButton}
                  onPress={() => router.push('/(main)/notifications')}
                >
                  <Bell size={20} color={Colors.primary} />
                  {unreadCount > 0 && <View style={styles.bellDot} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Hero tagline */}
            <View style={styles.heroTagline}>
              <Text style={styles.heroTitle}>{t('heroLine1')}</Text>
              <Text style={styles.heroTitle}>{t('heroLine2')}</Text>
              <View style={styles.trustPills}>
                <View style={styles.trustPill}>
                  <Zap size={11} color="#FF6B00" />
                  <Text style={styles.trustPillText}>{t('trustFast')}</Text>
                </View>
                <View style={styles.trustPill}>
                  <Shield size={11} color="#FF6B00" />
                  <Text style={styles.trustPillText}>{t('trustSafe')}</Text>
                </View>
                <View style={styles.trustPill}>
                  <Star size={11} color="#FF6B00" />
                  <Text style={styles.trustPillText}>{t('trustRated')}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ─── Location permission denied — manual entry fallback ── */}
          {/* UX-HOME-009: never leave the user with no path forward when
              location access isn't available. */}
          {permissionStatus === 'denied' && !hasManualLocation && (
            <View style={styles.locationFallbackWrap}>
              <LocationDeniedFallback
                compact
                title="Set your location manually"
                message="Location access is off, so we can't detect where you are. Enter your area to see nearby drivers and accurate fares."
                onEnterManually={() => setShowManualEntry(true)}
              />
            </View>
          )}

          {/* ─── Category Cards ──────────────────────────── */}
          <View style={styles.categoryRow}>
            {/* RIDE — sets serviceType to 'bike_taxi' as default, goes to pickup */}
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => {
                setServiceType('bike_taxi');
                router.push('/(booking)/pickup');
              }}
            >
              <Image source={require('../../assets/images/Ride.png')} style={styles.categoryImage} />
              <Text style={styles.categoryTitle}>{t('categoryRide')}</Text>
            </TouchableOpacity>

            {/* TRUCK — goes to truck sub-options */}
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => {
                setServiceType('heavy_cargo');
                router.push('/(booking)/truck');
              }}
            >
              <Image source={require('../../assets/images/truck.png')} style={styles.categoryImage} />
              <Text style={styles.categoryTitle}>{t('categoryTruck')}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.categoryRow, { marginTop: 16 }]}>
            {/* PACKERS & MOVERS — goes to packers-movers sub-options */}
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => {
                setServiceType('packers_movers');
                router.push('/(booking)/packers-movers');
              }}
            >
              <Image source={require('../../assets/images/Packers-Movers.png')} style={styles.categoryImage} />
              <Text style={styles.categoryTitle}>{t('categoryPackersMovers')}</Text>
            </TouchableOpacity>

            {/* PARCEL — goes to parcel sub-options */}
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => {
                setServiceType('parcel');
                router.push('/(booking)/parcel');
              }}
            >
              <Image source={require('../../assets/images/parcel.png')} style={styles.categoryImage} />
              <Text style={styles.categoryTitle}>{t('categoryParcel')}</Text>
            </TouchableOpacity>
          </View>

          {/* ─── Promo Banner Carousel ───────────────────── */}
          <BannerCarousel onPress={() => router.push('/(main)/offers')} />

          {/* ─── Saved Places ────────────────────────────── */}
          <LocationCard
            onSelect={handleSavedAddress}
            onAddNew={handleAddNewAddress}
          />
          
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1 },
  scroll: { gap: Spacing.lg, paddingBottom: 20 },
  locationFallbackWrap: { paddingHorizontal: 16 },

  heroGradient: {
    paddingTop: 16, paddingBottom: 36, paddingHorizontal: 20,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  decorCircle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: -40,
  },
  decorCircle2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)', bottom: -20, left: 40,
  },
  decorCircle3: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)', top: 60, right: 100,
  },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greetingCol: { flex: 1, paddingRight: 12, gap: 4 },
  welcomeLabel: { fontSize: 13, color: '#666', fontWeight: '500' },
  greeting: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.5 },
  locationPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start',
    marginTop: 4, borderWidth: 1, borderColor: '#FF6B00',
  },
  locationText: { fontSize: 12, color: '#333', fontWeight: '500' },
  topActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  topActionBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  notificationButton: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  bellDot: {
    position: 'absolute', top: 9, right: 9, width: 9, height: 9,
    borderRadius: 5, backgroundColor: '#D32F2F', borderWidth: 2, borderColor: '#FFF',
  },
  heroTagline: { marginTop: 22, gap: 4 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.3, lineHeight: 30 },
  trustPills: { flexDirection: 'row', gap: 8, marginTop: 12 },
  trustPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderColor: '#FF6B00',
  },
  trustPillText: { fontSize: 12, fontWeight: '700', color: '#FF6B00' },
  searchIconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  searchHint: { flex: 1, fontSize: 15, color: '#9CA3AF', fontWeight: '400' },
  searchArrow: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF0E6',
    justifyContent: 'center', alignItems: 'center',
  },

  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  categoryCard: {
    width: '48%', backgroundColor: '#FFF', borderRadius: 24, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#FF6B00',
  },
  categoryImage: { width: 180, height: 100, resizeMode: 'contain' },
  categoryTitle: { marginTop: 10, fontSize: 18, fontWeight: '700', color: '#222' },
});
