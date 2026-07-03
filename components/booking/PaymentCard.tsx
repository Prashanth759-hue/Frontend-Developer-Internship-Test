import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Banknote, Smartphone, Wallet, Check } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { BorderRadius, Layout, Shadow } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import type { PaymentMode } from '../../store/bookingStore';

interface PaymentOption {
  id: PaymentMode;
  label: string;
  subtitle: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
}

const OPTIONS: PaymentOption[] = [
  { id: 'cash', label: 'Cash', subtitle: 'Pay on delivery', Icon: Banknote },
  { id: 'upi', label: 'UPI', subtitle: 'GPay, PhonePe, Paytm', Icon: Smartphone },
  { id: 'wallet', label: 'Vahan Pay', subtitle: 'Balance: ₹0', Icon: Wallet },
];

interface PaymentCardProps {
  selected: PaymentMode;
  onSelect: (mode: PaymentMode) => void;
}

export default function PaymentCard({ selected, onSelect }: PaymentCardProps) {
  const { colors } = useTheme();

  return (
    <View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Payment Method</Text>
      <View style={styles.options}>
        {OPTIONS.map((opt) => {
          const isActive = selected === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.option,
                { backgroundColor: colors.surfaceElevated },
                Shadow.sm,
                isActive && { borderColor: Colors.primary, borderWidth: 1.5 },
                !isActive && { borderColor: colors.border, borderWidth: 1 },
              ]}
              onPress={() => onSelect(opt.id)}
              activeOpacity={0.85}
              accessibilityLabel={`Pay with ${opt.label}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: isActive }}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: isActive ? colors.iconBg : colors.surface },
                ]}
              >
                <opt.Icon size={20} color={isActive ? Colors.primary : colors.icon} />
              </View>
              <Text style={[styles.label, { color: colors.textPrimary }]}>{opt.label}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {opt.subtitle}
              </Text>
              {isActive && (
                <View style={styles.checkWrap}>
                  <Check size={14} color={Colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h3,
    marginBottom: 12,
  },
  options: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    minHeight: 88,
    justifyContent: 'center',
    position: 'relative',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: { ...Typography.captionMedium, textAlign: 'center' },
  subtitle: { ...Typography.caption, textAlign: 'center', lineHeight: 14 },
  checkWrap: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});