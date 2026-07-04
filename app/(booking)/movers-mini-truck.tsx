import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Minus, Plus, Check } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';
import { HELPER_PRICE_PER_PERSON, MAX_HELPERS } from '../../constants/mockData';

// ── Simple load-size options ──────────────────────────────────────────────────
import HOME_BG from '../../assets/bg/homeBg';
const LOAD_SIZES = [
  {
    id: 'small',
    label: 'Small Load',
    emoji: '📦',
    desc: 'Few boxes, 1–2 items',
    weight: 'Up to 200 kg',
    examples: 'Boxes, suitcases, small furniture',
    color: '#2E7D32',
    borderColor: '#4CAF50',
    accentColor: '#2E7D32',
  },
  {
    id: 'medium',
    label: 'Medium Load',
    emoji: '🛋️',
    desc: '3–6 items or mixed goods',
    weight: '200 – 500 kg',
    examples: 'Sofa, fridge, beds, cartons',
    color: '#FFF3E0',
    borderColor: '#FFB74D',
    accentColor: '#E65100',
  },
  {
    id: 'large',
    label: 'Large Load',
    emoji: '🚛',
    desc: 'Full mini-truck worth of goods',
    weight: '500 kg – 1 tonne',
    examples: 'Full room shift, heavy appliances',
    color: '#FCE4EC',
    borderColor: '#F48FB1',
    accentColor: '#880E4F',
  },
] as const;

type LoadSizeId = (typeof LOAD_SIZES)[number]['id'];

