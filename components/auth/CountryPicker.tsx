import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  TextInput,
  Platform,
} from 'react-native';
import { ChevronDown, Check, Search, X } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography, FontFamily, FontSize } from '../../theme/typography';
import { BorderRadius, Layout, Spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
];

export const DEFAULT_COUNTRY: Country = COUNTRIES[0]; // India +91

interface CountryPickerProps {
  selected: Country;
  onSelect: (country: Country) => void;
}

export default function CountryPicker({ selected, onSelect }: CountryPickerProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');

  // Filter countries by name or dial code as the user types
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [query]);

  const handleOpen = () => {
    setQuery(''); // reset search every time sheet opens
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
    setQuery('');
  };

  const handleSelect = (country: Country) => {
    onSelect(country);   // bubble up to parent — parent owns the state
    handleClose();
  };

  return (
    <>
      {/* ── Trigger button — shows current flag + dial code ── */}
      <TouchableOpacity
        style={[
          styles.trigger,
          { backgroundColor: colors.inputBackground, borderColor: colors.border },
        ]}
        onPress={handleOpen}
        accessibilityLabel={`Selected country: ${selected.name} ${selected.dialCode}. Tap to change.`}
        accessibilityRole="button"
      >
        <Text style={styles.flag}>{selected.flag}</Text>
        <Text style={[styles.dialCode, { color: colors.textPrimary }]}>
          {selected.dialCode}
        </Text>
        <ChevronDown size={14} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* ── Bottom sheet modal ── */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            {/* Inner sheet — prevent tap-through */}
            <TouchableWithoutFeedback>
              <View style={[styles.sheet, { backgroundColor: colors.surfaceElevated }]}>

                {/* Header row */}
                <View style={styles.sheetHeader}>
                  <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
                    Select Country
                  </Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={styles.closeBtn}
                    accessibilityLabel="Close country selector"
                    accessibilityRole="button"
                  >
                    <X size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* ── Search bar ── */}
                <View
                  style={[
                    styles.searchBar,
                    { backgroundColor: colors.inputBackground, borderColor: colors.border },
                  ]}
                >
                  <Search size={16} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.textPrimary }]}
                    placeholder="Search country or code…"
                    placeholderTextColor={colors.textSecondary}
                    value={query}
                    onChangeText={setQuery}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="search"
                    accessibilityLabel="Search countries"
                  />
                  {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="Clear search">
                      <X size={15} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* ── Country list ── */}
                {filtered.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      No countries match "{query}"
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.code}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                      const isSelected = selected.code === item.code;
                      return (
                        <TouchableOpacity
                          style={[
                            styles.countryRow,
                            { borderBottomColor: colors.divider },
                            isSelected && { backgroundColor: Colors.primaryLight },
                          ]}
                          onPress={() => handleSelect(item)}
                          accessibilityLabel={`Select ${item.name} ${item.dialCode}`}
                          accessibilityState={{ selected: isSelected }}
                        >
                          <Text style={styles.countryFlag}>{item.flag}</Text>
                          <View style={styles.countryInfo}>
                            <Text style={[styles.countryName, { color: colors.textPrimary }]}>
                              {item.name}
                            </Text>
                            <Text style={[styles.countryDial, { color: colors.textSecondary }]}>
                              {item.dialCode}
                            </Text>
                          </View>
                          {isSelected && <Check size={18} color={Colors.primary} />}
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ── Trigger ─────────────────────────────────────────────────────────────
  trigger: {
    height: Layout.inputHeight,
    paddingHorizontal: 12,
    borderRadius: Layout.inputRadius,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 90,
  },
  flag: { fontSize: 20 },
  dialCode: { ...Typography.bodyMedium },

  // ── Overlay + sheet ──────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    maxHeight: '70%',
  },

  // ── Header ───────────────────────────────────────────────────────────────
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetTitle: {
    ...Typography.h2,
  },
  closeBtn: {
    padding: 4,
  },

  // ── Search bar ───────────────────────────────────────────────────────────
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    padding: 0,
    margin: 0,
  },

  // ── Country rows ─────────────────────────────────────────────────────────
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    minHeight: Layout.minTouchTarget,
    borderRadius: BorderRadius.sm,
  },
  countryFlag: { fontSize: 24 },
  countryInfo: { flex: 1 },
  countryName: { ...Typography.bodyMedium },
  countryDial: { ...Typography.caption, marginTop: 2 },

  // ── Empty state ──────────────────────────────────────────────────────────
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
  },
});