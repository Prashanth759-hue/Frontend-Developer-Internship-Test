import { TextStyle, Dimensions, PixelRatio } from 'react-native';

// ── Responsive font scaling ───────────────────────────────────────────────
// Scales font sizes relative to a 390px wide base (iPhone 14 / Pixel 7).
// On a 360px phone fonts shrink slightly; on a 430px phone they grow slightly.
// Clamped so nothing goes below 85% or above 115% of the design value.
const BASE_WIDTH = 390;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = (size: number): number => {
  const ratio = SCREEN_WIDTH / BASE_WIDTH;
  const clamped = Math.min(Math.max(ratio, 0.85), 1.15);
  return Math.round(PixelRatio.roundToNearestPixel(size * clamped));
};
// ─────────────────────────────────────────────────────────────────────────

export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const FontSize = {
  xs: scale(11),
  sm: scale(12),
  md: scale(14),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(26),
  xxxl: scale(34),
};

export const LineHeight = {
  xs: scale(15),
  sm: scale(17),
  md: scale(20),
  lg: scale(24),
  xl: scale(28),
  xxl: scale(34),
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
