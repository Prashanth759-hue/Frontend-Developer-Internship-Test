/**
 * MapPickerScreen
 * Full-screen map picker — Rapido / Porter style.
 *
 * Receives params:
 *   fieldKey     — which field to update ('pickup' | 'drop' | 'from' | 'to' | etc.)
 *   currentValue — pre-filled address (optional)
 *
 * On confirm it calls router.back() with a param so the calling screen
 * can read the chosen address via useLocalSearchParams on re-focus.
 *
 * Because Expo Router doesn't support returning values from a pushed screen,
 * we write the result into a global store slot (mapPickerResult) that
 * the calling screen reads on mount / focus.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Search,
  Check,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../theme/LanguageContext';
import { useMapPickerStore } from '../store/mapPickerStore';
import { useLocation } from '../hooks/useLocation';
import { TurnOnLocationModal } from '../components/common/TurnOnLocationModal';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Mock suggestions (same pool as LocationSearchInput) ────────────────────────
const MOCK_LOCATIONS = [
  { id: '1',  name: 'Koramangala',     city: 'Bengaluru', lat: 12.9352, lng: 77.6245 },
  { id: '2',  name: 'Indiranagar',     city: 'Bengaluru', lat: 12.9784, lng: 77.6408 },
  { id: '3',  name: 'Whitefield',      city: 'Bengaluru', lat: 12.9698, lng: 77.7499 },
  { id: '4',  name: 'Jayanagar',       city: 'Bengaluru', lat: 12.9250, lng: 77.5938 },
  { id: '5',  name: 'Electronic City', city: 'Bengaluru', lat: 12.8399, lng: 77.6770 },
  { id: '6',  name: 'HSR Layout',      city: 'Bengaluru', lat: 12.9116, lng: 77.6389 },
  { id: '7',  name: 'Marathahalli',    city: 'Bengaluru', lat: 12.9591, lng: 77.6974 },
  { id: '8',  name: 'BTM Layout',      city: 'Bengaluru', lat: 12.9166, lng: 77.6101 },
  { id: '9',  name: 'JP Nagar',        city: 'Bengaluru', lat: 12.9055, lng: 77.5946 },
  { id: '10', name: 'Hebbal',          city: 'Bengaluru', lat: 13.0358, lng: 77.5970 },
  { id: '11', name: 'Rajajinagar',     city: 'Bengaluru', lat: 12.9907, lng: 77.5530 },
  { id: '12', name: 'Yeshwanthpur',    city: 'Bengaluru', lat: 13.0274, lng: 77.5497 },
  { id: '13', name: 'Yelahanka',       city: 'Bengaluru', lat: 13.1005, lng: 77.5963 },
  { id: '14', name: 'Banashankari',    city: 'Bengaluru', lat: 12.9255, lng: 77.5468 },
  { id: '15', name: 'Malleshwaram',    city: 'Bengaluru', lat: 13.0035, lng: 77.5681 },
  { id: '16', name: 'Chennai',         city: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { id: '17', name: 'Hyderabad',       city: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { id: '18', name: 'Mumbai',          city: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { id: '19', name: 'Pune',            city: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { id: '20', name: 'Mysuru',          city: 'Karnataka', lat: 12.2958, lng: 76.6394 },
];

function getSuggestions(query: string) {
  if (!query || query.trim().length < 1) return MOCK_LOCATIONS.slice(0, 5);
  const q = query.toLowerCase();
  return MOCK_LOCATIONS.filter(
    (l) => l.name.toLowerCase().includes(q) || l.city.toLowerCase().includes(q)
  ).slice(0, 6);
}

// ── Map grid overlay (decorative placeholder tiles) ───────────────────────────
const MAP_ROWS = 14;
const MAP_COLS = 8;

export default function MapPickerScreen() {
  const { colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ fieldKey: string; currentValue?: string }>();
  const { setResult } = useMapPickerStore();
  const {
    locationLabel,
    loading: locationLoading,
    needsRationale,
    confirmRationale,
    dismissRationale,
    requestWithRationale,
  } = useLocation(false); // don't auto-request here — home already handled this on entry

  const [query, setQuery] = useState(params.currentValue ?? '');
  const [pinLabel, setPinLabel] = useState(params.currentValue ?? 'Move pin to set location');
  const [searchFocused, setSearchFocused] = useState(false);
  const [pinMoved, setPinMoved] = useState(false);

  const suggestions = getSuggestions(query);

  const handleSuggestionPick = (name: string, city: string) => {
    const full = `${name}, ${city}`;
    setQuery(full);
    setPinLabel(full);
    setPinMoved(true);
    setSearchFocused(false);
  };

  const handleConfirm = () => {
    const chosen = pinMoved ? pinLabel : query || pinLabel;
    setResult({ fieldKey: params.fieldKey, address: chosen });
    router.back();
  };

  const handleMapTap = () => {
    // Simulate dragging pin — pick a random mock location
    const pick = MOCK_LOCATIONS[Math.floor(Math.random() * 10)];
    const label = `${pick.name}, ${pick.city}`;
    setPinLabel(label);
    setQuery(label);
    setPinMoved(true);
  };

  // Shows the "Turn on Location" popup first if device location is off or
  // permission isn't granted; otherwise fetches current location directly.
  const handleUseCurrentLocation = async () => {
    await requestWithRationale();
  };

  // Once a real GPS label resolves, drop it into the pin/query fields.
  useEffect(() => {
    if (locationLabel && locationLabel !== 'Your Location' && !pinMoved) {
      setPinLabel(locationLabel);
      setQuery(locationLabel);
      setPinMoved(true);
    }
  }, [locationLabel]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <TurnOnLocationModal
        visible={needsRationale}
        onAllow={confirmRationale}
        onDeny={dismissRationale}
      />

      {/* ── Full-screen map placeholder ────────────────────────────────────── */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleMapTap}
        style={styles.mapArea}
      >
        {/* Grid overlay to mimic a real map */}
        {Array.from({ length: MAP_ROWS }).map((_, row) => (
          <View key={row} style={styles.mapRow}>
            {Array.from({ length: MAP_COLS }).map((_, col) => (
              <View
                key={col}
                style={[
                  styles.mapCell,
                  (row + col) % 7 === 0 && styles.mapCellDark,
                  (row + col) % 11 === 0 && styles.mapCellRoad,
                  (row * 3 + col * 2) % 13 === 0 && styles.mapCellBlock,
                ]}
              />
            ))}
          </View>
        ))}

        {/* Road lines */}
        <View style={[styles.hRoad, { top: '38%' }]} />
        <View style={[styles.hRoad, { top: '62%' }]} />
        <View style={[styles.vRoad, { left: '30%' }]} />
        <View style={[styles.vRoad, { left: '65%' }]} />

        {/* Map label */}
        <View style={styles.mapLabel}>
          <Text style={styles.mapLabelText}>Tap anywhere to set pin</Text>
          <Text style={styles.mapLabelSub}>(Map API will be integrated here)</Text>
        </View>

        {/* Center pin */}
        <View style={styles.pinContainer} pointerEvents="none">
          <View style={styles.pinShadow} />
          <View style={styles.pinBody}>
            <MapPin size={28} color="#FFFFFF" fill={Colors.primary} />
          </View>
          <View style={styles.pinStem} />
        </View>
      </TouchableOpacity>

      {/* ── Top bar: back + search ──────────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={styles.searchBox}>
          <Search size={16} color="#9CA3AF" style={{ marginLeft: 4 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search for an area or landmark"
            placeholderTextColor="#AAAAAA"
            autoCorrect={false}
            autoCapitalize="words"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => { setQuery(''); setPinLabel('Move pin to set location'); setPinMoved(false); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ marginRight: 8 }}
            >
              <Text style={{ fontSize: 12, color: colors.placeholder, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Search suggestions dropdown ─────────────────────────────────────── */}
      {searchFocused && (
        <View style={[styles.suggestionsPanel, { top: insets.top + 72 }]}>
          {suggestions.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.suggRow, idx < suggestions.length - 1 && styles.suggRowBorder]}
              onPress={() => handleSuggestionPick(item.name, item.city)}
              activeOpacity={0.75}
            >
              <View style={styles.suggIcon}>
                <MapPin size={13} color="#9CA3AF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.suggName, { color: colors.textPrimary }]}>{item.name}</Text>
                <Text style={styles.suggCity}>{item.city}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Bottom confirmation panel ───────────────────────────────────────── */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 16 }]}>
        {/* Current location shortcut */}
        <TouchableOpacity
          style={styles.currentLocBtn}
          onPress={handleUseCurrentLocation}
          disabled={locationLoading}
          accessibilityLabel="Use current location"
        >
          <Navigation size={16} color={Colors.primary} />
          <Text style={styles.currentLocText}>
            {locationLoading ? 'Detecting your location…' : 'Use current location'}
          </Text>
        </TouchableOpacity>

        {/* Address pill */}
        <View style={styles.addressPill}>
          <View style={styles.addressPinDot} />
          <Text
            style={[styles.addressText, { color: pinMoved ? colors.textPrimary : colors.placeholder }]}
            numberOfLines={2}
          >
            {pinLabel}
          </Text>
        </View>

        {/* Confirm button */}
        <TouchableOpacity
          style={[styles.confirmBtn, !pinMoved && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!pinMoved}
          activeOpacity={0.85}
        >
          <Check size={18} color="#FFFFFF" />
          <Text style={styles.confirmText}>{t('confirm')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#E8F0E9',
  },

  // ── Map ───────────────────────────────────────────────────────────────────
  mapArea: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  mapRow: {
    flexDirection: 'row',
    height: SCREEN_H / MAP_ROWS,
  },
  mapCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(150,190,150,0.25)',
    backgroundColor: '#EEF4EF',
  },
  mapCellDark: {
    backgroundColor: '#E0EBE1',
  },
  mapCellRoad: {
    backgroundColor: colors.inputBackground,
  },
  mapCellBlock: {
    backgroundColor: '#D8E8D9',
  },
  hRoad: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: colors.inputBackground,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(200,200,200,0.4)',
  },
  vRoad: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: colors.inputBackground,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(200,200,200,0.4)',
  },
  mapLabel: {
    position: 'absolute',
    bottom: 220,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 4,
  },
  mapLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  mapLabelSub: {
    fontSize: 11,
    color: colors.placeholder,
  },

  // ── Pin ───────────────────────────────────────────────────────────────────
  pinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -52 }],
    alignItems: 'center',
  },
  pinBody: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  pinStem: {
    width: 3,
    height: 12,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  pinShadow: {
    position: 'absolute',
    bottom: -6,
    width: 20,
    height: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  // ── Top bar ───────────────────────────────────────────────────────────────
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    paddingHorizontal: 12,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },

  // ── Suggestions ───────────────────────────────────────────────────────────
  suggestionsPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 14,
    zIndex: 20,
  },
  suggRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBackground,
  },
  suggIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggName: { fontSize: 14, fontWeight: '600' },
  suggCity: { fontSize: 11, color: colors.placeholder, marginTop: 1 },

  // ── Bottom panel ──────────────────────────────────────────────────────────
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingHorizontal: 20,
    gap: 12,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  currentLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  currentLocText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  addressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  addressPinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    flexShrink: 0,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  confirmBtnDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.surface,
    letterSpacing: 0.3,
  },
})
;