import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { BorderRadius, Shadow, Spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';

interface FareRow {
  label: string;
  value: string;
}

interface FareCardProps {
  rows: FareRow[];
  total: string;
  distanceKm?: number;
  durationMin?: number;
}

export default function FareCard({ rows, total, distanceKm, durationMin }: FareCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surfaceElevated }, Shadow.md]}
      accessibilityLabel="Fare breakdown"
    >
      <Text style={[styles.title, { color: colors.textPrimary }]}>Fare Breakdown</Text>

      {/* Distance / Duration metadata */}
      {(distanceKm !== undefined || durationMin !== undefined) && (
        <View style={[styles.metaRow, { backgroundColor: colors.surface }]}>
          {distanceKm !== undefined && (
            <View style={styles.metaItem}>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                {distanceKm.toFixed(1)} km
              </Text>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Distance</Text>
            </View>
          )}
          {distanceKm !== undefined && durationMin !== undefined && (
            <View style={[styles.metaDivider, { backgroundColor: colors.divider }]} />
          )}
          {durationMin !== undefined && (
            <View style={styles.metaItem}>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                ~{durationMin} min
              </Text>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Duration</Text>
            </View>
          )}
        </View>
      )}

      {/* Fare rows */}
      <View style={styles.rows}>
        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{row.label}</Text>
            <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total</Text>
        <Text style={[styles.totalValue, { color: Colors.primary }]}>{total}</Text>
      </View>

      {/* Safety note */}
      <View style={[styles.safetyNote, { backgroundColor: colors.iconBg }]}>
        <Text style={[styles.safetyText, { color: Colors.primaryDark }]}>
          🛡️ Covered under Vahan360 passenger safety policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: 16,
    gap: Spacing.sm,
  },
  title: {
    ...Typography.h3,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: 4,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metaValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  metaLabel: { ...Typography.caption },
  metaDivider: {
    width: 1,
    marginVertical: 4,
  },
  rows: { gap: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: { ...Typography.body },
  rowValue: { ...Typography.bodyMedium },
  divider: { height: 1, marginVertical: 4 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  totalValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
  },
  safetyNote: {
    borderRadius: BorderRadius.sm,
    padding: 10,
    marginTop: 4,
  },
  safetyText: {
    ...Typography.caption,
    lineHeight: 18,
  },
});