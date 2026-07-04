/**
 * Vahan360 — Location Permission Rationale Modal
 *
 * Shown BEFORE the native OS permission dialog so the user understands
 * why we need their location before the system prompt appears.
 *
 * Fixes UX-HOME-008: "Permission message should explain why location
 * is needed before system permission prompt."
 */
import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { BorderRadius, Spacing, Shadow } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from './Button';

interface LocationPermissionModalProps {
  visible: boolean;
  /** Called when the user agrees to proceed — trigger the native OS prompt here. */
  onAllow: () => void;
  /** Called when the user declines to be asked right now. */
  onDeny: () => void;
}

export function LocationPermissionModal({
  visible,
  onAllow,
  onDeny,
}: LocationPermissionModalProps) {
  const { colors } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDeny}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }, Shadow.lg]}>
          <View style={styles.iconWrapper}>
            <MapPin size={30} color={Colors.primary} fill={Colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Enable Location Access
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Vahan360 uses your location to show nearby drivers, set your pickup
            point automatically, and give you accurate fare estimates. We only
            access it while you're using the app.
          </Text>

          <Button
            label="Allow Location Access"
            onPress={onAllow}
            style={styles.allowButton}
            accessibilityLabel="Allow location access"
          />
          <Button
            label="Not Now"
            onPress={onDeny}
            variant="ghost"
            style={styles.denyButton}
            accessibilityLabel="Not now"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BorderRadius.xxl,
    padding: 28,
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { ...Typography.h2, textAlign: 'center' },
  subtitle: { ...Typography.body, textAlign: 'center', lineHeight: 22 },
  allowButton: { width: '100%', marginTop: 8 },
  denyButton: { width: '100%' },
});
