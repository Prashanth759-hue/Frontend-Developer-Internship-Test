import { TextStyle } from 'react-native';

export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 26,
  xxxl: 34,
};

export const LineHeight = {
  xs: 15,
  sm: 17,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 34,
};

export const Typography = {
  h1: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxl,
    lineHeight: LineHeight.xxl,
    letterSpacing: -0.5,
  } as TextStyle,

  h2: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
    letterSpacing: -0.3,
  } as TextStyle,

  h3: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    letterSpacing: -0.1,
  } as TextStyle,

  bodyLarge: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
  } as TextStyle,

  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
  } as TextStyle,

  bodyMedium: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
  } as TextStyle,

  caption: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
  } as TextStyle,

  captionMedium: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
  } as TextStyle,

  button: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    letterSpacing: 0.1,
  } as TextStyle,

  buttonSmall: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
  } as TextStyle,

  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  } as TextStyle,
};
