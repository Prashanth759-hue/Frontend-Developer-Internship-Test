/**
 * Vahan360 — AddressText
 *
 * Displays an address with graceful wrapping instead of silent
 * truncation. Long addresses wrap onto additional lines (capped at
 * `maxLines`, default 3) and only ellipsize as a last resort if they
 * exceed that — never hiding the row's action button.
 *
 * Fixes UX-LOC-008: long address truncation on booking screen / ride
 * summary should wrap, not be hidden behind a single truncated line.
 */
import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

interface AddressTextProps {
  children: string | null | undefined;
  style?: StyleProp<TextStyle>;
  /** Max lines before ellipsizing. Default 3 — enough for most full addresses. */
  maxLines?: number;
  fallback?: string;
}

export function AddressText({
  children,
  style,
  maxLines = 3,
  fallback = '—',
}: AddressTextProps) {
  const text = children && children.trim().length > 0 ? children : fallback;

  return (
    <Text
      style={[{ flexShrink: 1 }, style]}
      numberOfLines={maxLines}
      ellipsizeMode="tail"
    >
      {text}
    </Text>
  );
}
