import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Configure color mode (light/dark)
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

// Enhanced color palette matching the logo design
const colors = {
  brand: {
    50: '#F0F4FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Primary purple-blue
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7', // Logo purple
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
  },
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Logo blue
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  accent: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E0',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  // Gradient colors matching the logo
  gradient: {
    primary: 'linear(135deg, #A855F7 0%, #3B82F6 100%)',
    secondary: 'linear(135deg, #6366F1 0%, #8B5CF6 100%)',
    accent: 'linear(135deg, #3B82F6 0%, #1D4ED8 100%)',
  }
};

// Enhanced typography scale
const fonts = {
  heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
};

const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
};

// Enhanced spacing scale
const space = {
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

// Enhanced component styles matching logo design
const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: '12px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      _focus: {
        boxShadow: '0 0 0 3px rgba(163, 163, 163, 0.4)',
        outline: 'none',
      },
      _disabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
      },
    },
    sizes: {
      sm: {
        h: '8',
        minW: '8',
        fontSize: 'sm',
        px: '4',
      },
      md: {
        h: '10',
        minW: '10',
        fontSize: 'md',
        px: '6',
      },
      lg: {
        h: '12',
        minW: '12',
        fontSize: 'lg',
        px: '8',
      },
    },
    variants: {
      solid: {
        bgGradient: 'linear(135deg, #A855F7 0%, #3B82F6 100%)',
        color: 'white',
        _hover: {
          bgGradient: 'linear(135deg, #9333EA 0%, #2563EB 100%)',
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.4)',
        },
        _active: {
          bgGradient: 'linear(135deg, #7C3AED 0%, #1D4ED8 100%)',
          transform: 'translateY(0)',
        },
      },
      outline: {
        border: '2px solid',
        borderColor: 'brand.500',
        color: 'brand.500',
        bg: 'transparent',
        _hover: {
          bg: 'brand.50',
          borderColor: 'brand.600',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px -2px rgba(99, 102, 241, 0.25)',
        },
        _active: {
          bg: 'brand.100',
          transform: 'translateY(0)',
        },
      },
      ghost: {
        color: 'brand.500',
        _hover: {
          bg: 'brand.50',
          color: 'brand.600',
        },
        _active: {
          bg: 'brand.100',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid',
        borderColor: 'gray.200',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        _hover: {
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          transform: 'translateY(-4px)',
        },
        _dark: {
          borderColor: 'gray.700',
          bg: 'gray.800',
        },
      },
      header: {
        p: '6',
        pb: '4',
      },
      body: {
        p: '6',
      },
      footer: {
        p: '6',
        pt: '4',
      },
    },
    variants: {
      gradient: {
        container: {
          bgGradient: 'linear(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
          borderColor: 'brand.200',
          _dark: {
            bgGradient: 'linear(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
            borderColor: 'brand.600',
          },
        },
      },
    },
  },
  Input: {
    baseStyle: {
      field: {
        borderRadius: '12px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        _focus: {
          borderColor: 'brand.500',
          boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.6)',
        },
        _hover: {
          borderColor: 'brand.300',
        },
      },
    },
    sizes: {
      md: {
        field: {
          h: '10',
          px: '4',
          fontSize: 'md',
        },
      },
      lg: {
        field: {
          h: '12',
          px: '4',
          fontSize: 'lg',
        },
      },
    },
  },
  Textarea: {
    baseStyle: {
      borderRadius: '12px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      _focus: {
        borderColor: 'brand.500',
        boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.6)',
      },
      _hover: {
        borderColor: 'brand.300',
      },
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: 'full',
      fontWeight: '600',
      fontSize: 'xs',
      px: '3',
      py: '1',
    },
    variants: {
      gradient: {
        bgGradient: 'linear(135deg, #A855F7 0%, #3B82F6 100%)',
        color: 'white',
      },
    },
  },
  Alert: {
    baseStyle: {
      container: {
        borderRadius: '16px',
        border: '1px solid',
      },
    },
    variants: {
      subtle: {
        container: {
          bg: 'brand.50',
          borderColor: 'brand.200',
          _dark: {
            bg: 'brand.900',
            borderColor: 'brand.700',
          },
        },
      },
    },
  },
  Progress: {
    baseStyle: {
      track: {
        borderRadius: 'full',
        bg: 'gray.200',
        _dark: {
          bg: 'gray.700',
        },
      },
      filledTrack: {
        borderRadius: 'full',
        bgGradient: 'linear(135deg, #A855F7 0%, #3B82F6 100%)',
        transition: 'all 0.3s ease',
      },
    },
  },
  Stat: {
    baseStyle: {
      container: {
        bg: 'white',
        p: '6',
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'gray.200',
        _dark: {
          bg: 'gray.800',
          borderColor: 'gray.700',
        },
      },
      number: {
        fontWeight: 'bold',
        bgGradient: 'linear(135deg, #A855F7 0%, #3B82F6 100%)',
        bgClip: 'text',
      },
    },
  },
  Heading: {
    baseStyle: {
      fontWeight: 'bold',
      lineHeight: 'shorter',
    },
    variants: {
      gradient: {
        bgGradient: 'linear(135deg, #A855F7 0%, #3B82F6 100%)',
        bgClip: 'text',
      },
    },
  },
};

// Global styles with logo-inspired design
const styles = {
  global: (props: any) => ({
    body: {
      fontFamily: 'body',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      lineHeight: 'tall',
    },
    '*::placeholder': {
      color: props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
    },
    '*, *::before, &::after': {
      borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
      wordWrap: 'break-word',
    },
    // Smooth scrolling
    html: {
      scrollBehavior: 'smooth',
    },
    // Focus styles for accessibility
    '*:focus': {
      outline: 'none',
    },
    // Custom scrollbar with gradient
    '::-webkit-scrollbar': {
      width: '8px',
    },
    '::-webkit-scrollbar-track': {
      bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.100',
    },
    '::-webkit-scrollbar-thumb': {
      background: 'linear-gradient(135deg, #A855F7 0%, #3B82F6 100%)',
      borderRadius: 'full',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: 'linear-gradient(135deg, #9333EA 0%, #2563EB 100%)',
    },
  }),
};

// Breakpoints for responsive design
const breakpoints = {
  base: '0em',
  sm: '30em',
  md: '48em',
  lg: '62em',
  xl: '80em',
  '2xl': '96em',
};

// Extend the theme
const theme = extendTheme({
  config,
  colors,
  fonts,
  fontSizes,
  space,
  components,
  styles,
  breakpoints,
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    // Gradient shadows
    'gradient-sm': '0 4px 6px -1px rgba(168, 85, 247, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
    'gradient-md': '0 10px 15px -3px rgba(168, 85, 247, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)',
    'gradient-lg': '0 20px 25px -5px rgba(168, 85, 247, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.2)',
  },
  radii: {
    none: '0',
    sm: '0.25rem',
    base: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.25rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
});

export default theme;