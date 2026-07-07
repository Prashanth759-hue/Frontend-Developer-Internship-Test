/**
 * Vahan360 — Turn On Location Popup
 *
 * In-app popup that asks the user to turn on location, styled to match
 * the native "Location Accuracy" style dialog (card with pin icons,
 * "No thanks" / "Turn on" actions). Follows the app's light/dark theme,
 * same as every other modal in the app (e.g. LocationPermissionModal).
 *
 * This is OUR popup — it always shows first. If the user taps "Turn on",
 * the real OS permission/location request fires next, and the device may
 * then show its OWN native dialogs (permission prompt, Android's
 * "Location Accuracy" dialog, etc.) — those are controlled by the device,
 * not by this app, and can't be skipped or restyled.
 *
 * "No thanks" simply closes this popup. Nothing else happens.
 */
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MapPin, LocateFixed } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { BorderRadius, Spacing, Shadow } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';

interface TurnOnLocationModalProps {
  visible: boolean;
  /** Called when the user taps "Turn on" — trigger the real location request here. */
  onAllow: () => void;
  /** Called when the user taps "No thanks" — just close the popup. */
  onDeny: () => void;
}

export function TurnOnLocationModal({
  visible,
  onAllow,
  onDeny,
}: TurnOnLocationModalProps) {
  const { colors } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDeny}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }, Shadow.lg]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Turn on Location to continue
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We use your location to show nearby drivers, set your pickup point
            automatically, and give you accurate fare estimates.
          </Text>

          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: colors.iconBg }]}>
              <MapPin size={16} color={Colors.primary} />
            </View>
            <Text style={[styles.rowText, { color: colors.textPrimary }]}>
              Device location
            </Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: colors.iconBg }]}>
              <LocateFixed size={16} color={Colors.primary} />
            </View>
            <Text style={[styles.rowText, { color: colors.textPrimary }]}>
              Location access, so we can find drivers near you
            </Text>
          </View>

          <Text style={[styles.note, { color: colors.textSecondary }]}>
            You can change this anytime from your phone's location settings.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.noThanksBtn, { borderColor: colors.border }]}
              onPress={onDeny}
              accessibilityLabel="No thanks"
              accessibilityRole="button"
            >
              <Text style={[styles.noThanksText, { color: colors.textPrimary }]}>
                No thanks
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.turnOnBtn}
              onPress={onAllow}
              accessibilityLabel="Turn on location"
              accessibilityRole="button"
            >
              <Text style={styles.turnOnText}>Turn on</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: BorderRadius.xxl,
    padding: 24,
    gap: Spacing.sm + 2,
  },
  title: { ...Typography.h2, lineHeight: 25 },
  subtitle: { ...Typography.body, lineHeight: 19, fontSize: 13.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '500',
  },
  note: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 6,
  },
  noThanksBtn: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 24,
    borderWidth: 1,
  },
  noThanksText: {
    fontSize: 14,
    fontWeight: '600',
  },
  turnOnBtn: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 24,
    backgroundColor: Colors.primary,
  },
  turnOnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});