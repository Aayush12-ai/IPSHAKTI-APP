/**
 * Semantic design tokens for IP-SAKTI.
 *
 * Themes:
 * - light: Soothing Serene Iris, Soft Violet, Calming Slate, Crisp Whites
 * - dark: Deep Slate Navy (#0F172A), Soft Iris & Violet Glow, Crisp Text
 * - herbal: Calming Ayurvedic Eucalyptus, Soft Sage & Gentle Amber
 */

const colors = {
  light: {
    // Core Base (Soothing, Eye-Friendly)
    background: '#F8F9FC',
    canvas: '#F8F9FC',
    foreground: '#1E293B',
    text: '#1E293B',
    card: '#FFFFFF',
    cardForeground: '#1E293B',
    surfaceMuted: '#F1F5F9',
    muted: '#F1F5F9',
    mutedForeground: '#64748B',
    inkSubtle: '#64748B',
    border: '#E2E8F0',
    input: '#E2E8F0',

    // Primary & Serene Accents (Soothing Iris/Lavender & Soft Violet)
    primary: '#5B50A1',
    primaryForeground: '#FFFFFF',
    secondary: '#EEF2FF',
    secondaryForeground: '#4F46E5',
    black: '#0F172A',
    white: '#FFFFFF',

    // Lavender & Periwinkle Palette
    lavender: '#6366F1',
    lavenderDeep: '#4338CA',
    lavenderLight: '#EEF2FF',
    lavenderBorder: '#C7D2FE',
    tint: '#5B50A1',

    // Soft Violet / Calming Plum Palette (Soothing alternative to aggressive neon)
    pink: '#7C3AED',
    pinkDeep: '#5B21B6',
    pinkLight: '#F5F3FF',
    pinkBorder: '#DDD6FE',
    accent: '#7C3AED',
    accentForeground: '#FFFFFF',

    // Backward-compatible Brand Aliases
    forest: '#5B50A1',
    forestDeep: '#1E1B4B',
    sage: '#0D9488',
    sageLight: '#F0FDFA',
    saffron: '#D97706',
    saffronLight: '#FEF3C7',

    // Status Semantics (Soft & Harmonious)
    success: '#0D9488',
    successLight: '#F0FDFA',
    warning: '#D97706',
    warningLight: '#FFFBEB',
    destructive: '#E11D48',
    destructiveForeground: '#FFFFFF',
  },

  dark: {
    // Core Base (Deep Midnight Slate)
    background: '#0F172A',
    canvas: '#0F172A',
    foreground: '#F8FAFC',
    text: '#F8FAFC',
    card: '#1E293B',
    cardForeground: '#F8FAFC',
    surfaceMuted: '#334155',
    muted: '#334155',
    mutedForeground: '#94A3B8',
    inkSubtle: '#94A3B8',
    border: '#334155',
    input: '#334155',

    // Primary & Serene Accents
    primary: '#818CF8',
    primaryForeground: '#0F172A',
    secondary: '#1E1B4B',
    secondaryForeground: '#C7D2FE',
    black: '#020617',
    white: '#FFFFFF',

    // Lavender Palette
    lavender: '#818CF8',
    lavenderDeep: '#A5B4FC',
    lavenderLight: '#1E1B4B',
    lavenderBorder: '#3730A3',
    tint: '#818CF8',

    // Soft Violet Palette
    pink: '#A78BFA',
    pinkDeep: '#C4B5FD',
    pinkLight: '#2E1065',
    pinkBorder: '#5B21B6',
    accent: '#A78BFA',
    accentForeground: '#FFFFFF',

    // Backward-compatible Brand Aliases
    forest: '#818CF8',
    forestDeep: '#020617',
    sage: '#2DD4BF',
    sageLight: '#134E4A',
    saffron: '#FBBF24',
    saffronLight: '#451A03',

    // Status Semantics
    success: '#34D399',
    successLight: '#064E3B',
    warning: '#FBBF24',
    warningLight: '#451A03',
    destructive: '#FB7185',
    destructiveForeground: '#FFFFFF',
  },

  herbal: {
    // Core Base (Soothing Herbal Sage)
    background: '#F8FAF9',
    canvas: '#F8FAF9',
    foreground: '#0F291E',
    text: '#0F291E',
    card: '#FFFFFF',
    cardForeground: '#0F291E',
    surfaceMuted: '#E6F4F0',
    muted: '#E6F4F0',
    mutedForeground: '#476357',
    inkSubtle: '#476357',
    border: '#CCE3DB',
    input: '#CCE3DB',

    // Primary & Serene Accents
    primary: '#0D9488',
    primaryForeground: '#FFFFFF',
    secondary: '#E6F4F0',
    secondaryForeground: '#0D9488',
    black: '#071A13',
    white: '#FFFFFF',

    // Lavender / Green Palette
    lavender: '#14B8A6',
    lavenderDeep: '#0F766E',
    lavenderLight: '#CCFBF1',
    lavenderBorder: '#99F6E4',
    tint: '#0D9488',

    // Pinkish / Gold Palette
    pink: '#D97706',
    pinkDeep: '#B45309',
    pinkLight: '#FEF3C7',
    pinkBorder: '#FDE68A',
    accent: '#059669',
    accentForeground: '#FFFFFF',

    // Backward-compatible Brand Aliases
    forest: '#0D9488',
    forestDeep: '#071A13',
    sage: '#10B981',
    sageLight: '#E6F4F0',
    saffron: '#D97706',
    saffronLight: '#FEF3C7',

    // Status Semantics
    success: '#0D9488',
    successLight: '#CCFBF1',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    destructive: '#E11D48',
    destructiveForeground: '#FFFFFF',
  },

  radius: 16,
};

export default colors;
