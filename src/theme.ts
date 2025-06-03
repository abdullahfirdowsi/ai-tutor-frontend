import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Configure color mode (light/dark)
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

// Custom colors
const colors = {
  brand: {
    50: '#E6F6FF',
    100: '#B3E0FF',
    200: '#80CBFF',
    300: '#4DB5FF',
    400: '#1A9FFF',
    500: '#0080E6',
    600: '#0066B3',
    700: '#004D80',
    800: '#00334D',
    900: '#001A26',
  },
  accent: {
    50: '#F2E6FF',
    100: '#D9B3FF',
    200: '#C080FF',
    300: '#A64DFF',
    400: '#8C1AFF',
    500: '#7300E6',
    600: '#5A00B3',
    700: '#400080',
    800: '#26004D',
    900: '#13001A',
  },
};

// Custom component styles
const components = {
  Button: {
    variants: {
      primary: {
        bg: 'brand.500',
        color: 'white',
        _hover: {
          bg: 'brand.600',
        },
      },
      secondary: {
        bg: 'accent.500',
        color: 'white',
        _hover: {
          bg: 'accent.600',
        },
      },
    },
  },
};

// Extend the theme
const theme = extendTheme({ 
  config, 
  colors, 
  components,
  fonts: {
    heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
});

export default theme;

