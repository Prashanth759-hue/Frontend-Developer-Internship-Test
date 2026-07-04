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
import { useLanguage } from '../../theme/LanguageContext';
import { useBookingStore } from '../../store/bookingStore';
import { useComingSoon } from '../../components/common/ComingSoonModal';
import HOME_BG from '../../assets/bg/homeBg';

const OPTION_IMAGES: Record<string, ImageSourcePropType> = {
  same_city:  require('../../assets/images/icon-handtruck.png'),
  inter_city: require('../../assets/images/icon-signpost.png'),
  express:    require('../../assets/images/icon-road.png'),
};

const PARCEL_OPTIONS = [
  {
    id: 'same_city',
    titleKey: 'parcelSameCity',
    descKey: 'parcelSameCityDesc',
    tagKey: 'tagSameDay',
    live: true,
    route: '/(booking)/pickup' as const,
    serviceType: 'parcel' as const,
  },
  {
    id: 'inter_city',
    titleKey: 'parcelInterCity',
    descKey: 'parcelInterCityDesc',
    tagKey: 'tagCityToCityKg',
    live: true,
    route: '/(booking)/parcel-intercity' as const,
    serviceType: 'courier' as const,
  },
  {
    id: 'express',
    titleKey: 'parcelExpress',
    descKey: 'parcelExpressDesc',
    tagKey: 'tagUnder2Hours',
    live: true,
    route: '/(booking)/parcel-express' as const,
    serviceType: 'parcel' as const,
  },
] as const;

export default function ParcelScreen() {
  const { colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const { setServiceType } = useBookingStore();
  const { show: showComingSoon, modal } = useComingSoon();

  return (
    <ImageBackground
      source={HOME_BG}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{t('parcelTitle')}</Text>
              <Text style={styles.heroSubtitle}>{t('parcelSubtitle')}</Text>
            </View>
          </View>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipText}>{t('parcelFastDelivery')}</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>{t('parcelLiveTracking')}</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>{t('parcelSafeInsured')}</Text></View>
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
                if (!item.live) { showComingSoon(t(item.titleKey as any)); return; }
                setServiceType(item.serviceType);
                router.push(item.route!);
              }}
              activeOpacity={0.85}
            >
              <Image source={OPTION_IMAGES[item.id]} style={styles.optionImage} />
              <View style={styles.optionInfo}>
                <Text style={[styles.optionName, { color: colors.textPrimary }]}>{t(item.titleKey as any)}</Text>
                <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>{t(item.descKey as any)}</Text>
                {item.live ? (
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{t(item.tagKey as any)}</Text>
                  </View>
                ) : (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>{t('comingSoon')}</Text>
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

const makeStyles = (colors: any) => StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  safe: { flex: 1, backgroundColor: 'transparent' },
  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: colors.surfaceElevated, marginBottom: 16,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
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
  optionInfo: { flex: 1, gap: 4 },
  optionName: { fontSize: 16, fontWeight: '700' },
  optionDesc: { fontSize: 12 },
  tagBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.iconBg, paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: colors.iconBorder, marginTop: 2,
  },
  tagText: { fontSize: 10, fontWeight: '700', color: '#FF6B00' },
  comingSoonBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.divider, paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: colors.border, marginTop: 2,
  },
  comingSoonText: { fontSize: 10, fontWeight: '700', color: colors.placeholder },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },
})
;