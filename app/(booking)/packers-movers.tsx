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
import HOME_BG from '../../assets/bg/homeBg';

const OPTION_IMAGES: Record<string, ImageSourcePropType> = {
  within_city:    require('../../assets/images/icon-handtruck.png'),
  mini_truck:     require('../../assets/images/icon-mini-truck.png'),
  between_cities: require('../../assets/images/icon-map-route.png'),
};

const SHIFTING_OPTIONS = [
  {
    id: 'within_city',
    titleKey: 'shiftingWithinCity',
    descKey: 'shiftingWithinCityDesc',
    tagKey: 'tagLocalFullPacking',
    live: true,
    route: '/(booking)/pickup' as const,
  },
  {
    id: 'mini_truck',
    titleKey: 'shiftingMiniTruck',
    descKey: 'shiftingMiniTruckDesc',
    tagKey: 'tagLightShifting',
    live: true,
    route: '/(booking)/movers-mini-truck' as const,
  },
  {
    id: 'between_cities',
    titleKey: 'shiftingBetweenCities',
    descKey: 'shiftingBetweenCitiesDesc',
    tagKey: 'tagCityToCityIntercity',
    live: true,
    route: '/(booking)/pickup' as const,
  },
] as const;

export default function PackersMoversScreen() {
  const { colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const { setServiceType, setMoversFlow } = useBookingStore();

  return (
    <ImageBackground
      source={HOME_BG}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{t('packersMoversTitle')}</Text>
              <Text style={styles.heroSubtitle}>{t('packersMoversSubtitle')}</Text>
            </View>
          </View>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipText}>{t('chipHassleFree')}</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>{t('chipFullPacking')}</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>{t('chipInsuredMove')}</Text></View>
          </View>
        </View>

        <FlatList
          data={SHIFTING_OPTIONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => {
                setServiceType('packers_movers');
                setMoversFlow(item.id as 'within_city' | 'mini_truck' | 'between_cities');
                router.push(item.route);
              }}
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
                  <Text style={styles.tagText}>{t(item.tagKey as any)}</Text>
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

const makeStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1 },
  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: colors.surfaceElevated, marginBottom: 16,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  list: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 24,
    padding: 16, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  optionImage: { width: 64, height: 64, resizeMode: 'contain' },
  optionInfo: { flex: 1, gap: 3 },
  optionName: { fontSize: 16, fontWeight: '700' },
  optionDesc: { fontSize: 12 },
  tagBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.iconBg, paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: colors.iconBorder, marginTop: 4,
  },
  tagText: { fontSize: 10, fontWeight: '700', color: '#FF6B00' },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },
})
;