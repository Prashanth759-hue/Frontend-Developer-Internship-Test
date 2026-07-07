import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography, FontFamily, FontSize } from '../../theme/typography';
import { Layout, BorderRadius } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export function Input({
  label,
  error,
  hint,
  containerStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...rest
}: InputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? Colors.danger
    : isFocused
    ? Colors.primary
    : colors.border;

  const bgColor = isFocused ? colors.surface : colors.inputBackground;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor: bgColor,
            borderWidth: isFocused || error ? 2 : 1,
          },
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
  {...rest}
  placeholderTextColor={colors.placeholder}
  onFocus={(e) => {
    setIsFocused(true);
    rest.onFocus?.(e);
  }}
  onBlur={(e) => {
    setIsFocused(false);
    rest.onBlur?.(e);
  }}
  accessibilityLabel={label}
  style={[
    styles.input,
    {
      color: colors.textPrimary,
      paddingLeft: leftIcon ? 4 : 0,
      paddingRight: rightIcon ? 4 : 0,

      borderWidth: 0,
      borderColor: 'transparent',
      backgroundColor: 'transparent',

      outlineWidth: 0,
      outlineColor: 'transparent',
      outlineStyle: 'none',

      boxShadow: 'none',
    } as any,
  ]}
/>

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconRight}
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    ...Typography.captionMedium,
  },
  inputWrapper: {
    minHeight: Layout.inputHeight,
    borderRadius: Layout.inputRadius,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    borderWidth: 0,
    paddingVertical: 0,
  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 8,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    ...Typography.caption,
    color: Colors.danger,
  },
  hint: {
    ...Typography.caption,
  },
});