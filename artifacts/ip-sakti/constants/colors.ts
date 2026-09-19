/**
 * Semantic design tokens for IP-SAKTI.
 *
 * Themes:
 * - light: Lavender-Pinkish, Sharp Obsidian Black, Pure White
 * - dark: Midnight Obsidian Dark (#0A0B10), Glowing Lavender & Pink, White Text
 * - herbal: Classical Emerald Green & Ayurvedic Gold
 */

const colors = {
  light: {
    // Core Base
    background: '#FAF8FC',
    canvas: '#FAF8FC',
    foreground: '#0F1016',
    text: '#0F1016',
    card: '#FFFFFF',
    cardForeground: '#0F1016',
    surfaceMuted: '#F4EEF8',
    muted: '#F4EEF8',
    mutedForeground: '#645E73',
    inkSubtle: '#645E73',
    border: '#E5DEEC',
    input: '#E5DEEC',

    // Primary & Noir
    primary: '#7B2CBF',
    primaryForeground: '#FFFFFF',
    secondary: '#F2EDFC',
    secondaryForeground: '#7B2CBF',
    black: '#0F1016',
    white: '#FFFFFF',

    // Lavender Palette
    lavender: '#8B5CF6',
    lavenderDeep: '#5B21B6',
    lavenderLight: '#F2EDFC',
    lavenderBorder: '#DDD0FA',
    tint: '#7B2CBF',

    // Pinkish / Rosé Palette
    pink: '#E63973',
    pinkDeep: '#BE123C',
    pinkLight: '#FDF2F4',
    pinkBorder: '#FBCFE8',
    accent: '#E63973',
    accentForeground: '#FFFFFF',

    // Backward-compatible Brand Aliases
    forest: '#7B2CBF',
    forestDeep: '#0F1016',
    sage: '#9D4EDD',
    sageLight: '#F2EDFC',
    saffron: '#E63973',
    saffronLight: '#FDF2F4',

    // Status Semantics
    success: '#059669',
    successLight: '#ECFDF5',
    warning: '#D97706',
    warningLight: '#FFFBEB',
    destructive: '#E11D48',
    destructiveForeground: '#FFFFFF',
  },

  dark: {
    // Core Base
    background: '#0A0B10',
    canvas: '#0A0B10',
    foreground: '#F8FAFC',
    text: '#F8FAFC',
    card: '#13141F',
    cardForeground: '#F8FAFC',
    surfaceMuted: '#1C1D2C',
    muted: '#1C1D2C',
    mutedForeground: '#94A3B8',
    inkSubtle: '#94A3B8',
    border: '#25273A',
    input: '#25273A',

    // Primary & Noir
    primary: '#A78BFA',
    primaryForeground: '#0A0B10',
    secondary: '#232038',
    secondaryForeground: '#C4B5FD',
    black: '#050608',
    white: '#FFFFFF',

    // Lavender Palette
    lavender: '#A78BFA',
    lavenderDeep: '#C4B5FD',
    lavenderLight: '#232038',
    lavenderBorder: '#3E3466',
    tint: '#A78BFA',

    // Pinkish / Rosé Palette
    pink: '#F43F5E',
    pinkDeep: '#FB7185',
    pinkLight: '#341523',
    pinkBorder: '#5C223C',
    accent: '#F43F5E',
    accentForeground: '#FFFFFF',

    // Backward-compatible Brand Aliases
    forest: '#A78BFA',
    forestDeep: '#050608',
    sage: '#C084FC',
    sageLight: '#232038',
    saffron: '#F43F5E',
    saffronLight: '#341523',

    // Status Semantics
    success: '#10B981',
    successLight: '#064E3B',
    warning: '#F59E0B',
    warningLight: '#451A03',
    destructive: '#F43F5E',
    destructiveForeground: '#FFFFFF',
  },

  herbal: {
    // Core Base
    background: '#F7FAF7',
    canvas: '#F7FAF7',
    foreground: '#111827',
    text: '#111827',
    card: '#FFFFFF',
    cardForeground: '#111827',
    surfaceMuted: '#EBF5EC',
    muted: '#EBF5EC',
    mutedForeground: '#4B5563',
    inkSubtle: '#4B5563',
    border: '#D1E7D5',
    input: '#D1E7D5',

    // Primary & Noir
    primary: '#15803D',
    primaryForeground: '#FFFFFF',
    secondary: '#E8F5E9',
    secondaryForeground: '#15803D',
    black: '#0D1F12',
    white: '#FFFFFF',

    // Lavender / Green Palette
    lavender: '#16A34A',
    lavenderDeep: '#15803D',
    lavenderLight: '#E8F5E9',
    lavenderBorder: '#BBF7D0',
    tint: '#15803D',

    // Pinkish / Gold Palette
    pink: '#D97706',
    pinkDeep: '#B45309',
    pinkLight: '#FEF3C7',
    pinkBorder: '#FDE68A',
    accent: '#D97706',
    accentForeground: '#FFFFFF',

    // Backward-compatible Brand Aliases
    forest: '#15803D',
    forestDeep: '#0D1F12',
    sage: '#22C55E',
    sageLight: '#E8F5E9',
    saffron: '#D97706',
    saffronLight: '#FEF3C7',

    // Status Semantics
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    destructive: '#DC2626',
    destructiveForeground: '#FFFFFF',
  },

  radius: 16,
};

export default colors;
