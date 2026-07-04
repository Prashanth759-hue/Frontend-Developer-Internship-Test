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
  },

  // Dark Theme
  dark: {
    background: '#0F1117',
    surface: '#1C1E26',
    surfaceElevated: '#252830',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textInverse: '#111827',
    border: '#2D3038',
    divider: '#1C1E26',
    overlay: 'rgba(0,0,0,0.7)',
    skeleton: '#2D3038',
    skeletonHighlight: '#374151',
    tabBar: '#1C1E26',
    tabBarBorder: '#2D3038',
    inputBackground: '#2D3038',
    placeholder: '#4B5563',
    icon: '#9CA3AF',
    iconActive: '#FF6B00',
    shadow: 'rgba(0,0,0,0.35)',
  },

  // Utility
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorScheme = 'light' | 'dark';
