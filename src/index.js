import React from 'react';
import { createRoot } from 'react-dom/client';
import ROICalculator from './components/ROICalculator';

// This function will be called when the script is loaded
function initROICalculator() {
  const targetElement = document.getElementById('roi-calculator-root');
  
  if (targetElement) {
    const root = createRoot(targetElement);
    root.render(
      <React.StrictMode>
        <ROICalculator />
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