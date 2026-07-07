export const Colors = {
  // Brand
  primary: '#FF6B00',
  primaryDark: '#E05A00',
  primaryLight: '#FFF0E5',
  primaryMid: '#FF8C33',

  // Status
  danger: '#D32F2F',
  dangerLight: '#FFEBEE',
  warning: '#F57C00',
  warningLight: '#FFF3E0',
  success: '#2E7D32',
  successLight: '#E8F5E9',

  // Light Theme (Customer App default)
  light: {
    background: '#F8F9FB',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textInverse: '#FFFFFF',
    border: '#E5E7EB',
    divider: '#F3F4F6',
    overlay: 'rgba(0,0,0,0.5)',
    skeleton: '#E5E7EB',
    skeletonHighlight: '#F3F4F6',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    inputBackground: '#F3F4F6',
    placeholder: '#9CA3AF',
    icon: '#6B7280',
    iconActive: '#FF6B00',
    shadow: 'rgba(0,0,0,0.08)',
    // Semantic extras — light orange tints used throughout UI
    cardBorder: '#FFE8D6',
    iconBorder: '#FFD6B3',
    iconBg: '#FFF0E6',
    subtleBg: '#FFF7F2',
    termsBg: '#FFFAF7',
  },

  // Dark Theme — rich dark greys, all orange tints replaced
  dark: {
    background: '#1A1C22',
    surface: '#23262F',
    surfaceElevated: '#2C2F3A',
    textPrimary: '#F0F1F3',
    textSecondary: '#B0B6C3',
    textInverse: '#1F2937',
    border: '#3A3D4A',
    divider: '#2C2F3A',
    overlay: 'rgba(0,0,0,0.65)',
    skeleton: '#2C2F3A',
    skeletonHighlight: '#3A3D4A',
    tabBar: '#23262F',
    tabBarBorder: '#3A3D4A',
    inputBackground: '#2C2F3A',
    placeholder: '#7A8090',
    icon: '#B0B6C3',
    iconActive: '#FF6B00',
    shadow: 'rgba(0,0,0,0.4)',
    // Semantic extras — dark equivalents of the orange tints
    cardBorder: '#3A3D4A',
    iconBorder: '#3A3D4A',
    iconBg: '#2C2F3A',
    subtleBg: '#2C2F3A',
    termsBg: '#23262F',
  },

  // Utility
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorScheme = 'light' | 'dark';
