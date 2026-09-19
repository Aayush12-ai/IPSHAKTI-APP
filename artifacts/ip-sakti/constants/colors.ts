/**
 * Semantic design tokens for IP-SAKTI.
 *
 * Theme: Lavender-Pinkish, Sharp Obsidian Black, and Pure White.
 * A human-crafted, ultra-sharp, high-contrast, premium aesthetic.
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

    // Backward-compatible Brand Aliases mapped to theme
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
  radius: 16,
};

export default colors;
