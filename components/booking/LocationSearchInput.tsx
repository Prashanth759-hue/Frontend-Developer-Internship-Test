/**
 * LocationSearchInput
 * A location input that shows search suggestions as the user types,
 * plus "Select on Map", recent destinations, and saved/favorite
 * addresses — just like Rapido / Porter.
 *
 * Web fix: on web, onBlur fires before TouchableOpacity onPress (click).
 * We use onMouseDown (fires before blur) to set a pendingNavRef flag,
 * so the blur timeout doesn't hide the dropdown before the tap lands.
 *
 * UX fixes baked into this component:
 *  - UX-LOC-003: suggestion rows show title + city subtitle + a distance
 *    chip, so there is a clear visual hierarchy instead of a flat list.
 *  - UX-LOC-004: typing something with zero matches shows an explicit
 *    "no location found" state with a retry (clear) and a "search on
 *    map" fallback, instead of silently doing nothing.
 *  - UX-LOC-005: a short debounce drives a `searching` state that shows
 *    fixed-height skeleton rows, so the dropdown does not flicker or
 *    jump as results resolve.
 *  - UX-HOME-010: when the field is focused and empty, a "Recent" section
 *    (from recentDestinationsStore) is shown above suggestions.
 *  - UX-LOC-009: a "Saved Places" section (from savedAddressStore) lets
 *    the user fill the field with Home/Work/etc. in one tap.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { MapPin, Circle, Navigation, Clock, Home, Briefcase, SearchX } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useRecentDestinationsStore } from '../../store/recentDestinationsStore';
import { useSavedAddressStore, type AddressIconKey } from '../../store/savedAddressStore';

// ── Mock location suggestions ──────────────────────────────────────────────────
const MOCK_LOCATIONS = [
  { id: '1',  name: 'Koramangala',        city: 'Bengaluru', distanceKm: 2.1 },
  { id: '2',  name: 'Indiranagar',        city: 'Bengaluru', distanceKm: 4.6 },
  { id: '3',  name: 'Whitefield',         city: 'Bengaluru', distanceKm: 14.8 },
  { id: '4',  name: 'Jayanagar',          city: 'Bengaluru', distanceKm: 6.3 },
  { id: '5',  name: 'Electronic City',    city: 'Bengaluru', distanceKm: 18.2 },
  { id: '6',  name: 'HSR Layout',         city: 'Bengaluru', distanceKm: 3.4 },
  { id: '7',  name: 'Marathahalli',       city: 'Bengaluru', distanceKm: 9.7 },
  { id: '8',  name: 'BTM Layout',         city: 'Bengaluru', distanceKm: 3.9 },
  { id: '9',  name: 'JP Nagar',           city: 'Bengaluru', distanceKm: 7.5 },
  { id: '10', name: 'Hebbal',             city: 'Bengaluru', distanceKm: 12.1 },
  { id: '11', name: 'Rajajinagar',        city: 'Bengaluru', distanceKm: 8.8 },
  { id: '12', name: 'Yeshwanthpur',       city: 'Bengaluru', distanceKm: 11.4 },
  { id: '13', name: 'Yelahanka',          city: 'Bengaluru', distanceKm: 16.9 },
  { id: '14', name: 'Banashankari',       city: 'Bengaluru', distanceKm: 8.2 },
  { id: '15', name: 'Malleshwaram',       city: 'Bengaluru', distanceKm: 6.0 },
  { id: '16', name: 'Chennai',            city: 'Tamil Nadu', distanceKm: 346 },
  { id: '17', name: 'Hyderabad',          city: 'Telangana', distanceKm: 569 },
  { id: '18', name: 'Mumbai',             city: 'Maharashtra', distanceKm: 981 },
  { id: '19', name: 'Pune',               city: 'Maharashtra', distanceKm: 842 },
  { id: '20', name: 'Mysuru',             city: 'Karnataka', distanceKm: 144 },
];

function getSuggestions(query: string) {
  if (!query || query.trim().length < 1) return [];
  const q = query.toLowerCase();
  return MOCK_LOCATIONS.filter(
    (l) => l.name.toLowerCase().includes(q) || l.city.toLowerCase().includes(q)
  ).slice(0, 6);
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function SavedAddressIcon({ icon, size = 13, color }: { icon: AddressIconKey; size?: number; color: string }) {
  if (icon === 'home') return <Home size={size} color={color} />;
  if (icon === 'briefcase') return <Briefcase size={size} color={color} />;
  return <MapPin size={size} color={color} />;
}

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (address: string) => void;
  placeholder?: string;
  dotType?: 'circle' | 'pin';
  dotColor?: string;
  fieldKey: string;
  autoFocus?: boolean;
  containerStyle?: object;
}

const SEARCH_DEBOUNCE_MS = 280;
// Fixed row height so skeleton rows match real rows exactly — prevents
// layout jump between the loading state and the results state.
const ROW_HEIGHT = 50;

export default function LocationSearchInput({
  value,
  onChangeText,
  onSelect,
  placeholder = 'Search location',
  dotType = 'circle',
  dotColor = Colors.primary,
  fieldKey,
  autoFocus = false,
  containerStyle,
}: Props) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [searching, setSearching] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const inputRef = useRef<TextInput>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { recents, load: loadRecents, addRecent } = useRecentDestinationsStore();
  const { addresses: savedAddresses } = useSavedAddressStore();

  useEffect(() => {
    loadRecents();
  }, [loadRecents]);

  // KEY WEB FIX: set this true in onMouseDown (fires BEFORE blur on web)
  // so the blur timeout doesn't close the dropdown before onPress fires.
  const keepOpenRef = useRef(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the value that actually drives search, so the loading
  // indicator has a stable window to show in and results don't flicker
  // on every keystroke.
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!value || value.trim().length === 0) {
      setSearching(false);
      setDebouncedValue('');
      return;
    }

    setSearching(true);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedValue(value);
      setSearching(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [value]);

  const trimmedValue = value.trim();
  const suggestions = focused ? getSuggestions(debouncedValue) : [];
  const showDropdown = focused;
  const isTyping = trimmedValue.length > 0;
  const showSkeleton = isTyping && searching;
  const showNoResults = isTyping && !searching && suggestions.length === 0;
  const showRecentsAndSaved = !isTyping && (recents.length > 0 || savedAddresses.length > 0);

  const closeSoon = () => {
    blurTimerRef.current = setTimeout(() => {
      if (!keepOpenRef.current) {
        setFocused(false);
      }
    }, 220); // 220ms — enough for click to fire after blur on web
  };

  const commitSelection = useCallback((full: string) => {
    keepOpenRef.current = false;
    onSelect(full);
    onChangeText(full);
    setFocused(false);
    inputRef.current?.blur();
    addRecent(full);
  }, [onSelect, onChangeText, addRecent]);

  const handleSelectSuggestion = (name: string, city: string) => {
    commitSelection(`${name}, ${city}`);
  };

  const handleSelectRecent = (address: string) => {
    commitSelection(address);
  };

  const handleSelectSaved = (address: string) => {
    commitSelection(address);
  };

  const handleOpenMap = () => {
    keepOpenRef.current = false;
    setFocused(false);
    inputRef.current?.blur();
    // Small timeout so React state flushes before navigation
    setTimeout(() => {
      router.push({
        pathname: '/map-picker',
        params: { fieldKey, currentValue: value },
      });
    }, 30);
  };

  const handleRetry = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  // Web: mousedown fires before blur — mark intent to navigate/select
  const webPressIn = Platform.OS === 'web'
    ? { onMouseDown: () => { keepOpenRef.current = true; } }
    : {};

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* ── Input row ── */}
      <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
        <View style={styles.dotWrap}>
          {dotType === 'pin' ? (
            <MapPin size={14} color={dotColor} fill={dotColor} />
          ) : (
            <Circle size={12} color={dotColor} fill={dotColor} />
          )}
        </View>

        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#AAAAAA"
          autoFocus={autoFocus}
          autoCorrect={false}
          autoCapitalize="words"
          maxLength={300}
          onFocus={() => {
            keepOpenRef.current = false;
            if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
            setFocused(true);
          }}
          onBlur={closeSoon}
          returnKeyType="search"
          accessibilityLabel={placeholder}
        />

        {value.length > 0 && (
          <TouchableOpacity
            {...webPressIn}
            onPress={() => { onChangeText(''); onSelect(''); }}
            style={styles.clearBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Clear"
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <View style={[styles.dropdown, { backgroundColor: colors.background ?? '#FFF' }]}>

          {/* Select on Map — always first */}
          <TouchableOpacity
            style={styles.mapRow}
            {...webPressIn}
            onPress={handleOpenMap}
            activeOpacity={0.8}
          >
            <View style={styles.mapIconWrap}>
              <Navigation size={16} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mapRowTitle}>Select on Map</Text>
              <Text style={styles.mapRowSub}>Pin your exact location</Text>
            </View>
            <MapPin size={14} color={Colors.primary} />
          </TouchableOpacity>

          {/* ── Saved Places (Home / Work / custom) ── */}
          {showRecentsAndSaved && savedAddresses.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>SAVED PLACES</Text>
              {savedAddresses.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[styles.suggestionRow, { height: ROW_HEIGHT }]}
                  {...webPressIn}
                  onPress={() => handleSelectSaved(addr.address)}
                  activeOpacity={0.7}
                  accessibilityLabel={`${addr.label} saved address`}
                >
                  <View style={[styles.suggestionIconWrap, styles.savedIconWrap]}>
                    <SavedAddressIcon icon={addr.icon} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.suggestionName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {addr.label}
                    </Text>
                    <Text style={styles.suggestionCity} numberOfLines={1}>{addr.address}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* ── Recent destinations ── */}
          {showRecentsAndSaved && recents.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>RECENT</Text>
              {recents.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.suggestionRow, { height: ROW_HEIGHT }]}
                  {...webPressIn}
                  onPress={() => handleSelectRecent(r.address)}
                  activeOpacity={0.7}
                  accessibilityLabel={`Recent destination: ${r.address}`}
                >
                  <View style={styles.suggestionIconWrap}>
                    <Clock size={13} color="#9CA3AF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.suggestionName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {r.address}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* ── Live search results ── */}
          {isTyping && <View style={styles.divider} />}

          {/* Loading skeleton — fixed height rows, identical count cap,
              so swapping to real results never shifts layout. */}
          {showSkeleton && (
            <View accessibilityLabel="Searching">
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.suggestionRow, { height: ROW_HEIGHT }]}>
                  <View style={[styles.suggestionIconWrap, styles.skeletonBlock]} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={[styles.skeletonLine, { width: '60%' }]} />
                    <View style={[styles.skeletonLine, { width: '35%', height: 8 }]} />
                  </View>
                </View>
              ))}
            </View>
          )}

          {!showSkeleton && suggestions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.suggestionRow, { height: ROW_HEIGHT }]}
              {...webPressIn}
              onPress={() => handleSelectSuggestion(item.name, item.city)}
              activeOpacity={0.7}
            >
              <View style={styles.suggestionIconWrap}>
                <MapPin size={13} color="#9CA3AF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.suggestionName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.suggestionCity} numberOfLines={1}>{item.city}</Text>
              </View>
              <Text style={styles.suggestionDistance}>{formatDistance(item.distanceKm)}</Text>
            </TouchableOpacity>
          ))}

          {/* ── No results — explicit state with retry / map fallback ── */}
          {showNoResults && (
            <View style={styles.noResults}>
              <SearchX size={22} color="#C4C4C4" />
              <Text style={styles.noResultsTitle}>No location found</Text>
              <Text style={styles.noResultsText}>
                We couldn't find "{value}". Try a different spelling, or pin it on the map.
              </Text>
              <View style={styles.noResultsActions}>
                <TouchableOpacity
                  style={styles.noResultsBtn}
                  {...webPressIn}
                  onPress={handleRetry}
                >
                  <Text style={styles.noResultsBtnText}>Edit Search</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.noResultsBtn, styles.noResultsBtnPrimary]}
                  {...webPressIn}
                  onPress={handleOpenMap}
                >
                  <Text style={styles.noResultsBtnPrimaryText}>Search on Map</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 10,
    backgroundColor: 'transparent',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  inputRowFocused: {},

  dotWrap: {
    width: 24,
    alignItems: 'center',
    flexShrink: 0,
  },

  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 10,
    paddingHorizontal: 0,
    minHeight: 44,
  },

  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  clearText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
  },

  // ── Dropdown ──────────────────────────────────────────────────────────────────
  dropdown: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE8D6',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 4,
    maxHeight: 420,
    // Web: needs explicit z-index so it layers above sibling cards
    ...(Platform.OS === 'web' ? { zIndex: 999 } : {}),
  },

  mapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFF7F2',
  },
  mapIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF0E6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD6B3',
  },
  mapRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  mapRowSub: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },

  divider: {
    height: 1,
    backgroundColor: '#FFE8D6',
    marginHorizontal: 14,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B0B0B0',
    letterSpacing: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },

  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  suggestionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  savedIconWrap: {
    backgroundColor: '#FFF0E6',
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionCity: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  suggestionDistance: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    flexShrink: 0,
  },

  // ── Skeleton (loading) ──────────────────────────────────────────────────────
  skeletonBlock: {
    backgroundColor: '#EFEFEF',
  },
  skeletonLine: {
    height: 11,
    borderRadius: 4,
    backgroundColor: '#EFEFEF',
  },

  // ── No results ──────────────────────────────────────────────────────────────
  noResults: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 4,
  },
  noResultsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 6,
  },
  noResultsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 8,
  },
  noResultsActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  noResultsBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  noResultsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  noResultsBtnPrimary: {
    backgroundColor: Colors.primary,
  },
  noResultsBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
