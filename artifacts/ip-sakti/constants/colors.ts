/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#1F2924',
    tint: '#176B4D',
    background: '#F8F8F4',
    foreground: '#1F2924',
    card: '#FFFFFF',
    cardForeground: '#1F2924',
    primary: '#176B4D',
    primaryForeground: '#FFFFFF',
    secondary: '#E9F0EA',
    secondaryForeground: '#176B4D',
    muted: '#EEF1EC',
    mutedForeground: '#68756D',
    accent: '#D89B3D',
    accentForeground: '#FFFFFF',
    destructive: '#B94A45',
    destructiveForeground: '#FFFFFF',
    border: '#DCE4DE',
    input: '#DCE4DE',
    forest: '#176B4D',
    forestDeep: '#0E4A35',
    sage: '#6F9278',
    sageLight: '#E9F0EA',
    saffron: '#D89B3D',
    saffronLight: '#FBF1DE',
    canvas: '#F8F8F4',
    surfaceMuted: '#F2F5F0',
    inkSubtle: '#68756D',
    success: '#2C7A58',
    warning: '#B7791F',
  },
  radius: 16,
};

export default colors;
