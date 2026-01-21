// PrayerFirst Design System
// Centralized theme for consistent styling across the app

export const colors = {
  // Primary - Orange (from dove mascot)
  primary: {
    main: '#E8752C',
    light: '#F5944D',
    soft: '#FDEEE5',
  },

  // Backgrounds
  background: {
    cream: '#FDF8F3',
    warmWhite: '#FAF5EF',
    peach: '#F5E6DB',
  },

  // Text colors (browns from dove outline)
  text: {
    primary: '#5C453A',    // Dark brown - headings
    secondary: '#8B6B5B',  // Medium brown - body text
    muted: '#B89A8A',      // Light brown - subtle text
  },

  // UI Elements
  ui: {
    buttonDark: '#2D2A3E',
    border: '#D4C4B8',
    white: '#FFFFFF',
    overlay: 'rgba(255, 255, 255, 0.2)',
    overlayLight: 'rgba(255, 255, 255, 0.08)',
  },

  // Accent colors (from olive branch)
  accent: {
    green: '#7A9E5C',
    greenDark: '#5C7A44',
  },
};

export const typography = {
  // Font sizes
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },

  // Font weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 30,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
};

const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export default theme;