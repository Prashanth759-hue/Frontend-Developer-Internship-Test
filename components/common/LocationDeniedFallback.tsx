/**
 * Vahan360 — Location Denied Fallback
 *
 * Shown whenever location permission is denied or disabled in Settings.
 * Always gives the user a clear way forward: either re-enable permission
 * from Settings, or enter their address manually — never a dead end.
 *
 * Fixes:
 *  - UX-HOME-009 (location denied state should show manual entry option
 *    with clear instruction)
 *  - UX-LOC-010 (map screen should guide to enable permission or enter
 *    address manually when permission is disabled)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Linking } from 'react-native';
import { MapPinOff } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { BorderRadius, Spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from './Button';

interface LocationDeniedFallbackProps {
  /** Called when the user wants to type their address manually. */
  onEnterManually: () => void;
  /** Optional override copy. */
  title?: string;
  message?: string;
  /** Compact mode trims padding/heading for inline use (e.g. inside a card). */
  compact?: boolean;
}

export function LocationDeniedFallback({
  onEnterManually,
  title = "Location access is off",
  message = "We can't detect your location right now. You can enable it in Settings, or enter your address manually to continue.",
  compact = false,
}: LocationDeniedFallbackProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        compact && styles.cardCompact,
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: colors.iconBg }]}>
        <MapPinOff size={compact ? 22 : 28} color={Colors.primary} />
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }, compact && styles.titleCompact]}>
        {title}
      </Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>

      <View style={styles.actions}>
        <Button
          label="Enable in Settings"
          onPress={() => Linking.openSettings()}
          variant="outline"
          size="sm"
          style={styles.actionBtn}
        />
        <Button
          label="Enter Address Manually"
          onPress={onEnterManually}
          variant="primary"
          size="sm"
          style={styles.actionBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: 20,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardCompact: {
    padding: 14,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: { ...Typography.h3, textAlign: 'center' },
  titleCompact: { fontSize: 15 },
  message: { ...Typography.caption, textAlign: 'center', lineHeight: 18 },
  actions: { width: '100%', gap: 8, marginTop: 6 },
  actionBtn: { width: '100%' },
});
