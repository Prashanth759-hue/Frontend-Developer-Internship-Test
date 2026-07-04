import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Minus, Plus, Package2, Users } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';
import { MINI_TRUCK_ITEM_CATEGORIES, HELPER_PRICE_PER_PERSON, MAX_HELPERS } from '../../constants/mockData';
import HOME_BG from '../../assets/bg/homeBg';

// Base pricing for the within-city / between-cities Add Items flow.
const MOVERS_BASE_FARE = 799;
const MOVERS_PER_ITEM_RATE = 99;

export default function MoversItemsScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const { moversFlow, setMovingItems, setMovingItemCount, setHelperCount, setSelectedVehicle, setEstimatedFare } =
    useBookingStore();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [helpers, setHelpers] = useState(0);

  const totalItems = useMemo(
    () => Object.values(quantities).reduce((sum, q) => sum + q, 0),
    [quantities]
  );

  const helperCost = helpers * HELPER_PRICE_PER_PERSON;
  const estimatedFare = totalItems > 0 ? MOVERS_BASE_FARE + totalItems * MOVERS_PER_ITEM_RATE + helperCost : 0;

  const canContinue = totalItems > 0;

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleContinue = () => {
    if (!canContinue) return;

    const items = MINI_TRUCK_ITEM_CATEGORIES.flatMap((cat) =>
      cat.items
        .filter((it) => (quantities[it.id] ?? 0) > 0)
        .map((it) => ({ id: it.id, name: it.name, qty: quantities[it.id] }))
    );

    setMovingItems(items);
    setMovingItemCount(totalItems);
    setHelperCount(helpers);
    setSelectedVehicle('movers_team');
    setEstimatedFare(estimatedFare);
    router.push('/(booking)/movers-schedule');
  };

  return (
    <ImageBackground source={HOME_BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Add Items</Text>
              <Text style={styles.heroSubtitle}>
                {moversFlow === 'between_cities' ? 'What are you shifting to the new city?' : 'What are you shifting?'}
              </Text>
            </View>
          </View>
          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Package2 size={12} color="#FF6B00" />
              <Text style={styles.chipText}> {totalItems} item{totalItems === 1 ? '' : 's'} added</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {MINI_TRUCK_ITEM_CATEGORIES.map((cat) => (
            <View key={cat.id} style={styles.card}>
              <Text style={styles.cardLabel}>{cat.emoji} {cat.name.toUpperCase()}</Text>
              {cat.items.map((item, idx) => {
                const qty = quantities[item.id] ?? 0;
                return (
                  <React.Fragment key={item.id}>
                    {idx > 0 && <View style={styles.divider} />}
                    <View style={styles.itemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.name}</Text>
                        {'note' in item && (item as any).note ? (
                          <Text style={[styles.itemNote, { color: colors.textSecondary }]}>{(item as any).note}</Text>
                        ) : null}
                      </View>
                      <View style={styles.stepper}>
                        <TouchableOpacity
                          style={[styles.stepBtn, qty === 0 && styles.stepBtnDisabled]}
                          onPress={() => updateQty(item.id, -1)}
                          disabled={qty === 0}
                        >
                          <Minus size={14} color={qty === 0 ? colors.border : Colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.stepCount}>{qty}</Text>
                        <TouchableOpacity style={styles.stepBtn} onPress={() => updateQty(item.id, 1)}>
                          <Plus size={14} color={Colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </React.Fragment>
                );
              })}
            </View>
          ))}

          {/* ── Helpers ── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🧑‍🤝‍🧑 LOADING & UNLOADING HELP</Text>
            <View style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, { color: colors.textPrimary }]}>Need helpers?</Text>
                <Text style={[styles.itemNote, { color: colors.textSecondary }]}>
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

          {totalItems > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.cardLabel}>✅ ESTIMATED FARE</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  {totalItems} item{totalItems === 1 ? '' : 's'}{helpers > 0 ? ` · ${helpers} helper${helpers === 1 ? '' : 's'}` : ''}
                </Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>₹{estimatedFare}</Text>
              </View>
            </View>
          )}

          <Button
            label={canContinue ? `Continue · Schedule Pickup` : 'Add at least one item'}
            onPress={handleContinue}
            disabled={!canContinue}
            style={{ width: '100%', marginTop: 4 }}
          />
          <View style={{ height: 24 }} />
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
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },

  content: { paddingHorizontal: 16, paddingBottom: 16, gap: 14 },

  card: {
    backgroundColor: colors.surface, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4, gap: 4,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: colors.placeholder, letterSpacing: 1.2, marginBottom: 8 },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: 2 },

  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  itemName: { fontSize: 14, fontWeight: '700' },
  itemNote: { fontSize: 11, marginTop: 2 },

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
    backgroundColor: colors.surface, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, flex: 1 },
  summaryValue: { fontSize: 16, fontWeight: '800' },
});
