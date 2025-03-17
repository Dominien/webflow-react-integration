import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import ROICalculator from './components/ROICalculator';

// Custom theme with brand colors
const theme = extendTheme({
  colors: {
    gold: {
      50: '#FFF9E5',
      100: '#FFF0C7',
      200: '#FFE599',
      300: '#FFDA6C',
      400: '#FFCC3D',
      500: '#F0B422', // Primary gold
      600: '#D19A00',
      700: '#A37700',
      800: '#755500',
      900: '#483300',
    },
    blue: {
      50: '#E9EEF6',
      100: '#C5D3E8',
      200: '#9DB4D9',
      300: '#7595C9',
      400: '#4D76BA',
      500: '#3A62A0',
      600: '#304F82',
      700: '#253A6F', // Secondary blue
      800: '#1A2A53',
      900: '#101A36',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
      },
    },
    Card: {
      baseStyle: {
        container: {
          overflow: 'hidden',
        },
      },
    },
  },
});

// This function will be called when the script is loaded
function initROICalculator() {
  const targetElement = document.getElementById('roi-calculator-root');
  
  if (targetElement) {
    const root = createRoot(targetElement);
    root.render(
      <React.StrictMode>
        <ChakraProvider theme={theme}>
          <ROICalculator />
        </ChakraProvider>
      </React.StrictMode>
    );
    console.log('ROI Calculator initialized successfully');
    return true;
  } else {
    console.error('Could not find element with ID "roi-calculator-root"');
    return false;
  }
}

// Automatically initialize if the element exists
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure all scripts are loaded
  setTimeout(() => {
    const targetElement = document.getElementById('roi-calculator-root');
    if (targetElement) {
      initROICalculator();
    }
  }, 100);
});

// Export the initialize function to global scope so it can be called manually if needed
window.initROICalculator = initROICalculator;