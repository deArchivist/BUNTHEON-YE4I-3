import { createTheme, MantineColorsTuple } from '@mantine/core';

// Define our custom color palette based on the mockup RGB values
const primary: MantineColorsTuple = [
  '#f5f6fe', // 50
  '#e7ebfd', // 100
  '#d4dbfb', // 200
  '#c2cbfa', // 300
  '#b0bcf8', // 400
  '#acb8f7', // 500 - Main color in mockup rgb(172, 184, 247)
  '#9aa8f5', // 600
  '#8899f3', // 700
  '#7789f1', // 800
  '#657aef', // 900
];

const secondary: MantineColorsTuple = [
  '#f9f5fd', // 50
  '#f2eafb', // 100
  '#e9d9f9', // 200
  '#e0c8f8', // 300
  '#dbc1f7', // 400 - Main color in mockup rgb(219, 193, 247)
  '#d3b5f6', // 500
  '#c9a3f4', // 600
  '#c092f3', // 700
  '#b680f1', // 800
  '#ac6def', // 900
];

const accent: MantineColorsTuple = [
  '#f1f6fe', // 50
  '#e2edfc', // 100
  '#c5dbfa', // 200
  '#a9c9f7', // 300
  '#99b7f0', // 400 - Main color in mockup rgb(153, 183, 240)
  '#8aabed', // 500
  '#7b9de9', // 600
  '#6c8fe6', // 700
  '#5d80e2', // 800
  '#4e72df', // 900
];

// Create the theme with our customized colors
export const theme = createTheme({
  // Color scheme
  colors: {
    primary,
    secondary,
    accent,
    // Error colors based on mockup rgb(253, 164, 164)
    error: ['#fff8f8', '#fee7e7', '#fdd6d6', '#fdc4c4', '#fca4a4', '#fda4a4', '#fd8b8b', '#fd7272', '#fc5959', '#fc3f3f'],
    // Warning colors based on mockup rgb(252, 147, 77)
    warning: ['#fff7f2', '#fee5d7', '#fdd3bc', '#fcc1a1', '#fb9356', '#fc934d', '#fc8a43', '#fb8139', '#fb772f', '#fa6d26'],
    // Success colors based on mockup rgb(150, 255, 150)
    success: ['#f1fef1', '#e3fde3', '#c8fcc8', '#acfbac', '#96ff96', '#7dff7d', '#64ff64', '#4bff4b', '#32ff32', '#19ff19'],
  },

  // Border radius
  radius: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem'
  },

  // Font sizes
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem'
  },

  // Shadow configurations
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },

  // Component styles
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
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
    },
    Card: {
      defaultProps: {
        padding: 'lg',
        radius: 'md',
        shadow: 'sm'
      },
      styles: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }
        }
      }
    },
    TextInput: {
      defaultProps: {
        radius: 'md'
      }
    },
    Textarea: {
      defaultProps: {
        radius: 'md'
      }
    }
  }
});
