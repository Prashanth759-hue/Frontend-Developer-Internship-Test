import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, ImageBackground, ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useBookingStore } from '../../store/bookingStore';
import { useComingSoon } from '../../components/common/ComingSoonModal';

const OPTION_IMAGES: Record<string, ImageSourcePropType> = {
  same_city:  require('../../assets/images/icon-handtruck.png'),
  inter_city: require('../../assets/images/icon-signpost.png'),
  express:    require('../../assets/images/icon-road.png'),
};

const PARCEL_OPTIONS = [
  {
    id: 'same_city',
    title: 'Same City',
    desc: 'Deliver a parcel within the city today',
    tag: 'Same Day · Local',
    live: true,
    route: '/(booking)/pickup' as const,
    serviceType: 'parcel' as const,
  },
  {
    id: 'inter_city',
    title: 'Inter City',
    desc: 'Send parcels to another city',
    tag: 'City to City · Per KG',
    live: true,
    route: '/(booking)/parcel-intercity' as const,
    serviceType: 'courier' as const,
  },
  {
    id: 'express',
    title: 'Express Delivery',
    desc: 'Priority same-day delivery',
    tag: 'Under 2 Hours',
    live: true,
    route: '/(booking)/parcel-express' as const,
    serviceType: 'parcel' as const,
  },
];

export default function ParcelScreen() {
  const { colors } = useTheme();
  const { setServiceType } = useBookingStore();
  const { show: showComingSoon, modal } = useComingSoon();

  return (
    <ImageBackground
      source={require('../../assets/images/home-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Parcel</Text>
              <Text style={styles.heroSubtitle}>Choose your delivery type</Text>
            </View>
          </View>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipText}>📦 Fast delivery</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>📍 Live tracking</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>🔒 Safe & insured</Text></View>
          </View>
        </View>

        <FlatList
          data={PARCEL_OPTIONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => {
                if (!item.live) { showComingSoon(item.title); return; }
                setServiceType(item.serviceType);
                router.push(item.route!);
              }}
              activeOpacity={0.85}
            >
              <Image source={OPTION_IMAGES[item.id]} style={styles.optionImage} />
              <View style={styles.optionInfo}>
                <Text style={[styles.optionName, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                {item.live ? (
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{item.tag}</Text>
                  </View>
                ) : (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                )}
              </View>
              <ChevronRight size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      </SafeAreaView>
      {modal}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 16,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#FFD6B3', justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: '#666', fontWeight: '500', marginTop: 2 },
  list: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 24,
    padding: 16, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  optionImage: { width: 64, height: 64, resizeMode: 'contain' },
  optionInfo: { flex: 1, gap: 4 },
  optionName: { fontSize: 16, fontWeight: '700' },
  optionDesc: { fontSize: 12 },
  tagBadge: {
    alignSelf: 'flex-start', backgroundColor: '#FFF0E6', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: '#FFD6B3', marginTop: 2,
  },
  tagText: { fontSize: 10, fontWeight: '700', color: '#FF6B00' },
  comingSoonBadge: {
    alignSelf: 'flex-start', backgroundColor: '#F3F4F6', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 2,
  },
  comingSoonText: { fontSize: 10, fontWeight: '700', color: '#9CA3AF' },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },
});