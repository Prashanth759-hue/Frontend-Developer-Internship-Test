import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { ArrowLeft, ArrowUpDown } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';
import { useMapPickerStore } from '../../store/mapPickerStore';
import LocationSearchInput from '../../components/booking/LocationSearchInput';
import HOME_BG from '../../assets/bg/homeBg';

export default function ParcelLocationScreen() {
  const { colors, isDark } = useTheme();
  const s = makeStyles(colors);
  const { pickup, drop, setPickup, setDrop } = useBookingStore();
  const { result: mapResult, clearResult } = useMapPickerStore();

  const [pickupText, setPickupText] = useState(pickup?.address ?? '');
  const [dropText, setDropText] = useState(drop?.address ?? '');
  const [formError, setFormError] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      if (mapResult) {
        if (mapResult.fieldKey === 'pickup') setPickupText(mapResult.address);
        else if (mapResult.fieldKey === 'drop') setDropText(mapResult.address);
        clearResult();
      }
    }, [mapResult])
  );

  const canContinue = pickupText.trim().length > 2 && dropText.trim().length > 2;

  const handleSwap = () => { setPickupText(dropText); setDropText(pickupText); };

  const handleContinue = () => {
    if (!canContinue) { setFormError('Please enter both pickup and drop locations.'); return; }
    setPickup({ label: 'Pickup', address: pickupText });
    setDrop({ label: 'Drop', address: dropText });
    router.push('/(booking)/parcel-details');
  };

  return (
    <ImageBackground source={HOME_BG} style={s.bg} resizeMode="cover">
      <SafeAreaView style={[s.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        <View style={s.hero}>
          <View style={s.heroRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Go back">
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.heroTitle}>Send a Parcel</Text>
              <Text style={s.heroSub}>Where should we pick up and deliver?</Text>
            </View>
          </View>
          <View style={s.chipsRow}>
            <View style={s.chip}><Text style={s.chipText}>📦 Fast delivery</Text></View>
            <View style={s.chip}><Text style={s.chipText}>📍 Live tracking</Text></View>
            <View style={s.chip}><Text style={s.chipText}>🔒 Safe & insured</Text></View>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <View style={[s.card, { zIndex: 20 }]}>
            <Text style={s.cardLabel}>📍 PICKUP & DROP LOCATIONS</Text>
            <View style={s.fieldsWrap}>
              <LocationSearchInput
                value={pickupText}
                onChangeText={(v) => { setPickupText(v); setFormError(''); }}
                onSelect={(v) => { setPickupText(v); setFormError(''); }}
                placeholder="Pickup location"
                dotType="circle"
                dotColor={Colors.primary}
                fieldKey="pickup"
              />
              <View style={s.divider} />
              <LocationSearchInput
                value={dropText}
                onChangeText={(v) => { setDropText(v); setFormError(''); }}
                onSelect={(v) => { setDropText(v); setFormError(''); }}
                placeholder="Drop location"
                dotType="pin"
                dotColor={Colors.danger}
                fieldKey="drop"
              />
              <TouchableOpacity
                style={s.swapBtn}
                onPress={handleSwap}
                accessibilityLabel="Swap pickup and drop"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ArrowUpDown size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {formError ? (
            <View style={s.errorBanner}>
              <Text style={s.errorBannerText}>{formError}</Text>
            </View>
          ) : null}

          <Button
            label="Continue · Parcel Details"
            onPress={handleContinue}
            style={{ width: '100%', ...(!canContinue ? s.btnDisabled : {}) }}
            textStyle={!canContinue ? s.btnDisabledText : undefined}
          />
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  hero: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    backgroundColor: colors.surfaceElevated, marginBottom: 16,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSub: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },
  content: { paddingHorizontal: 16, paddingBottom: 16, gap: 14, paddingTop: 4 },
  card: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 6, gap: 8,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: colors.placeholder, letterSpacing: 1.2, marginBottom: 4 },
  fieldsWrap: { position: 'relative', paddingRight: 44 },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginLeft: 34 },
  swapBtn: {
    position: 'absolute', right: 0, top: 30, width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.iconBg, borderWidth: 1.5, borderColor: colors.iconBorder, zIndex: 10,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2', borderRadius: 12, borderLeftWidth: 3,
    borderLeftColor: Colors.danger, paddingHorizontal: 12, paddingVertical: 10,
  },
  errorBannerText: { fontSize: 13, fontWeight: '600', color: Colors.danger },
  btnDisabled: { backgroundColor: colors.border, opacity: 0.8 },
  btnDisabledText: { color: colors.placeholder },
});
