import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { BorderRadius } from '../../theme/spacing';

type Status = 'completed' | 'cancelled' | 'ongoing' | 'booked' | 'pending';

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { colors } = useTheme();
  const STATUS_CONFIG: Record<Status, { label: string; bg: string; color: string; dot: string }> = {
    completed: { label: 'Completed', bg: colors.surfaceElevated, color: Colors.success, dot: Colors.success },
    cancelled:  { label: 'Cancelled',  bg: colors.surfaceElevated, color: Colors.danger,  dot: Colors.danger  },
    ongoing:    { label: 'Ongoing',    bg: colors.iconBg,          color: Colors.primary, dot: Colors.primary },
    booked:     { label: 'Booked',     bg: colors.iconBg,          color: Colors.warning, dot: Colors.warning },
    pending:    { label: 'Pending',    bg: colors.surfaceElevated, color: Colors.warning, dot: Colors.warning },
  };
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    ...Typography.caption,
    fontFamily: 'Inter_600SemiBold',
  },
});