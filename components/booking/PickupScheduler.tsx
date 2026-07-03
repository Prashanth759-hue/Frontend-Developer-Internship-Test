import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CalendarDays, Clock3, Check, PackageX, PackageCheck, PackagePlus, AlertCircle } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { PACKAGING_OPTIONS, PackagingOptionId } from '../../constants/mockData';
import {
  getDayOptions,
  getSlotOptions,
  formatHourLabel,
} from '../../utils/scheduling';

const PACKAGING_ICONS: Record<PackagingOptionId, React.ComponentType<any>> = {
  none: PackageX,
  single_layer: PackageCheck,
  multi_layer: PackagePlus,
};

interface PickupSchedulerProps {
  dayOffset: number | null;
  onSelectDayOffset: (offset: number) => void;
  slotHour: number | null;
  onSelectSlotHour: (hour: number) => void;
  packagingId: PackagingOptionId;
  onSelectPackaging: (id: PackagingOptionId) => void;
}

export function PickupScheduler({
  dayOffset,
  onSelectDayOffset,
  slotHour,
  onSelectSlotHour,
  packagingId,
  onSelectPackaging,
}: PickupSchedulerProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const now = useMemo(() => new Date(), []);
  const days = useMemo(() => getDayOptions(now), [now]);
  const activeOffset = dayOffset ?? 0;
  const slots = useMemo(() => getSlotOptions(now, activeOffset), [now, activeOffset]);
  const activeDay = days.find((d) => d.offset === activeOffset);

  return (
    <View style={{ gap: 16 }}>
      {/* ── Date strip ── */}
      <View>
        <View style={styles.sectionHeaderRow}>
          <CalendarDays size={16} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Pickup date</Text>
          <Text style={styles.sectionHint}>Up to 5 days ahead</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayStrip}
        >
          {days.map((day) => {
            const active = activeOffset === day.offset;
            const disabled = !day.hasAvailableSlots;
            return (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.dayPill,
                  active && styles.dayPillActive,
                  disabled && styles.dayPillDisabled,
                ]}
                onPress={() => {
                  if (disabled) return;
                  onSelectDayOffset(day.offset);
                  // Reset an out-of-range slot when hopping between days.
                  const newSlots = getSlotOptions(now, day.offset);
                  const stillValid = slotHour !== null && newSlots.some((s) => s.hour === slotHour && !s.disabled);
                  if (!stillValid) {
                    const firstOpen = newSlots.find((s) => !s.disabled);
                    if (firstOpen) onSelectSlotHour(firstOpen.hour);
                  }
                }}
                disabled={disabled}
                activeOpacity={0.85}
              >
                <Text style={[styles.dayPillLabel, active && styles.dayPillLabelActive, disabled && styles.dayPillLabelDisabled]}>
                  {day.dayLabel}
                </Text>
                <Text style={[styles.dayPillSub, active && styles.dayPillSubActive, disabled && styles.dayPillLabelDisabled]}>
                  {day.dateLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {activeDay && !activeDay.hasAvailableSlots && (
          <View style={styles.noticeRow}>
            <AlertCircle size={13} color={Colors.warning} />
            <Text style={styles.noticeText}>No slots left for today — pick another date.</Text>
          </View>
        )}
      </View>

      {/* ── Time slots ── */}
      <View>
        <View style={styles.sectionHeaderRow}>
          <Clock3 size={16} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Pickup window</Text>
          <Text style={styles.sectionHint}>6 AM – 6 PM</Text>
        </View>
        <View style={styles.slotGrid}>
          {slots.map((slot) => {
            const active = slotHour === slot.hour;
            return (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotChip,
                  active && styles.slotChipActive,
                  slot.disabled && styles.slotChipDisabled,
                ]}
                onPress={() => !slot.disabled && onSelectSlotHour(slot.hour)}
                disabled={slot.disabled}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.slotChipText,
                    active && styles.slotChipTextActive,
                    slot.disabled && styles.slotChipTextDisabled,
                  ]}
                >
                  {formatHourLabel(slot.hour)}
                </Text>
                {active && <Check size={12} color={Colors.white} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Packaging add-on ── */}
      <View>
        <View style={styles.sectionHeaderRow}>
          <PackagePlus size={16} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Packaging</Text>
          <Text style={styles.sectionHint}>Optional</Text>
        </View>
        <View style={{ gap: 10 }}>
          {PACKAGING_OPTIONS.map((opt) => {
            const Icon = PACKAGING_ICONS[opt.id];
            const active = packagingId === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.packCard, active && styles.packCardActive]}
                onPress={() => onSelectPackaging(opt.id)}
                activeOpacity={0.85}
                accessibilityLabel={`Select ${opt.label}`}
                accessibilityState={{ selected: active }}
              >
                <View style={[styles.packIconWrap, active && styles.packIconWrapActive]}>
                  <Icon size={18} color={active ? Colors.white : Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.packLabel, active && styles.packLabelActive]}>{opt.label}</Text>
                  <Text style={styles.packSub}>{opt.subtitle}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Text style={[styles.packPrice, active && styles.packPriceActive]}>
                    {opt.price === 0 ? 'Free' : `+₹${opt.price}`}
                  </Text>
                  {active && (
                    <View style={styles.packCheckCircle}>
                      <Check size={10} color={Colors.white} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },
  sectionHint: { marginLeft: 'auto', fontSize: 11, fontWeight: '600', color: colors.placeholder },

  // Date strip
  dayStrip: { flexDirection: 'row', gap: 10, paddingBottom: 2, paddingRight: 4 },
  dayPill: {
    minWidth: 74, alignItems: 'center', gap: 4, paddingVertical: 14, paddingHorizontal: 12,
    borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.cardBorder,
  },
  dayPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayPillDisabled: { opacity: 0.4 },
  dayPillLabel: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },
  dayPillLabelActive: { color: colors.surface },
  dayPillLabelDisabled: { color: colors.placeholder },
  dayPillSub: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  dayPillSubActive: { color: 'rgba(255,255,255,0.85)' },

  noticeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  noticeText: { fontSize: 11, fontWeight: '600', color: Colors.warning },

  // Slot grid
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.cardBorder,
  },
  slotChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotChipDisabled: { opacity: 0.35 },
  slotChipText: { fontSize: 12.5, fontWeight: '700', color: colors.textPrimary },
  slotChipTextActive: { color: colors.surface },
  slotChipTextDisabled: { color: colors.placeholder },

  // Packaging cards
  packCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 14,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.cardBorder,
  },
  packCardActive: { borderColor: Colors.primary, backgroundColor: colors.subtleBg },
  packIconWrap: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.iconBg, justifyContent: 'center', alignItems: 'center',
  },
  packIconWrapActive: { backgroundColor: Colors.primary },
  packLabel: { fontSize: 13.5, fontWeight: '800', color: colors.textPrimary },
  packLabelActive: { color: Colors.primary },
  packSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2, lineHeight: 15 },
  packPrice: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },
  packPriceActive: { color: Colors.primary },
  packCheckCircle: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
});