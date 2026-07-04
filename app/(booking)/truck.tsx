import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { useBookingStore } from '../../store/bookingStore';

const OPTION_IMAGES: Record<string, ImageSourcePropType> = {
  within_city:  require('../../assets/images/icon-handtruck.png'),
  inter_cities: require('../../assets/images/icon-signpost.png'),
};

const TRUCK_OPTIONS = [
  {
    id: 'within_city',
    titleKey: 'truckWithinCity',
    descKey: 'truckWithinCityDesc',
    tag: 'Local · Same Day',
  },
  {
    id: 'inter_cities',
    titleKey: 'truckInterCities',
    descKey: 'truckInterCitiesDesc',
    tag: 'City to City · Per KM',
  },
] as const;

export default function TruckScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { setServiceType, setTripMode } = useBookingStore();

  const handlePress = (id: (typeof TRUCK_OPTIONS)[number]['id']) => {
    setServiceType('heavy_cargo');
    if (id === 'within_city') {
      setTripMode('within_city');
      router.push('/(booking)/pickup');
    } else {
      setTripMode('inter_cities');
      router.push('/(booking)/truck-intercity');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/home-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
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
              <Text style={styles.heroTitle}>{t('truckTitle')}</Text>
              <Text style={styles.heroSubtitle}>{t('truckSubtitle')}</Text>
            </View>
          </View>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipText}>💡 Fuel & tolls included</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>🚚 Doorstep loading</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>📍 Live tracking</Text></View>
          </View>
        </View>

        <FlatList
          data={TRUCK_OPTIONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => handlePress(item.id)}
              accessibilityLabel={`Select ${t(item.titleKey as any)}`}
              activeOpacity={0.85}
            >
              <Image source={OPTION_IMAGES[item.id]} style={styles.optionImage} />

              <View style={styles.optionInfo}>
                <Text style={[styles.optionName, { color: colors.textPrimary }]}>
                  {t(item.titleKey as any)}
                </Text>
                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                  {t(item.descKey as any)}
                </Text>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{item.tag}</Text>
                </View>
              </View>

              <ChevronRight size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1 },

  heroHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFD6B3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: '#666', fontWeight: '500', marginTop: 2 },

  list: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },

  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFE8D6',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  optionImage: { width: 64, height: 64, resizeMode: 'contain' },
  optionInfo: { flex: 1, gap: 3 },
  optionName: { fontSize: 16, fontWeight: '700' },
  optionDesc: { fontSize: 12 },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD6B3',
    marginTop: 4,
  },
  tagText: { fontSize: 10, fontWeight: '700', color: '#FF6B00' },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },
});
