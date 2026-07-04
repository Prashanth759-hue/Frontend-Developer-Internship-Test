import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Layout } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  icon?: React.ReactNode;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
  icon,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      height: size === 'sm' ? 44 : size === 'lg' ? 60 : Layout.buttonHeight,
      borderRadius: Layout.buttonRadius,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
      minWidth: Layout.minTouchTarget,
    };
    if (isDisabled) return { ...base, backgroundColor: colors.border, opacity: 0.6 };
    switch (variant) {
      case 'primary':   return { ...base, backgroundColor: Colors.primary };
      case 'secondary': return { ...base, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border };
      case 'outline':   return { ...base, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary };
      case 'ghost':     return { ...base, backgroundColor: 'transparent' };
      case 'danger':    return { ...base, backgroundColor: Colors.danger };
      default:          return { ...base, backgroundColor: Colors.primary };
    }
  };

  const getTextStyle = (): TextStyle => {
    if (isDisabled) return { ...Typography.button, color: colors.textSecondary };
    switch (variant) {
      case 'primary':
      case 'danger':    return { ...Typography.button, color: Colors.white };
      case 'secondary': return { ...Typography.button, color: colors.textPrimary };
      case 'outline':
      case 'ghost':     return { ...Typography.button, color: Colors.primary };
      default:          return { ...Typography.button, color: Colors.white };
    }
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? Colors.white : Colors.primary} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), textStyle]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}