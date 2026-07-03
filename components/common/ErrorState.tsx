import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Button } from './Button';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <AlertCircle size={48} color={Colors.danger} />
      <Text style={[styles.title, { color: colors.textPrimary }]}>Oops!</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry && (
        <Button label="Retry" onPress={onRetry} style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: Spacing.md,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: Spacing.sm,
    paddingHorizontal: 32,
    alignSelf: 'center',
  },
});