export default function MoversMiniTruckScreen() {
  const { colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const { setMovingItemCount, setHelperCount } = useBookingStore();

  const [selectedSize, setSelectedSize] = useState<LoadSizeId | null>(null);
  const [helpers, setHelpers] = useState(0);

  const canContinue = selectedSize !== null;

  const handleContinue = () => {
    // Map size to an item-count equivalent so the rest of the flow works
    const countMap: Record<LoadSizeId, number> = { small: 3, medium: 8, large: 15 };
    setMovingItemCount(countMap[selectedSize!]);
    setHelperCount(helpers);
    router.push('/(booking)/pickup');
  };

  return (
    <ImageBackground
      source={HOME_BG}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        {/* ── Header ── */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{t('shiftingMiniTruck')}</Text>
              <Text style={styles.heroSubtitle}>Light goods · Budget friendly</Text>
            </View>
          </View>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipText}>{t('chipDoorstepLoading')}</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>{t('chipLiveTracking')}</Text></View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Truck summary ── */}
          <View style={styles.truckCard}>
            <Image
              source={require('../../assets/images/icon-mini-truck.png')}
              style={styles.truckImage}
            />
            <View style={styles.truckInfo}>
              <Text style={[styles.truckName, { color: colors.textPrimary }]}>
                Mini Truck Shifting
              </Text>
              <Text style={[styles.truckDesc, { color: colors.textSecondary }]}>
                Tell us how much you're moving — we'll match the right vehicle
              </Text>
            </View>
          </View>

          {/* ── Load size picker ── */}
          <Text style={styles.sectionTitle}>📦 How much are you moving?</Text>
          <Text style={styles.sectionSub}>Tap the option that best matches your load</Text>

          {LOAD_SIZES.map((size) => {
            const active = selectedSize === size.id;
            return (
              <TouchableOpacity
                key={size.id}
                style={[
                  styles.sizeCard,
                  { borderColor: active ? size.borderColor : colors.inputBackground },
                  active && { backgroundColor: size.color },
                ]}
                onPress={() => setSelectedSize(size.id)}
                activeOpacity={0.8}
              >
                {/* Tick */}
                <View style={[
                  styles.tick,
                  active && { backgroundColor: size.accentColor, borderColor: size.accentColor },
                ]}>
                  {active && <Check size={12} color="#FFF" strokeWidth={3} />}
                </View>

                <View style={styles.sizeEmoji}>
                  <Text style={styles.sizeEmojiText}>{size.emoji}</Text>
                </View>

                <View style={styles.sizeInfo}>
                  <View style={styles.sizeTitleRow}>
                    <Text style={[
                      styles.sizeName,
                      active && { color: size.accentColor },
                    ]}>
                      {size.label}
                    </Text>
                    <View style={[
                      styles.weightBadge,
                      active && { backgroundColor: size.accentColor },
                    ]}>
                      <Text style={[
                        styles.weightBadgeText,
                        active && { color: '#FFF' },
                      ]}>
                        {size.weight}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.sizeDesc, { color: colors.textSecondary }]}>
                    {size.desc}
                  </Text>
                  <Text style={styles.sizeExamples}>
                    e.g. {size.examples}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* ── Helpers ── */}
          <View style={styles.helperCard}>
            <Text style={styles.cardLabel}>🧑‍🤝‍🧑 LOADING & UNLOADING HELP</Text>
            <View style={styles.helperRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.helperTitle, { color: colors.textPrimary }]}>
                  Need helpers?
                </Text>
                <Text style={[styles.helperSub, { color: colors.textSecondary }]}>
                  ₹{HELPER_PRICE_PER_PERSON} per helper · carry & arrange
                </Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepBtn, helpers === 0 && styles.stepBtnDisabled]}
                  onPress={() => setHelpers((h) => Math.max(0, h - 1))}
                  disabled={helpers === 0}
                >
                  <Minus size={14} color={helpers === 0 ? colors.border : Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.stepCount}>{helpers}</Text>
                <TouchableOpacity
                  style={[styles.stepBtn, helpers === MAX_HELPERS && styles.stepBtnDisabled]}
                  onPress={() => setHelpers((h) => Math.min(MAX_HELPERS, h + 1))}
                  disabled={helpers === MAX_HELPERS}
                >
                  <Plus size={14} color={helpers === MAX_HELPERS ? colors.border : Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Summary ── */}
          {(selectedSize || helpers > 0) && (
            <View style={styles.summaryCard}>
              <Text style={styles.cardLabel}>✅ YOUR SELECTION</Text>
              {selectedSize && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Load size</Text>
                  <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                    {LOAD_SIZES.find((s) => s.id === selectedSize)?.label}
                  </Text>
                </View>
              )}
              {helpers > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    Helpers ({helpers} × ₹{HELPER_PRICE_PER_PERSON})
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                    ₹{helpers * HELPER_PRICE_PER_PERSON}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={{ height: 16 }} />
          <Button
            label={t('confirm')}
            onPress={handleContinue}
            disabled={!canContinue}
            style={{ width: '100%' }}
          />
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  safe: { flex: 1, backgroundColor: 'transparent' },

  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: colors.surfaceElevated, marginBottom: 16,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },

  truckCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderRadius: 24, padding: 16, marginBottom: 24,
    borderWidth: 1.5, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  truckImage: { width: 72, height: 72, resizeMode: 'contain' },
  truckInfo: { flex: 1, gap: 4 },
  truckName: { fontSize: 15, fontWeight: '700' },
  truckDesc: { fontSize: 12, lineHeight: 17 },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: colors.placeholder, marginBottom: 14 },

  sizeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.inputBackground,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tick: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sizeEmoji: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sizeEmojiText: { fontSize: 22 },
  sizeInfo: { flex: 1, gap: 3 },
  sizeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sizeName: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  weightBadge: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  weightBadgeText: { fontSize: 10, fontWeight: '700', color: colors.textSecondary },
  sizeDesc: { fontSize: 12, fontWeight: '500' },
  sizeExamples: { fontSize: 11, color: colors.border, marginTop: 1 },

  helperCard: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 18,
    marginTop: 8, marginBottom: 12,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: colors.placeholder, letterSpacing: 1.2, marginBottom: 12 },
  helperRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  helperTitle: { fontSize: 14, fontWeight: '700' },
  helperSub: { fontSize: 12, marginTop: 2 },

  stepper: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.subtleBg, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 6,
    borderWidth: 1, borderColor: colors.iconBorder,
  },
  stepBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.iconBorder,
  },
  stepBtnDisabled: { opacity: 0.45 },
  stepCount: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, minWidth: 20, textAlign: 'center' },

  summaryCard: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 18, marginBottom: 4,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 5,
  },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '700' },
})
;