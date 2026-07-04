import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Zap, Clock, Sun, Moon, Check, Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';

function addMinutes(base: Date, mins: number) {
  return new Date(base.getTime() + mins * 60_000);
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES_OPTIONS = [0, 15, 30, 45];
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ScheduleScreen() {
  const { colors } = useTheme();
  const { pickup, drop, selectedVehicle, scheduledSlot, tripMode, setScheduledSlot } = useBookingStore();

  const now = useMemo(() => new Date(), []);

  type PickerMode = 'quick' | 'custom';
  const [pickerMode, setPickerMode] = useState<PickerMode>('quick');

  // Quick slots
  const in20 = useMemo(() => addMinutes(now, 20), [now]);
  const in2h = useMemo(() => addMinutes(now, 120), [now]);
  const tomorrow = useMemo(() => addMinutes(now, 24 * 60), [now]);

  const SLOTS = useMemo(
    () => [
      { id: 'in_20_min',          label: 'In 20 mins',         desc: `Driver arrives by ~${formatTime(in20)}`,        icon: Zap },
      { id: 'in_2_hr',            label: 'In 2 hours',         desc: `Pickup around ${formatTime(in2h)}`,             icon: Clock },
      { id: 'today_this_time',    label: 'Today, this time',   desc: `Pickup today at ${formatTime(now)}`,            icon: Sun },
      { id: 'tomorrow_this_time', label: 'Tomorrow, this time', desc: `Pickup tomorrow at ${formatTime(tomorrow)}`,   icon: Moon },
    ],
    [now, in20, in2h, tomorrow]
  );

  const [selected, setSelected] = useState<string>(scheduledSlot?.id ?? SLOTS[0].id);

  // Custom date-time picker state
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState(now.getHours());
  const [selectedMinute, setSelectedMinute] = useState(MINUTES_OPTIONS[0]);

  // Build calendar days for current month view
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const days: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [calendarMonth, calendarYear]);

  const isPastDay = (day: number) => {
    const d = new Date(calendarYear, calendarMonth, day);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d < today;
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear((y) => y - 1); }
    else setCalendarMonth((m) => m - 1);
  };
  const handleNextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear((y) => y + 1); }
    else setCalendarMonth((m) => m + 1);
  };

  const getCustomLabel = () => {
    if (!selectedDate) return null;
    const h = selectedHour % 12 === 0 ? 12 : selectedHour % 12;
    const m = selectedMinute.toString().padStart(2, '0');
    const ampm = selectedHour < 12 ? 'AM' : 'PM';
    return `${formatDate(selectedDate)} at ${h}:${m} ${ampm}`;
  };

  const handleContinue = () => {
    if (pickerMode === 'quick') {
      const chosen = SLOTS.find((s) => s.id === selected);
      if (!chosen) return;
      setScheduledSlot({ id: chosen.id, label: chosen.label, desc: chosen.desc });
    } else {
      const label = getCustomLabel();
      if (!label) return;
      setScheduledSlot({ id: 'custom', label: 'Scheduled Pickup', desc: label });
    }

    if (tripMode === 'within_city') {
      router.push('/(booking)/fare');
    } else {
      router.push('/(booking)/review-booking');
    }
  };

  const canContinue = pickerMode === 'quick' || (pickerMode === 'custom' && selectedDate !== null);

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
              <Text style={styles.heroTitle}>Schedule Pickup</Text>
              <Text style={styles.heroSubtitle} numberOfLines={1}>
                {pickup?.address ?? '—'} → {drop?.address ?? '—'}
              </Text>
            </View>
          </View>

          {selectedVehicle && (
            <View style={styles.chipsRow}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  🚚 {selectedVehicle.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
          )}

          {/* Mode toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeBtn, pickerMode === 'quick' && styles.modeBtnActive]}
              onPress={() => setPickerMode('quick')}
            >
              <Zap size={14} color={pickerMode === 'quick' ? '#FFFFFF' : Colors.primary} />
              <Text style={[styles.modeBtnText, pickerMode === 'quick' && styles.modeBtnTextActive]}>Quick</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, pickerMode === 'custom' && styles.modeBtnActive]}
              onPress={() => setPickerMode('custom')}
            >
              <Calendar size={14} color={pickerMode === 'custom' ? '#FFFFFF' : Colors.primary} />
              <Text style={[styles.modeBtnText, pickerMode === 'custom' && styles.modeBtnTextActive]}>Custom Date & Time</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {pickerMode === 'quick' ? (
            <>
              <Text style={styles.sectionTitle}>When do you need the vehicle?</Text>
              {SLOTS.map((slot) => {
                const Icon = slot.icon;
                const isActive = selected === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[styles.slotCard, isActive && styles.slotCardActive]}
                    onPress={() => setSelected(slot.id)}
                    activeOpacity={0.85}
                    accessibilityLabel={`Select ${slot.label}`}
                    accessibilityState={{ selected: isActive }}
                  >
                    <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                      <Icon size={20} color={isActive ? Colors.white : Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.slotLabel, { color: colors.textPrimary }, isActive && styles.slotLabelActive]}>
                        {slot.label}
                      </Text>
                      <Text style={[styles.slotDesc, { color: colors.textSecondary }]}>{slot.desc}</Text>
                    </View>
                    {isActive && (
                      <View style={styles.checkCircle}>
                        <Check size={12} color={Colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Pick a date & time</Text>

              {/* Calendar */}
              <View style={styles.calendarCard}>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity onPress={handlePrevMonth} style={styles.calNavBtn}>
                    <ChevronLeft size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.calMonthLabel}>
                    {MONTHS[calendarMonth]} {calendarYear}
                  </Text>
                  <TouchableOpacity onPress={handleNextMonth} style={styles.calNavBtn}>
                    <ChevronRight size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>

                {/* Day labels */}
                <View style={styles.calDayRow}>
                  {DAYS_OF_WEEK.map((d) => (
                    <Text key={d} style={styles.calDayLabel}>{d}</Text>
                  ))}
                </View>

                {/* Calendar grid */}
                <View style={styles.calGrid}>
                  {calendarDays.map((day, idx) => {
                    if (!day) return <View key={`empty-${idx}`} style={styles.calCell} />;
                    const past = isPastDay(day);
                    const thisDate = new Date(calendarYear, calendarMonth, day);
                    const isSelected =
                      selectedDate &&
                      selectedDate.getDate() === day &&
                      selectedDate.getMonth() === calendarMonth &&
                      selectedDate.getFullYear() === calendarYear;
                    const isToday =
                      now.getDate() === day &&
                      now.getMonth() === calendarMonth &&
                      now.getFullYear() === calendarYear;
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.calCell,
                          isToday && styles.calCellToday,
                          isSelected && styles.calCellSelected,
                          past && styles.calCellPast,
                        ]}
                        onPress={() => !past && setSelectedDate(thisDate)}
                        disabled={past}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.calCellText,
                            isToday && styles.calCellTodayText,
                            isSelected && styles.calCellSelectedText,
                            past && styles.calCellPastText,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Time picker */}
              <View style={styles.calendarCard}>
                <Text style={styles.timePickerTitle}>Select Time</Text>

                <Text style={styles.timePickerSection}>Hour</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeRow}>
                  {HOURS.map((h) => {
                    const label = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
                    const active = selectedHour === h;
                    return (
                      <TouchableOpacity
                        key={h}
                        style={[styles.timeChip, active && styles.timeChipActive]}
                        onPress={() => setSelectedHour(h)}
                      >
                        <Text style={[styles.timeChipText, active && styles.timeChipTextActive]}>{label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text style={styles.timePickerSection}>Minute</Text>
                <View style={styles.minuteRow}>
                  {MINUTES_OPTIONS.map((m) => {
                    const active = selectedMinute === m;
                    return (
                      <TouchableOpacity
                        key={m}
                        style={[styles.minuteChip, active && styles.timeChipActive]}
                        onPress={() => setSelectedMinute(m)}
                      >
                        <Text style={[styles.timeChipText, active && styles.timeChipTextActive]}>
                          :{m.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Selected summary */}
              {selectedDate && (
                <View style={styles.selectedSummary}>
                  <Check size={16} color="#16A34A" />
                  <Text style={styles.selectedSummaryText}>
                    Pickup: <Text style={{ fontWeight: '800' }}>{getCustomLabel()}</Text>
                  </Text>
                </View>
              )}
            </>
          )}

          <Button
            label="Continue to Payment"
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  backgroundImage: { flex: 1 },

  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 16, gap: 12,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#FFD6B3', justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: '#666', fontWeight: '500', marginTop: 2 },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00', textTransform: 'capitalize' },

  modeToggle: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 16, padding: 4, gap: 4,
  },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 12,
  },
  modeBtnActive: { backgroundColor: Colors.primary },
  modeBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  modeBtnTextActive: { color: '#FFFFFF' },

  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 12, paddingTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },

  // Quick slots
  slotCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 20, padding: 16,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  slotCardActive: { borderColor: Colors.primary, borderWidth: 2, backgroundColor: '#FFF7F2' },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center',
  },
  iconWrapActive: { backgroundColor: Colors.primary },
  slotLabel: { fontSize: 15, fontWeight: '700' },
  slotLabelActive: { color: Colors.primary },
  slotDesc: { fontSize: 12, marginTop: 2 },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },

  // Calendar
  calendarCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  calNavBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF0E6',
    justifyContent: 'center', alignItems: 'center',
  },
  calMonthLabel: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  calDayRow: { flexDirection: 'row', marginBottom: 8 },
  calDayLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: '#9CA3AF' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: {
    width: `${100 / 7}%`, aspectRatio: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  calCellToday: {
    borderRadius: 100,
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  calCellSelected: { backgroundColor: Colors.primary, borderRadius: 100 },
  calCellPast: { opacity: 0.3 },
  calCellText: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  calCellTodayText: { color: Colors.primary, fontWeight: '800' },
  calCellSelectedText: { color: '#FFFFFF', fontWeight: '800' },
  calCellPastText: { color: '#9CA3AF' },

  // Time picker
  timePickerTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 },
  timePickerSection: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, marginBottom: 8, marginTop: 12 },
  timeRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  minuteRow: { flexDirection: 'row', gap: 10 },
  timeChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#FFE8D6',
  },
  timeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeChipText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  timeChipTextActive: { color: '#FFFFFF' },

  selectedSummary: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F0FDF4', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  selectedSummaryText: { fontSize: 14, color: '#166534', flex: 1 },

  continueBtn: { width: '100%', marginTop: 8 },
});
