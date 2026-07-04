import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { BorderRadius } from '../../theme/spacing';

type Status = 'completed' | 'cancelled' | 'ongoing' | 'pending';

interface StatusBadgeProps {
  status: Status;
}

const STATUS_CONFIG: Record<
  Status,
  { label: string; bg: string; color: string; dot: string }
> = {
  completed: {
    label: 'Completed',
    bg: Colors.successLight,
    color: Colors.success,
    dot: Colors.success,
  },
  cancelled: {
    label: 'Cancelled',
    bg: Colors.dangerLight,
    color: Colors.danger,
    dot: Colors.danger,
  },
  ongoing: {
    label: 'Ongoing',
    bg: Colors.primaryLight,
    color: Colors.primary,
    dot: Colors.primary,
  },
  pending: {
    label: 'Pending',
    bg: Colors.warningLight,
    color: Colors.warning,
    dot: Colors.warning,
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
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
