import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { BorderRadius } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

interface DateOfBirthPickerProps {
  visible: boolean;
  /** Currently selected date, or null if nothing valid has been picked/typed yet. */
  value: Date | null;
  /** Earliest selectable date — i.e. someone turning the maximum allowed age today. */
  minDate: Date;
  /** Latest selectable date — i.e. someone turning the minimum allowed age today. */
  maxDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

/**
 * A real, tappable calendar for picking a Date of Birth — built with core
 * React Native components only (no native date-picker dependency needed).
 * Days, months, and years outside [minDate, maxDate] are disabled so the
 * user can only ever land on an age within the allowed range.
 */
export function DateOfBirthPicker({ visible, value, minDate, maxDate, onSelect, onClose }: DateOfBirthPickerProps) {
  const { colors } = useTheme();

  // The month currently being viewed — starts on the selected date's month,
  // or the latest allowed month (maxDate) if nothing has been picked yet.
  const initialView = value ?? maxDate;
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());
  const [pickerMode, setPickerMode] = useState<'days' | 'years'>('days');

  // Re-sync the viewed month whenever the modal is freshly opened with a
  // different selected value (e.g. user typed a date manually, then opened
  // the calendar — it should jump straight to that date).
  React.useEffect(() => {
    if (visible) {
      const base = value ?? maxDate;
      setViewYear(base.getFullYear());
      setViewMonth(base.getMonth());
      setPickerMode('days');
    }
  }, [visible]);

  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();

  const canGoPrevMonth = viewYear > minYear || (viewYear === minYear && viewMonth > minDate.getMonth());
  const canGoNextMonth = viewYear < maxYear || (viewYear === maxYear && viewMonth < maxDate.getMonth());

  const goPrevMonth = () => {
    if (!canGoPrevMonth) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    if (!canGoNextMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  // Build the calendar grid: leading blanks + every day of the month.
  const grid = useMemo(() => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = daysInMonth(viewYear, viewMonth);
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  const isDayDisabled = (day: number): boolean => {
    const candidate = new Date(viewYear, viewMonth, day);
    return candidate.getTime() < stripTime(minDate).getTime() || candidate.getTime() > stripTime(maxDate).getTime();
  };

  const isDaySelected = (day: number): boolean => {
    if (!value) return false;
    return isSameDay(new Date(viewYear, viewMonth, day), value);
  };

  const handleDayPress = (day: number) => {
    if (isDayDisabled(day)) return;
    onSelect(new Date(viewYear, viewMonth, day));
  };

  // Year list for the quick year-picker grid, newest first.
  const yearList = useMemo(() => {
    const years: number[] = [];
    for (let y = maxYear; y >= minYear; y--) years.push(y);
    return years;
  }, [minYear, maxYear]);

  const handleYearPress = (year: number) => {
    setViewYear(year);
    // Clamp the viewed month if jumping to a boundary year pushes it out of range.
    if (year === minYear && viewMonth < minDate.getMonth()) setViewMonth(minDate.getMonth());
    if (year === maxYear && viewMonth > maxDate.getMonth()) setViewMonth(maxDate.getMonth());
    setPickerMode('days');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismiss} onPress={onClose} />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Date of Birth</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.inputBackground }]} accessibilityLabel="Close calendar">
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Month/Year nav */}
          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={goPrevMonth}
              disabled={!canGoPrevMonth}
              style={[styles.navBtn, { opacity: canGoPrevMonth ? 1 : 0.3 }]}
              accessibilityLabel="Previous month"
            >
              <ChevronLeft size={20} color={Colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setPickerMode(pickerMode === 'days' ? 'years' : 'days')} style={styles.monthYearBtn}>
              <Text style={[styles.monthYearText, { color: colors.textPrimary }]}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goNextMonth}
              disabled={!canGoNextMonth}
              style={[styles.navBtn, { opacity: canGoNextMonth ? 1 : 0.3 }]}
              accessibilityLabel="Next month"
            >
              <ChevronRight size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {pickerMode === 'years' ? (
            // Quick year grid — jumping straight to a year is much faster
            // than tapping "previous month" repeatedly across decades.
            <ScrollView style={styles.yearScroll} contentContainerStyle={styles.yearGrid}>
              {yearList.map((y) => {
                const isSelectedYear = y === viewYear;
                return (
                  <TouchableOpacity
                    key={y}
                    style={[
                      styles.yearCell,
                      { backgroundColor: isSelectedYear ? Colors.primary : colors.inputBackground },
                    ]}
                    onPress={() => handleYearPress(y)}
                  >
                    <Text style={[styles.yearCellText, { color: isSelectedYear ? '#fff' : colors.textPrimary }]}>{y}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <>
              {/* Weekday labels */}
              <View style={styles.weekRow}>
                {WEEKDAY_LABELS.map((d, i) => (
                  <Text key={i} style={[styles.weekLabel, { color: colors.placeholder }]}>{d}</Text>
                ))}
              </View>

              {/* Day grid */}
              <View style={styles.dayGrid}>
                {grid.map((day, idx) => {
                  if (day === null) return <View key={idx} style={styles.dayCell} />;
                  const disabled = isDayDisabled(day);
                  const selected = isDaySelected(day);
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.dayCell,
                        selected && { backgroundColor: Colors.primary, borderRadius: 18 },
                      ]}
                      onPress={() => handleDayPress(day)}
                      disabled={disabled}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          { color: disabled ? colors.placeholder : selected ? '#fff' : colors.textPrimary },
                          disabled && { opacity: 0.4 },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <Text style={[styles.rangeHint, { color: colors.textSecondary }]}>
            You must be between 13 and 100 years old
          </Text>
        </View>
      </View>
    </Modal>
  );
}

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Formats a Date as DD/MM/YYYY, matching the manual-typing format used in the input. */
export function formatDob(date: Date): string {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  dismiss: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  card: {
    width: '88%',
    maxWidth: 360,
    borderRadius: BorderRadius.lg + 4,
    padding: 18,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 14,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg },
  closeBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },

  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  monthYearBtn: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  monthYearText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.md },

  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekLabel: { flex: 1, textAlign: 'center', fontFamily: FontFamily.medium, fontSize: FontSize.xs },

  dayGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', height: 38, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm },

  yearScroll: { maxHeight: 260 },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 4 },
  yearCell: {
    width: '30%', paddingVertical: 10, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  yearCellText: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm },

  rangeHint: { textAlign: 'center', fontFamily: FontFamily.regular, fontSize: FontSize.xs, marginTop: 14 },
});