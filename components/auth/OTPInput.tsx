import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { BorderRadius } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';

const OTP_LENGTH = 6;

interface OTPInputProps {
  value: string[];
  onChange: (otp: string[]) => void;
  hasError?: boolean;
}

export default function OTPInput({ value, onChange, hasError = false }: OTPInputProps) {
  const { colors } = useTheme();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[index] = digit;
    onChange(next);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (digit && index === OTP_LENGTH - 1 && next.every((d) => d)) inputRefs.current[index]?.blur();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      const next = [...value];
      next[index - 1] = '';
      onChange(next);
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {Array(OTP_LENGTH).fill(0).map((_, i) => (
        <TextInput
          key={i}
          ref={(ref) => { inputRefs.current[i] = ref; }}
          style={[
            styles.box,
            {
              backgroundColor: colors.inputBackground,
              color: colors.textPrimary,
              borderColor: hasError ? Colors.danger : value[i] ? Colors.primary : colors.border,
              borderWidth: hasError || value[i] ? 1.5 : 1,
            },
          ]}
          keyboardType="numeric"
          maxLength={1}
          value={value[i]}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
          accessibilityLabel={`OTP digit ${i + 1} of ${OTP_LENGTH}`}
          autoFocus={i === 0}
          textAlign="center"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  box: {
    flex: 1, height: 56, maxWidth: 52,
    borderRadius: BorderRadius.md, borderWidth: 1,
    fontFamily: FontFamily.bold, fontSize: FontSize.xl,
  },
});