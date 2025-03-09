import { createTheme, MantineColorsTuple, rem } from '@mantine/core';

// Color palette definitions
const primaryColors: MantineColorsTuple = [
  '#e9edff', // 0: Lightest
  '#dce2ff', // 1
  '#c1c9fe', // 2
  '#a5b0fd', // 3
  '#8b98fc', // 4
  '#7987fc', // 5: Base
  '#6775fc', // 6
  '#5563f8', // 7
  '#4251f6', // 8
  '#2d3ff2'  // 9: Darkest
];

const secondaryColors: MantineColorsTuple = [
  '#f8edff', // 0: Lightest
  '#f1e1fe', // 1
  '#e4cffe', // 2
  '#d8b4fe', // 3
  '#c99ffb', // 4
  '#bd88fa', // 5: Base
  '#b06bfb', // 6
  '#a64ffb', // 7
  '#9b38f6', // 8
  '#8f29ed'  // 9: Darkest
];

const accentColors: MantineColorsTuple = [
  '#e5efff', // 0: Lightest
  '#cee2ff', // 1
  '#a9cbff', // 2
  '#84b4fe', // 3
  '#60a0fe', // 4
  '#4b8efc', // 5: Base
  '#3e7df8', // 6
  '#336bf5', // 7
  '#2159ee', // 8
  '#0441e3'  // 9: Darkest
];

const errorColors: MantineColorsTuple = [
  '#ffe8e8', // 0: Lightest
  '#ffd4d4', // 1
  '#fdb8b8', // 2
  '#fda4a4', // 3
  '#fc8c8c', // 4
  '#fc6d6d', // 5: Base
  '#fb5a5a', // 6
  '#f94141', // 7
  '#f52c2c', // 8
  '#e61616'  // 9: Darkest
];

const warningColors: MantineColorsTuple = [
  '#fff2e8', // 0: Lightest
  '#fce1d1', // 1
  '#f9c7a8', // 2
  '#f9ad7e', // 3
  '#f8935e', // 4
  '#f7784d', // 5: Base
  '#f4663c', // 6
  '#f25431', // 7
  '#ef4226', // 8
  '#e42b18'  // 9: Darkest
];

const successColors: MantineColorsTuple = [
  '#e7fae7', // 0: Lightest
  '#d5f9d5', // 1
  '#b1f5b1', // 2
  '#96f396', // 3
  '#70ef70', // 4
  '#4ae74a', // 5: Base
  '#29e329', // 6
  '#1ad71a', // 7
  '#14be14', // 8
  '#0da00d'  // 9: Darkest
];

// Define theme
export const theme = createTheme({
  colors: {
    primary: primaryColors,
    secondary: secondaryColors,
    accent: accentColors,
    error: errorColors,
    warning: warningColors,
    success: successColors,
  },
  
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  fontSizes: {
    xs: rem(12),
    sm: rem(14),
    md: rem(16),
    lg: rem(18),
    xl: rem(20),
  },
  
  radius: {
    xs: rem(2),
    sm: rem(4),
    md: rem(8),
    lg: rem(12),
    xl: rem(16),
  },
  
  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },
  
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        p: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});
