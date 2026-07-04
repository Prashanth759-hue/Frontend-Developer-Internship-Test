import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Check, Truck } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { Button } from '../../components/common/Button';
import { PickupScheduler } from '../../components/booking';
import { useBookingStore } from '../../store/bookingStore';
import { PACKAGING_OPTIONS, PackagingOptionId } from '../../constants/mockData';
import { getDayOptions, getSlotOptions, formatHourLabel, formatSlotRangeLabel } from '../../utils/scheduling';
import HOME_BG from '../../assets/bg/homeBg';

export default function ScheduleScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const { pickup, drop, selectedVehicle, tripMode, setScheduledSlot, setPackagingOption } =
    useBookingStore();

  const now = useMemo(() => new Date(), []);
  const days = useMemo(() => getDayOptions(now), [now]);
  const initialDay = useMemo(() => days.find((d) => d.hasAvailableSlots) ?? days[0], [days]);
  const initialSlots = useMemo(
    () => getSlotOptions(now, initialDay.offset).find((s) => !s.disabled)?.hour ?? null,
    [now, initialDay]
  );

  const [dayOffset, setDayOffset] = useState<number>(initialDay.offset);
  const [slotHour, setSlotHour] = useState<number | null>(initialSlots);
  const [packagingId, setPackagingId] = useState<PackagingOptionId>('none');

  const selectedDay = days.find((d) => d.offset === dayOffset) ?? days[0];
  const canContinue = dayOffset !== null && slotHour !== null && selectedDay.hasAvailableSlots;

  const handleContinue = () => {
    if (!canContinue || slotHour === null) return;

    setScheduledSlot({
      id: `${selectedDay.id}_slot_${slotHour}`,
      label: dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Tomorrow' : `${selectedDay.dayLabel}, ${selectedDay.dateLabel}`,
      desc: formatSlotRangeLabel(slotHour),
    });

    const pkg = PACKAGING_OPTIONS.find((p) => p.id === packagingId);
    setPackagingOption(pkg ? { id: pkg.id, label: pkg.label, price: pkg.price } : null);

    if (tripMode === 'within_city') {
      router.push('/(booking)/fare');
    } else {
      router.push('/(booking)/review-booking');
    }
  };

  return (
    <ImageBackground source={HOME_BG} style={styles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        {/* ── Hero Header ── */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Schedule Pickup</Text>
              <Text style={styles.heroSubtitle} numberOfLines={1}>
                {pickup?.address ?? '—'} → {drop?.address ?? '—'}
              </Text>
            </View>
          </View>

          {selectedVehicle && (
            <View style={styles.chipsRow}>
              <View style={styles.chip}>
                <Truck size={12} color="#FF6B00" />
                <Text style={styles.chipText}>{selectedVehicle.replace(/_/g, ' ')}</Text>
              </View>
            </View>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <PickupScheduler
              dayOffset={dayOffset}
              onSelectDayOffset={setDayOffset}
              slotHour={slotHour}
              onSelectSlotHour={setSlotHour}
              packagingId={packagingId}
              onSelectPackaging={setPackagingId}
            />
          </View>

          {/* Selected summary */}
          {canContinue && slotHour !== null && (
            <View style={styles.selectedSummary}>
              <Check size={16} color="#16A34A" />
              <Text style={styles.selectedSummaryText}>
                {dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Tomorrow' : `${selectedDay.dayLabel}, ${selectedDay.dateLabel}`} ·{' '}
                <Text style={{ fontWeight: '800' }}>{formatHourLabel(slotHour)}</Text>
                {packagingId !== 'none' && (
                  <Text> · {PACKAGING_OPTIONS.find((p) => p.id === packagingId)?.label}</Text>
                )}
              </Text>
            </View>
          )}

          <Button
            label={t('confirm')}
            onPress={handleContinue}
            disabled={!canContinue}
            style={styles.continueBtn}
            accessibilityLabel="Continue to payment"
          />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },

  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: colors.surfaceElevated,
    marginBottom: 16, gap: 12,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00', textTransform: 'capitalize' },

  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 14, paddingTop: 4 },

  card: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.06, shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },

  selectedSummary: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surfaceElevated, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  selectedSummaryText: { fontSize: 13, color: '#166534', flex: 1 },

  continueBtn: { width: '100%', marginTop: 8 },
});