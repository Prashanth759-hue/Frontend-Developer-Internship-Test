import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bike,
  Car,
  Package,
  Mail,
  Truck,
  Box,
  Home,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { BorderRadius, Layout, Shadow } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { MOCK_SERVICES } from '../../constants/mockData';

type ServiceItem = (typeof MOCK_SERVICES)[0];

const ICON_MAP: Record<string, (color: string) => React.ReactNode> = {
  bike:      (c) => <Bike    size={24} color={c} />,
  car:       (c) => <Car     size={24} color={c} />,
  auto:      (c) => <Truck   size={24} color={c} />,
  package:   (c) => <Package size={24} color={c} />,
  mail:      (c) => <Mail    size={24} color={c} />,
  truck:     (c) => <Truck   size={24} color={c} />,
  container: (c) => <Box     size={24} color={c} />,
  home:      (c) => <Home    size={24} color={c} />,
};

interface ServiceTileProps {
  item: ServiceItem;
  onPress: () => void;
}

function ServiceTile({ item, onPress }: ServiceTileProps) {
  const { colors } = useTheme();
  const IconNode = ICON_MAP[item.icon]?.('#FFFFFF') ?? (
    <Package size={24} color="#FFFFFF" />
  );

  return (
    <TouchableOpacity
      style={styles.tile}
      onPress={onPress}
      accessibilityLabel={`Book ${item.label}, ETA ${item.eta}, ${item.fare}`}
      accessibilityRole="button"
      activeOpacity={0.82}
    >
      {/* Gradient icon circle */}
      <LinearGradient
        colors={['#FF6B00', '#FF9A4D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconWrap}
      >
        {IconNode}
      </LinearGradient>

      <Text style={[styles.label, { color: colors.textPrimary }]} numberOfLines={3}>
        {item.label}
      </Text>

      <Text style={styles.eta}>{item.eta}</Text>
    </TouchableOpacity>
  );
}

interface ServiceGridProps {
  category: 'ride' | 'logistics';
  onSelect: (item: ServiceItem) => void;
}

export function ServiceGrid({ category, onSelect }: ServiceGridProps) {
  const items = MOCK_SERVICES.filter((s) => s.category === category);

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <ServiceTile key={item.id} item={item} onPress={() => onSelect(item)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  tile: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE2CC',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 110,

    shadowColor: '#FF6B00',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
    color: '#1A1A1A',
  },
  eta: {
    fontSize: 11,
    color: '#FF6B00',
    fontWeight: '600',
    textAlign: 'center',
  },
});
