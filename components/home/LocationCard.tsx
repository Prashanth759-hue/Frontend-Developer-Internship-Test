import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, Briefcase, MapPin, ChevronRight, Plus } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { BorderRadius, Layout, Shadow, Spacing } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { useSavedAddressStore } from '../../store/savedAddressStore';

const ICON_MAP: Record<string, React.ReactNode> = {
  home: <Home size={16} color="#FFFFFF" />,
  briefcase: <Briefcase size={16} color="#FFFFFF" />,
  'map-pin': <MapPin size={16} color="#FFFFFF" />,
};

interface LocationCardProps {
  onSelect: (address: { label: string; address: string }) => void;
  onAddNew: () => void;
}

export function LocationCard({ onSelect, onAddNew }: LocationCardProps) {
  const { colors } = useTheme();
  const { addresses } = useSavedAddressStore();

  if (addresses.length === 0) return null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <LinearGradient
          colors={['#FF6B00', '#FF9A4D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerAccent}
        />
        <Text style={styles.heading}>Saved Places</Text>
      </View>

      <View style={styles.rowsContainer}>
        {addresses.map((item, index) => (
          <React.Fragment key={item.id}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => onSelect({ label: item.label, address: item.address })}
              accessibilityLabel={`Use ${item.label}: ${item.address}`}
              accessibilityRole="button"
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B00', '#FF9A4D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconWrap}
              >
                {ICON_MAP[item.icon] ?? <MapPin size={16} color="#FFFFFF" />}
              </LinearGradient>
              <View style={styles.info}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>
                  {item.label}
                </Text>
                <Text
                  style={[styles.address, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.address}
                </Text>
              </View>
              <View style={styles.chevronWrap}>
                <ChevronRight size={15} color="#FF6B00" />
              </View>
            </TouchableOpacity>

            {index < addresses.length - 1 && (
              <View style={styles.divider} />
            )}
          </React.Fragment>
        ))}

        {/* Divider before add */}
        <View style={styles.divider} />

        {/* Add new address */}
        <TouchableOpacity
          style={styles.addRow}
          onPress={onAddNew}
          accessibilityLabel="Add new saved address"
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <View style={styles.addIconWrap}>
            <Plus size={16} color="#FF6B00" />
          </View>
          <Text style={styles.addLabel}>Add a place</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Layout.screenPadding,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderWidth: 1,
    borderColor: '#FFE8D6',
  },
  cardHeader: {
    overflow: 'hidden',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  headerAccent: {
    height: 4,
    width: '100%',
  },
  heading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B00',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 6,
  },
  rowsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    minHeight: 62,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  address: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#FFF0E6',
    marginLeft: 50,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    minHeight: 56,
  },
  addIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF0E6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFD6B3',
    borderStyle: 'dashed',
  },
  addLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B00',
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF0E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
