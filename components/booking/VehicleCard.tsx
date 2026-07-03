import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bike, Car, Clock, Users } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { BorderRadius, Shadow } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';

interface Vehicle {
  id: string;
  name: string;
  description: string;
  eta: string;
  fare: number;
  icon: string;
  seats?: number;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  selected: boolean;
  onSelect: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  bike: Bike,
  car: Car,
};

export default function VehicleCard({ vehicle, selected, onSelect }: VehicleCardProps) {
  const { colors } = useTheme();
  const Icon = ICON_MAP[vehicle.icon] ?? Car;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surfaceElevated },
        Shadow.sm,
        selected && { borderColor: Colors.primary, borderWidth: 2 },
        !selected && { borderColor: 'transparent', borderWidth: 1.5 },
      ]}
      onPress={onSelect}
      activeOpacity={0.85}
      accessibilityLabel={`${vehicle.name}, ₹${vehicle.fare}, ETA ${vehicle.eta}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: selected ? colors.iconBg : colors.surface }]}>
        <Icon size={28} color={selected ? Colors.primary : colors.icon} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{vehicle.name}</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>{vehicle.description}</Text>

        <View style={styles.metaRow}>
          <Clock size={12} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>{vehicle.eta}</Text>
          {vehicle.seats && (
            <>
              <Users size={12} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {vehicle.seats} seat{vehicle.seats > 1 ? 's' : ''}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Fare + selected indicator */}
      <View style={styles.fareArea}>
        <Text style={[styles.fare, { color: selected ? Colors.primary : colors.textPrimary }]}>
          ₹{vehicle.fare}
        </Text>
        {selected && <View style={styles.selectedDot} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: BorderRadius.lg,
    padding: 16,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: { ...Typography.h3 },
  desc: { ...Typography.caption },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  metaText: { ...Typography.caption },
  fareArea: {
    alignItems: 'flex-end',
    gap: 6,
  },
  fare: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});