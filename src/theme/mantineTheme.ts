import { createTheme, rem, rgba } from '@mantine/core';

// Color palette
const colors = {
  primary: [
    '#f5f7ff', // 0: Lightest primary
    '#e6ebff', // 1
    '#d7dfff', // 2
    '#c8d4ff', // 3
    '#b9c9ff', // 4
    '#acbef7', // 5: Primary
    '#9bafef', // 6
    '#8a9fe7', // 7
    '#798fdf', // 8
    '#6880d7'  // 9: Darkest primary
  ],
  secondary: [
    '#f9f5fe', // 0: Lightest secondary
    '#f3eafd', // 1
    '#ecdffc', // 2
    '#e6d4fb', // 3
    '#dfcafa', // 4
    '#dbc1f7', // 5: Secondary
    '#d0b4ef', // 6
    '#c5a7e7', // 7
    '#ba9adf', // 8
    '#af8dd7'  // 9: Darkest secondary
  ],
  accent: [
    '#f4faff', // 0: Lightest accent
    '#e8f3ff', // 1
    '#dcedff', // 2
    '#d0e6ff', // 3
    '#c4dfff', // 4
    '#99b7f0', // 5: Accent
    '#8daae7', // 6
    '#819ddf', // 7
    '#7590d7', // 8
    '#6983cf'  // 9: Darkest accent
  ]
};

// Enhanced shadow system
const softShadows = {
  xs: `0 ${rem(1)} ${rem(2)} ${rgba('rgb(0, 0, 0)', 0.03)}, 0 ${rem(1)} ${rem(3)} ${rgba('rgb(0, 0, 0)', 0.04)}`,
  sm: `0 ${rem(1)} ${rem(3)} ${rgba('rgb(0, 0, 0)', 0.03)}, 0 ${rem(2)} ${rem(6)} ${rgba('rgb(0, 0, 0)', 0.05)}`,
  md: `0 ${rem(3)} ${rem(8)} ${rgba('rgb(0, 0, 0)', 0.04)}, 0 ${rem(4)} ${rem(10)} ${rgba('rgb(0, 0, 0)', 0.06)}`,
  lg: `0 ${rem(6)} ${rem(14)} ${rgba('rgb(0, 0, 0)', 0.05)}, 0 ${rem(8)} ${rem(16)} ${rgba('rgb(0, 0, 0)', 0.07)}`,
  xl: `0 ${rem(10)} ${rem(20)} ${rgba('rgb(0, 0, 0)', 0.06)}, 0 ${rem(12)} ${rem(22)} ${rgba('rgb(0, 0, 0)', 0.08)}`
};

// Glow effects
const glowEffects = {
  primary: `0 0 ${rem(12)} ${rgba(colors.primary[5], 0.25)}`,
  secondary: `0 0 ${rem(12)} ${rgba(colors.secondary[5], 0.25)}`,
  accent: `0 0 ${rem(12)} ${rgba(colors.accent[5], 0.25)}`,
  error: `0 0 ${rem(12)} ${rgba('#fd9fa0', 0.25)}`,
  success: `0 0 ${rem(12)} ${rgba('#96ff96', 0.25)}`,
  warning: `0 0 ${rem(12)} ${rgba('#fc934d', 0.25)}`,
  info: `0 0 ${rem(12)} ${rgba('#a0d3f9', 0.25)}`,
  // Focused input glow
  focusRing: `0 0 0 ${rem(2)} ${rgba(colors.primary[5], 0.2)}`
};

// Layering with subtle backgrounds
const layerBackgrounds = {
  base: '#ffffff',
  raised: '#fcfcfc',
  overlay: '#fafafa',
  sunken: '#f8f8f8',
  hover: rgba(colors.primary[0], 0.6)
};

// Create and export the theme
export const theme = createTheme({
  colors: {
    primary: [...colors.primary] as [string, string, string, string, string, string, string, string, string, string],
    secondary: [...colors.secondary] as [string, string, string, string, string, string, string, string, string, string],
    accent: [...colors.accent] as [string, string, string, string, string, string, string, string, string, string],
    // Keep other colors like error, warning, etc.
  },
  shadows: {
    ...softShadows,
    // Special shadows
    card: softShadows.sm,
    dropdown: softShadows.md,
    modal: softShadows.lg,
    notification: softShadows.md,
  },
  other: {
    glow: glowEffects,
    layerBackgrounds,
    transitionDuration: '0.2s',
    transitionTiming: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  components: {
    Card: {
      defaultProps: {
        shadow: 'card',
      },
      styles: {
        root: {
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: softShadows.md,
          }
        }
      }
    },
    Button: {
      styles: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          }
        }
      }
    }
    // Define more component styles as needed
  }
});

// Helper functions for accessing theme properties in components
export const getShadow = (key: keyof typeof softShadows) => softShadows[key];
export const getGlow = (key: keyof typeof glowEffects) => glowEffects[key];
export const getLayerBackground = (key: keyof typeof layerBackgrounds) => layerBackgrounds[key];
