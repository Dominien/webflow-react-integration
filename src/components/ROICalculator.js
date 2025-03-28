import React, { useState, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import './ROICalculator.css';

ChartJS.register(ArcElement, ChartTooltip, Legend);

// Fee constants
const STATUTORY_FEE_ET = 7.43; // Elektrotherapie
const STATUTORY_FEE_WP = 14.24; // Warmpackung
const PRIVATE_FEE_ET = 10.40; // Elektrotherapie
const PRIVATE_FEE_WP = 19.94; // Warmpackung
const SELF_PAY_PACKAGES = {
  einzelsitzung: { name: "Einzelsitzung", price: 59.9, sessions: 1 },
  tenPackage: { name: "10er Karte", price: 450, sessions: 10 },
  twentyPackage: { name: "20er Karte", price: 740, sessions: 20 },
  thirtyPackage: { name: "30er Karte", price: 990, sessions: 30 },
  fortyPackage: { name: "40er Karte", price: 1120, sessions: 40 },
};

// Average reLounge system cost for ROI calculation
const AVERAGE_SYSTEM_COST = 15000;

// Icon components
const CalculatorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="4" y1="8" x2="20" y2="8" />
    <line x1="8" y1="12" x2="8" y2="12" />
    <line x1="12" y1="12" x2="12" y2="12" />
    <line x1="16" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="12" y1="16" x2="12" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const EuroIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10h12"></path>
    <path d="M4 14h9"></path>
    <path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"></path>
    <path d="M18 17V9"></path>
    <path d="M13 17V5"></path>
    <path d="M8 17v-3"></path>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const EuroCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M16 8h-6a2 2 0 100 4h4a2 2 0 110 4H8"></path>
    <path d="M12 6v2"></path>
    <path d="M12 16v2"></path>
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

// Custom number input component
const NumberInput = ({ value, onChange, min = 0, label, hint, id }) => {
  const increment = () => {
    onChange(value + 1);
  };

  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min) {
      onChange(newValue);
    } else if (e.target.value === '') {
      onChange(min);
    }
  };

  return (
    <div className="input-group">
      <label htmlFor={id}>{label}</label>
      <div className="input-number">
        <input
          id={id}
          type="number"
          min={min}
          value={value}
          onChange={handleChange}
        />
        <div className="input-number-buttons">
          <button className="number-increment" onClick={increment} type="button">+</button>
          <button className="number-decrement" onClick={decrement} type="button">−</button>
        </div>
      </div>
      {hint && <p className="input-hint">{hint}</p>}
    </div>
  );
};

// Custom switch component
const ToggleSwitch = ({ isChecked, onChange, label, icon }) => {
  const handleToggleClick = () => {
    onChange(!isChecked);
  };
  
  return (
    <div className="toggle-section" onClick={handleToggleClick}>
      <label className="toggle-label" htmlFor="advanced-toggle">
        <span className="toggle-icon">{icon}</span>
        {label}
      </label>
      <div className="toggle-switch">
        <input
          id="advanced-toggle"
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-switch-slider"></span>
      </div>
    </div>
  );
};

// Therapy type selector component
const TherapyTypeSelector = ({ selected, onChange }) => {
  return (
    <div className="input-group">
      <label>Abrechnungsziffer auswählen</label>
      <div className="radio-group therapy-type-group">
        <div 
          className={`radio-item ${selected === "ET" ? 'selected' : ''}`}
          onClick={() => onChange("ET")}
        >
          <input
            type="radio"
            id="therapy-et"
            name="therapy-type"
            value="ET"
            checked={selected === "ET"}
            onChange={() => onChange("ET")}
          />
          <label htmlFor="therapy-et">
            <span className="package-name">Elektrotherapie (ET)</span>
          </label>
        </div>
        <div 
          className={`radio-item ${selected === "WP" ? 'selected' : ''}`}
          onClick={() => onChange("WP")}
        >
          <input
            type="radio"
            id="therapy-wp"
            name="therapy-type"
            value="WP"
            checked={selected === "WP"}
            onChange={() => onChange("WP")}
          />
          <label htmlFor="therapy-wp">
            <span className="package-name">Warmpackung (WP)</span>
          </label>
        </div>
      </div>
      <p className="input-hint">Hinweis: In der Abrechnung ist immer nur eine Ziffer möglich.</p>
    </div>
  );
};

function ROICalculator() {
  // Patient counts
  const [statutoryPatients, setStatutoryPatients] = useState(20);
  const [privatePatients, setPrivatePatients] = useState(5);
  const [selfPayPatients, setSelfPayPatients] = useState(10);

  // Sessions per patient
  const [statutorySessions, setStatutorySessions] = useState(6);
  const [privateSessions, setPrivateSessions] = useState(6);
  
  // Therapy type selection
  const [therapyType, setTherapyType] = useState("ET"); // ET for Elektrotherapie, WP for Warmpackung

  // Self-pay package selection
  const [selectedPackage, setSelectedPackage] = useState("twentyPackage");

  // Advanced options
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [systemCost, setSystemCost] = useState(AVERAGE_SYSTEM_COST);
  const [monthlyExpenses, setMonthlyExpenses] = useState(500);

  // Results
  const [statutoryRevenue, setStatutoryRevenue] = useState(0);
  const [privateRevenue, setPrivateRevenue] = useState(0);
  const [selfPayRevenue, setSelfPayRevenue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [breakEvenMonths, setBreakEvenMonths] = useState(0);

  // PDF Generation
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const chartRef = useRef(null);
  const resultsRef = useRef(null);
  
  // Show results section
  const [showResults, setShowResults] = useState(false);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
  };

  // Calculate revenues
  const calculateResults = () => {
    // Get the correct fees based on therapy type
    const statutoryFee = therapyType === "ET" ? STATUTORY_FEE_ET : STATUTORY_FEE_WP;
    const privateFee = therapyType === "ET" ? PRIVATE_FEE_ET : PRIVATE_FEE_WP;
    
    // Calculate revenue for statutory patients (monthly)
    const statRevenue = statutoryPatients * statutorySessions * statutoryFee;
    setStatutoryRevenue(statRevenue);

    // Calculate revenue for private patients (monthly)
    const privRevenue = privatePatients * privateSessions * privateFee;
    setPrivateRevenue(privRevenue);

    // Calculate revenue for self-pay patients (monthly)
    const selectedPkg = SELF_PAY_PACKAGES[selectedPackage];
    const selfRevenue = selfPayPatients * selectedPkg.price;
    setSelfPayRevenue(selfRevenue);

    // Calculate total revenue
    const total = statRevenue + privRevenue + selfRevenue;
    setTotalRevenue(total);

    // Calculate break-even period (in months)
    const monthlyRevenue = total - monthlyExpenses;
    const breakEven = monthlyRevenue > 0 ? Math.ceil(systemCost / monthlyRevenue) : 0;
    setBreakEvenMonths(breakEven);

    // Show results
    setShowResults(true);

    // Improved scrolling - wait for state update to complete and DOM to render
    setTimeout(() => {
      const resultsSection = document.getElementById("results-section");
      if (resultsSection) {
        // Scroll to position
        resultsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 300);
  };

  // Chart data for revenue breakdown with improved colors for better contrast
  const revenueChartData = {
    labels: ["Gesetzlich", "Privat", "Selbstzahler"],
    datasets: [
      {
        label: "Umsatz (€)",
        data: [statutoryRevenue, privateRevenue, selfPayRevenue],
        backgroundColor: [
          "rgba(37, 58, 111, 0.85)",  // Dark blue for statutory
          "rgba(82, 130, 255, 0.85)",  // Light blue for private
          "rgba(240, 180, 34, 0.85)"   // Gold for self-pay
        ],
        borderColor: [
          "rgba(37, 58, 111, 1)",      // Dark blue border
          "rgba(82, 130, 255, 1)",     // Light blue border
          "rgba(240, 180, 34, 1)"      // Gold border
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options with better display settings
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '40%', // Less cutout for better visibility (more donut, less pie)
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 13,
            weight: 'bold',
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 10,
          color: '#333333' // Darker text for better contrast
        }
      },
      title: {
        display: true,
        text: "Umsatzverteilung",
        font: {
          size: 16,
          weight: 600,
          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        color: '#253a6f',
        padding: {
          bottom: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            label += formatCurrency(context.raw);
            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((context.raw / total) * 100);
            label += ` (${percentage}%)`;
            return label;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000
    }
  };

  // Get progress color and message based on breakeven months
  const getBreakevenInfo = (months) => {
    if (months <= 8) {
      return { 
        color: "green",
        icon: "success",
        message: `Ihre geschätzte Amortisationszeit ist hervorragend! Mit ${months} Monaten werden Sie schneller als der typische Zeitraum von 8-14 Monaten einen Return on Investment sehen.`
      };
    } else if (months <= 14) {
      return { 
        color: "orange",
        icon: "warning",
        message: `Ihre geschätzte Amortisationszeit von ${months} Monaten liegt im typischen Bereich von 8-14 Monaten für reLounge-Systeme.`
      };
    } else {
      return { 
        color: "red",
        icon: "danger",
        message: `Ihre geschätzte Amortisationszeit von ${months} Monaten ist länger als der typische Bereich von 8-14 Monaten. Erwägen Sie eine Anpassung Ihres Patientenmix oder der Paketangebote, um den ROI zu verbessern.`
      };
    }
  };

  // Generate and download PDF report
  const generatePDF = async () => {
    if (!showResults) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Create PDF document (A4 size)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add a styled header with logo-like design
      // Blue background header
      pdf.setFillColor(37, 58, 111);
      pdf.rect(0, 0, 210, 35, 'F');
      
      // Golden stripe
      pdf.setFillColor(240, 180, 34);
      pdf.rect(0, 35, 210, 4, 'F');
      
      // Add the reLounge logo SVG
      // We'll use data URL approach since jsPDF doesn't support direct SVG rendering
      // First, convert the SVG to a white version for better visibility on blue background
      const reLoungeLogoSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="131" height="46" viewBox="0 0 131 46" fill="white" preserveAspectRatio="xMidYMid meet" aria-hidden="true" role="img">
  <g clip-path="url(#clip0_10857_95)">
    <mask id="mask0_10857_95" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="131" height="46">
      <path d="M131 0H0V46H131V0Z" fill="white"/>
    </mask>
    <g mask="url(#mask0_10857_95)">
      <path d="M34.3075 31.7284V13.6304H32.0818C31.4476 13.6304 30.9039 13.8688 30.4622 14.3343C30.0148 14.8055 29.7939 15.3562 29.7939 15.992V35.7987H45.1127V31.7227H34.3131L34.3075 31.7284Z" fill="white"/>
      <path d="M54.7059 18.2798C49.4958 18.2798 46.8908 21.2772 46.8965 27.2663C46.8965 33.2101 49.5015 36.1848 54.7116 36.1848C59.9217 36.1848 62.5268 33.2101 62.5268 27.2663C62.5268 21.3226 59.9217 18.2798 54.7059 18.2798ZM54.6436 32.2961C52.4407 32.2961 51.3194 30.6214 51.2741 27.2663C51.2741 23.8261 52.418 22.106 54.7059 22.106C56.9939 22.106 58.0076 23.7807 58.0076 27.1358C57.9679 30.5816 56.841 32.2961 54.638 32.2961" fill="white"/>
      <path d="M95.696 25.6654C95.7357 21.0331 93.5837 18.5807 89.24 18.3025C88.9625 18.2855 88.6794 18.2798 88.3906 18.2798C87.5807 18.2798 86.8388 18.3479 86.1649 18.4785C82.7331 19.154 81.0171 21.5554 81.0171 25.6711V46.0058H85.4061V24.7742C85.4457 22.9916 86.4198 22.0947 88.3226 22.0947C90.2254 22.0947 91.2278 22.9859 91.3127 24.7685V33.6245C91.3127 34.9813 92.032 35.7079 93.4761 35.7931H95.7017V25.6598L95.696 25.6654Z" fill="white"/>
      <path d="M105.425 18.467C100.085 18.5522 97.4175 21.4644 97.4175 27.1981C97.4175 32.9318 99.7054 36.1166 104.281 36.1166C106.445 36.1166 108.076 35.265 109.174 33.5676V35.3558C109.174 38.0297 108.03 39.3694 105.742 39.3694C103.958 39.3694 102.928 38.7563 102.628 37.5244H97.8592C98.8786 41.1747 101.336 42.997 105.233 42.997C110.737 42.9118 113.495 40.7035 113.489 36.372V26.182C113.489 20.9989 110.799 18.4273 105.42 18.4727M109.169 27.3287C109.044 30.6383 107.815 32.296 105.482 32.296C103.154 32.296 101.948 30.644 101.863 27.3287C101.863 23.8488 103.086 22.1059 105.544 22.1059C108.002 22.1059 109.208 23.8488 109.169 27.3287Z" fill="white"/>
      <path d="M123.281 18.274C118.026 18.3137 115.398 21.2714 115.398 27.1243C115.398 32.9772 118.009 36.003 123.213 36.1733C125.122 36.1733 126.775 35.7078 128.174 34.7711C129.363 33.8798 130.207 32.4549 130.717 30.5021H127.54C126.945 30.5021 126.458 30.7121 126.079 31.1379C125.235 31.944 124.3 32.347 123.287 32.347C121.169 32.347 120.025 31.03 119.855 28.4016H130.977C131.311 21.6461 128.752 18.2683 123.287 18.2683M119.917 25.2736C120.257 22.9801 121.356 21.8334 123.219 21.8334C125.088 21.8334 126.141 22.9801 126.396 25.2736H119.912H119.917Z" fill="white"/>
      <path d="M79.1142 18.4841V28.9183C79.1142 31.893 78.3553 33.8458 76.832 34.7769C75.3029 35.6681 73.6096 36.1166 71.7464 36.1166C69.8833 36.1166 68.3372 35.6284 66.8535 34.652C65.3697 33.7153 64.6279 31.8022 64.6279 28.9183V18.5352H68.9489V29.8096C68.9489 31.717 69.9229 32.6764 71.871 32.6707C73.8192 32.6707 74.7989 31.717 74.7932 29.8096V18.4841H79.1142Z" fill="white"/>
      <path d="M8.83451 18.5408C3.06943 18.5408 0.124589 21.3281 0 26.8858V35.8043H4.38894V26.8234C4.38894 24.3142 5.59519 23.0653 8.0077 23.0653H9.46879V18.5408H8.83451Z" fill="white"/>
      <path d="M19.2547 18.2852C13.9993 18.3306 11.3716 21.2826 11.3716 27.1412C11.3716 32.9998 13.9766 36.0199 19.1924 36.1845C21.1009 36.1845 22.7489 35.719 24.1476 34.7823C25.3312 33.891 26.1807 32.4718 26.6904 30.5133H23.5077C22.9187 30.5133 22.4317 30.729 22.0523 31.1548C21.2028 31.9609 20.2741 32.364 19.2547 32.364C17.1367 32.364 15.9927 31.0469 15.8228 28.4128H26.9396C27.2794 21.663 24.714 18.2795 19.249 18.2795M15.8795 25.2905C16.2192 22.9971 17.3179 21.8503 19.1811 21.8503C21.0442 21.8503 22.1089 22.9971 22.3581 25.2905H15.8738H15.8795Z" fill="white"/>
      <path d="M72.5447 9.43499L72.5561 5.43277C72.5561 4.6891 71.5991 4.07599 70.4212 4.07031H70.0416C68.8637 4.07031 67.901 4.67207 67.901 5.42142L67.8896 9.42364C67.8896 10.1673 68.8468 10.7804 70.0247 10.7861H70.4041C71.582 10.7861 72.5447 10.1843 72.5447 9.43499Z" fill="white"/>
      <path d="M65.6585 8.73674L65.6698 3.70133C65.6698 2.95765 64.7127 2.34454 63.5348 2.33887H63.1554C61.9774 2.33887 61.0147 2.94062 61.0147 3.68997L61.0034 8.72539C61.0034 9.46907 61.9604 10.0822 63.1384 10.0878H63.5178C64.6958 10.0878 65.6585 9.4861 65.6585 8.73674Z" fill="white"/>
      <path d="M58.6873 7.07347L58.6986 2.66251C58.6986 1.91883 57.7416 1.30573 56.5636 1.30005H56.1842C55.0063 1.30005 54.0435 1.9018 54.0435 2.65115L54.0322 7.06211C54.0322 7.80579 54.9893 8.41889 56.1672 8.42457H56.5466C57.7246 8.42457 58.6873 7.82282 58.6873 7.07347Z" fill="white"/>
      <path d="M51.6253 5.25682V1.87906C51.6366 1.13538 50.6739 0.522278 49.5016 0.516602H49.1222C47.9442 0.516602 46.9815 1.11835 46.9815 1.86771V5.24547C46.9702 5.98914 47.9329 6.60225 49.1052 6.60793H49.4846C50.6625 6.60793 51.6253 6.00617 51.6253 5.25682Z" fill="white"/>
      <path d="M44.8296 3.51968V1.36246C44.8353 0.618783 43.8782 0.00567691 42.7003 0H42.3209C41.1429 0 40.1802 0.601752 40.1802 1.3511V3.50833C40.1745 4.25201 41.1316 4.86511 42.3095 4.87079H42.689C43.8669 4.87079 44.8296 4.26904 44.8296 3.51968Z" fill="white"/>
      <path d="M37.943 2.57731V1.38516C37.943 0.641488 36.9859 0.028382 35.8136 0.0227051H35.4342C34.2563 0.0227051 33.2935 0.624458 33.2935 1.37381V2.56596C33.2935 3.30964 34.2506 3.92274 35.4229 3.92842H35.8023C36.9803 3.92842 37.943 3.32667 37.943 2.57731Z" fill="white"/>
      <path d="M31.1419 2.30473V1.64053C31.1419 0.896859 30.1848 0.283753 29.0069 0.278076H28.6274C27.4495 0.278076 26.4868 0.879829 26.4868 1.62918V2.29338C26.4868 3.03705 27.4438 3.65016 28.6218 3.65584H29.0012C30.1791 3.65584 31.1419 3.05409 31.1419 2.30473Z" fill="white"/>
      <path d="M74.9176 6.78397V9.79273C74.9063 10.5364 75.869 11.1495 77.0413 11.1552H77.4207C78.5987 11.1552 79.5614 10.5534 79.5614 9.80408V6.79532C79.5727 6.05164 78.61 5.43854 77.4377 5.43286H77.0583C75.8804 5.43286 74.9176 6.03461 74.9176 6.78397Z" fill="white"/>
      <path d="M81.7134 7.28348V9.54289C81.7077 10.2866 82.6648 10.8997 83.8427 10.9053H84.2222C85.4001 10.9053 86.3628 10.3036 86.3628 9.55424V7.29483C86.3685 6.55116 85.4114 5.93805 84.2335 5.93237H83.8541C82.6761 5.93237 81.7134 6.53413 81.7134 7.28348Z" fill="white"/>
      <path d="M88.5942 6.84647V8.29975C88.5942 9.04343 89.5512 9.65654 90.7235 9.66221H91.1029C92.2809 9.66221 93.2436 9.06046 93.2436 8.31111V6.85782C93.2436 6.11414 92.2865 5.50104 91.1143 5.49536H90.7348C89.5569 5.49536 88.5942 6.09711 88.5942 6.84647Z" fill="white"/>
      <path d="M95.3447 6.04593V6.65336C95.3447 7.39703 96.3018 8.01014 97.4797 8.01582H97.8591C99.0371 8.01582 99.9998 7.41406 99.9998 6.66471V6.05728C99.9998 5.31361 99.0427 4.7005 97.8648 4.69482H97.4854C96.3074 4.69482 95.3447 5.29658 95.3447 6.04593Z" fill="white"/>
      <path d="M102.084 4.27469V4.6153C102.084 5.35898 103.041 5.97208 104.219 5.97776H104.598C105.776 5.97776 106.739 5.37601 106.739 4.62666V4.28604C106.739 3.54237 105.782 2.92926 104.604 2.92358H104.225C103.047 2.92358 102.084 3.52534 102.084 4.27469Z" fill="white"/>
      <path d="M24.4139 2.53759V2.32755C24.4139 1.58387 23.4569 0.970765 22.2789 0.965088H21.8995C20.7216 0.965088 19.7588 1.56684 19.7588 2.31619V2.52624C19.7588 3.26991 20.7159 3.88302 21.8938 3.8887H22.2733C23.4512 3.8887 24.4139 3.28694 24.4139 2.53759Z" fill="white"/>
    </g>
  </g>
  <defs>
    <clipPath id="clip0_10857_95">
      <rect width="131" height="46" fill="white"/>
    </clipPath>
  </defs>
</svg>`;

      // Convert SVG to base64-encoded image for PDF insertion
      const svgBase64 = btoa(reLoungeLogoSVG);
      const logoWidth = 65; // Control size of logo in PDF
      const logoHeight = 23; 
      
      // Add logo to PDF - positioned in top right area
      pdf.addImage(`data:image/svg+xml;base64,${svgBase64}`, 'SVG', 130, 6, logoWidth, logoHeight);
      
      // Title text
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text("ROI Kalkulation", 20, 20);
      
      pdf.setFontSize(12);
      pdf.text("Detaillierter Bericht für Ihre Praxis", 20, 28);
      
      // Date in the top right
      pdf.setFontSize(10);
      pdf.setTextColor(220, 220, 220);
      const dateString = "Erstellt: " + new Date().toLocaleDateString("de-DE") + " " + 
                        new Date().toLocaleTimeString("de-DE", {hour: '2-digit', minute:'2-digit'});
      pdf.text(dateString, 190, 20, { align: "right" });
      
      // Executive Summary Section
      const summaryY = 50;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(37, 58, 111);
      pdf.text("Zusammenfassung", 20, summaryY);
      
      // Horizontal line
      pdf.setDrawColor(240, 180, 34);
      pdf.setLineWidth(0.5);
      pdf.line(20, summaryY + 2, 80, summaryY + 2);
      
      // Summary text
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      
      const therapyTypeName = therapyType === "ET" ? "Elektrotherapie" : "Warmpackung";
      const summaryText = [
        `Dieser Bericht analysiert die potenzielle Rentabilität eines reLounge Therapiesystems`,
        `basierend auf ${statutoryPatients + privatePatients + selfPayPatients} Patienten, ${therapyTypeName} als Abrechnungsziffer`,
        `und einem geschätzten monatlichen Umsatz von ${formatCurrency(totalRevenue)}.`,
        "",
        `Die wichtigsten Kennzahlen im Überblick:`,
      ];
      
      pdf.text(summaryText, 20, summaryY + 10);
      
      // Key metrics in a nice box
      pdf.setFillColor(248, 248, 252);
      pdf.roundedRect(20, summaryY + 30, 170, 30, 3, 3, 'F');
      
      // Metric titles
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Gesamtumsatz:", 30, summaryY + 40);
      pdf.text("Patienten (gesamt):", 80, summaryY + 40);
      pdf.text("Amortisationszeit:", 140, summaryY + 40);
      
      // Metric values
      pdf.setFontSize(14);
      pdf.setTextColor(37, 58, 111);
      pdf.text(formatCurrency(totalRevenue), 30, summaryY + 52);
      pdf.text(`${statutoryPatients + privatePatients + selfPayPatients}`, 80, summaryY + 52);
      
      // Use color coding for the payback period
      const breakEvenInfo = getBreakevenInfo(breakEvenMonths);
      if (breakEvenInfo.color === "green") {
        pdf.setTextColor(0, 140, 0);
      } else if (breakEvenInfo.color === "orange") {
        pdf.setTextColor(200, 120, 0);
      } else {
        pdf.setTextColor(180, 0, 0);
      }
      pdf.text(`${breakEvenMonths} Monate`, 140, summaryY + 52);
      
      // Patient Information Section
      const patientSectionY = summaryY + 70;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(37, 58, 111);
      pdf.text("1. Patientenübersicht", 20, patientSectionY);
      
      // Description text
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.text("Aufschlüsselung der Einnahmen nach Patientengruppen und Leistungen", 20, patientSectionY + 8);
      
      // Patient table with styled header
      autoTable(pdf, {
        startY: patientSectionY + 12,
        head: [['Patientengruppe', 'Anzahl', 'Sitzungen/Patient', 'Gebühr/Sitzung', 'Gesamtumsatz']],
        body: [
          ['Gesetzlich versicherte', 
           statutoryPatients.toString(), 
           statutorySessions.toString(), 
           formatCurrency(therapyType === "ET" ? STATUTORY_FEE_ET : STATUTORY_FEE_WP), 
           formatCurrency(statutoryRevenue)
          ],
          ['Privatpatienten', 
           privatePatients.toString(), 
           privateSessions.toString(), 
           formatCurrency(therapyType === "ET" ? PRIVATE_FEE_ET : PRIVATE_FEE_WP), 
           formatCurrency(privateRevenue)
          ],
          ['Selbstzahler', 
           selfPayPatients.toString(), 
           SELF_PAY_PACKAGES[selectedPackage].sessions.toString(), 
           formatCurrency(SELF_PAY_PACKAGES[selectedPackage].price / SELF_PAY_PACKAGES[selectedPackage].sessions), 
           formatCurrency(selfPayRevenue)
          ],
        ],
        theme: 'grid',
        styles: { 
          fontSize: 10, 
          cellPadding: 6,
          lineColor: [200, 200, 200]
        },
        headStyles: { 
          fillColor: [37, 58, 111], 
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: { 
          0: { fontStyle: 'bold' }, 
          4: { halign: 'right', fontStyle: 'bold' } 
        },
        foot: [['Gesamt', '', '', '', formatCurrency(totalRevenue)]],
        footStyles: { 
          fillColor: [240, 180, 34, 0.15], 
          textColor: [60, 60, 60], 
          fontStyle: 'bold',
          fontSize: 11
        }
      });
      
      // Get the Y position after the table
      let packageY = 50;
      try {
        if (pdf.lastAutoTable && pdf.lastAutoTable.finalY) {
          packageY = pdf.lastAutoTable.finalY + 10;
        } else if (pdf.previousAutoTable && pdf.previousAutoTable.finalY) {
          packageY = pdf.previousAutoTable.finalY + 10;
        } else {
          packageY = patientSectionY + 70; // Default if no table info available
        }
      } catch (e) {
        packageY = patientSectionY + 70; // Fallback
      }
      
      // Skip visualization section completely
      const chartSectionY = packageY;
      
      // ROI Analysis Section (only if advanced options were shown)
      if (showAdvancedOptions) {
        // Always add a new page for ROI analysis to ensure everything fits
        pdf.addPage();
        
        // Start at the top of the new page (with space for mini-header)
        let roiY = 30;
        
        // ROI Analysis title
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(37, 58, 111);
        pdf.text("Return on Investment Analyse", 20, roiY);
        
        // Draw gold line under the title
        pdf.setDrawColor(240, 180, 34);
        pdf.setLineWidth(0.5);
        pdf.line(20, roiY + 2, 120, roiY + 2);
        
        // Brief explanation
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text("Finanzielle Kennzahlen für Ihre reLounge Investition", 20, roiY + 12);
        
        // Combined table showing ROI and metrics in one table - with more space
        autoTable(pdf, {
          startY: roiY + 20,
          head: [['Finanzparameter', 'Wert']],
          body: [
            ['Systemkosten (einmalig)', formatCurrency(systemCost)],
            ['Monatliche Betriebskosten (inkl. reLounge Leasing)', formatCurrency(monthlyExpenses)],
            ['Monatlicher Umsatz (brutto)', formatCurrency(totalRevenue)],
            ['Monatlicher Nettoertrag', formatCurrency(totalRevenue - monthlyExpenses)],
            ['Geschätzte Amortisationszeit', `${breakEvenMonths} Monate`],
            ['Jährlicher ROI nach Amortisation', 
             `${Math.round(((totalRevenue - monthlyExpenses) * 12 / systemCost) * 100)}%`]
          ],
          theme: 'grid',
          styles: { 
            fontSize: 10, 
            cellPadding: 5,
            lineColor: [200, 200, 200]
          },
          headStyles: { 
            fillColor: [37, 58, 111], 
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          columnStyles: { 
            0: { fontStyle: 'bold' },
            1: { halign: 'right' }
          },
          alternateRowStyles: {
            fillColor: [248, 248, 252]
          }
        });
        
        // ROI Analysis message - position below table with plenty of space
        let messageY;
        try {
          if (pdf.lastAutoTable && pdf.lastAutoTable.finalY) {
            messageY = pdf.lastAutoTable.finalY + 20;
          } else {
            messageY = roiY + 120; // Default fallback position
          }
        } catch (e) {
          messageY = roiY + 120; // Error fallback
        }
        
        // Get breakeven info for assessment
        const breakEvenInfo = getBreakevenInfo(breakEvenMonths);
        const boxBorderColor = breakEvenInfo.color === "green" ? [0, 140, 0] : 
                              breakEvenInfo.color === "orange" ? [240, 140, 0] : [180, 0, 0];
        
        // Create an assessment box with more space
        pdf.setFillColor(248, 248, 252);
        pdf.roundedRect(20, messageY, 170, 35, 2, 2, 'F');
        
        // Add colored indicator
        pdf.setFillColor(...boxBorderColor);
        pdf.circle(30, messageY + 15, 4, 'F');
        
        // Add heading with assessment status
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(60, 60, 60);
        
        let assessmentTitle = "ROI Bewertung: ";
        if (breakEvenInfo.color === "green") {
          assessmentTitle += "Ausgezeichnet";
        } else if (breakEvenInfo.color === "orange") {
          assessmentTitle += "Durchschnittlich";
        } else {
          assessmentTitle += "Verbesserungswürdig";
        }
        
        pdf.text(assessmentTitle, 40, messageY + 15);
        
        // Add message with word wrapping - with more space and larger font
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        // Ensure text always wraps properly with plenty of space
        const splitMessage = pdf.splitTextToSize(breakEvenInfo.message, 145);
        pdf.text(splitMessage, 40, messageY + 25);
      }
      
      // Skip the future projections page to keep everything on one page
      
      // Add headers and footers to all pages
      const pageCount = pdf.getNumberOfPages();
      
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        
        // Skip header on first page as it already has one
        if (i > 1) {
          // Add a mini header to each page after the first
          pdf.setFillColor(37, 58, 111);
          pdf.rect(0, 0, 210, 15, 'F');
          pdf.setFillColor(240, 180, 34);
          pdf.rect(0, 15, 210, 2, 'F');
          
          // Add smaller logo to subsequent pages
          pdf.addImage(`data:image/svg+xml;base64,${svgBase64}`, 'SVG', 155, 3, 40, 10);
          
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          pdf.setTextColor(255, 255, 255);
          pdf.text("reLounge ROI Kalkulation", 20, 10);
        }
        
        // Footer line
        pdf.setDrawColor(240, 180, 34);
        pdf.setLineWidth(0.5);
        pdf.line(20, 280, 190, 280);
        
        // Footer text
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text("© ATHLETIQO GmbH", 20, 286);
        pdf.text(`Seite ${i} von ${pageCount}`, 190, 286, { align: "right" });
        pdf.setFont("helvetica", "normal");
        pdf.text("Erstellt mit dem reLounge ROI Kalkulator", 105, 286, { align: "center" });
      }
      
      // Save the PDF with formatted date in filename
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      pdf.save(`reLounge_ROI_Kalkulation_${dateStr}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Bei der Erstellung des PDF-Berichts ist ein Fehler aufgetreten.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="roi-calculator">
      <div className="calculator-card">
        <div className="card-header">
          <h2 className="card-title">
            <UsersIcon />
            Patienteninformationen
          </h2>
          <p className="card-description">
            Geben Sie die Patientendaten Ihrer Praxis ein, um den potenziellen monatlichen Umsatz zu berechnen
          </p>
        </div>
        <div className="card-content">
          {/* Therapy Type Selection */}
          <div className="input-section">
            <h3 className="section-title">
              <SettingsIcon />
              Abrechnungsziffer
            </h3>
            <TherapyTypeSelector 
              selected={therapyType} 
              onChange={setTherapyType}
            />
          </div>
          {/* Statutory Health Insurance Patients */}
          <div className="input-section">
            <h3 className="section-title">
              <UserIcon />
              Gesetzlich versicherte Patienten
            </h3>
            <div className="input-grid">
              <NumberInput
                id="statutory-patients"
                label="Anzahl der Patienten"
                value={statutoryPatients}
                onChange={setStatutoryPatients}
                hint={`Gebühr pro Sitzung: ${formatCurrency(therapyType === "ET" ? STATUTORY_FEE_ET : STATUTORY_FEE_WP)}`}
              />

              <NumberInput
                id="statutory-sessions"
                label="Durchschnittliche Sitzungen pro Patient"
                value={statutorySessions}
                onChange={setStatutorySessions}
                min={1}
              />
            </div>
          </div>

          {/* Private Patients */}
          <div className="input-section">
            <h3 className="section-title">
              <UserIcon />
              Privatpatienten
            </h3>
            <div className="input-grid">
              <NumberInput
                id="private-patients"
                label="Anzahl der Patienten"
                value={privatePatients}
                onChange={setPrivatePatients}
                hint={`Gebühr pro Sitzung: ${formatCurrency(therapyType === "ET" ? PRIVATE_FEE_ET : PRIVATE_FEE_WP)}`}
              />

              <NumberInput
                id="private-sessions"
                label="Durchschnittliche Sitzungen pro Patient"
                value={privateSessions}
                onChange={setPrivateSessions}
                min={1}
              />
            </div>
          </div>

          {/* Self-Pay Patients */}
          <div className="input-section">
            <h3 className="section-title">
              <EuroIcon />
              Selbstzahler
            </h3>
            <div className="input-grid">
              <NumberInput
                id="self-pay-patients"
                label="Anzahl der Patienten"
                value={selfPayPatients}
                onChange={setSelfPayPatients}
              />

              <div className="input-group">
                <label>Paketauswahl</label>
                <div className="radio-group">
                  {Object.entries(SELF_PAY_PACKAGES).map(([key, pkg]) => (
                    <div 
                      key={key} 
                      className={`radio-item ${selectedPackage === key ? 'selected' : ''}`}
                      onClick={() => setSelectedPackage(key)}
                    >
                      <input
                        type="radio"
                        id={key}
                        name="package"
                        value={key}
                        checked={selectedPackage === key}
                        onChange={() => setSelectedPackage(key)}
                      />
                      <label htmlFor={key}>
                        <span className="package-name">{pkg.name}</span>
                        <span className="package-price">{formatCurrency(pkg.price)}</span>
                        <span className="price-per-session">
                          {formatCurrency(pkg.price / pkg.sessions)} pro Sitzung
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="advanced-options">
            <ToggleSwitch
              isChecked={showAdvancedOptions}
              onChange={setShowAdvancedOptions}
              label="Erweiterte Optionen anzeigen"
              icon={<SettingsIcon />}
            />

            {showAdvancedOptions && (
              <div className="advanced-inputs">
                <NumberInput
                  id="system-cost"
                  label="reLounge Systemkosten (€)"
                  value={systemCost}
                  onChange={setSystemCost}
                />

                <NumberInput
                  id="monthly-expenses"
                  label="Monatliche Betriebskosten (€)"
                  value={monthlyExpenses}
                  onChange={setMonthlyExpenses}
                  hint="Inklusive Strom, Wartung, reLounge Leasing, etc."
                />
              </div>
            )}
          </div>

          {/* Calculate Button */}
          <div className="button-container">
            <button onClick={calculateResults} className="calculate-button">
              <CalculatorIcon />
              Ergebnisse berechnen
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {showResults && (
        <div id="results-section" className="results-container" ref={resultsRef}>
          <div className="results-indicator">
            <ChevronDownIcon />
            <span>Ihre Ergebnisse</span>
          </div>

          <div className="results-grid">
            <div className="results-card">
              <div className="card-header">
                <h2 className="card-title">
                  <EuroCircleIcon />
                  Monatliche Umsatzübersicht
                </h2>
                <p className="card-description">Geschätzter monatlicher Umsatz basierend auf Ihren Eingaben</p>
              </div>
              <div className="card-content">
                <div className="revenue-summary">
                  <div className="revenue-item">
                    <span>Ausgewählte Abrechnungsziffer:</span>
                    <span className="revenue-value">{therapyType === "ET" ? "Elektrotherapie (ET)" : "Warmpackung (WP)"}</span>
                  </div>
                  <div className="revenue-item">
                    <span>Umsatz gesetzlich Versicherte:</span>
                    <span className="revenue-value">{formatCurrency(statutoryRevenue)}</span>
                  </div>
                  <div className="revenue-item">
                    <span>Umsatz Privatpatienten:</span>
                    <span className="revenue-value">{formatCurrency(privateRevenue)}</span>
                  </div>
                  <div className="revenue-item">
                    <span>Umsatz Selbstzahler:</span>
                    <span className="revenue-value">{formatCurrency(selfPayRevenue)}</span>
                  </div>
                  <div className="total-revenue">
                    <span>Gesamtumsatz:</span>
                    <span className="total-value">{formatCurrency(totalRevenue)}</span>
                  </div>
                </div>

                {showAdvancedOptions && (
                  <div className="roi-summary">
                    <h3>Return on Investment</h3>
                    <div className="roi-item">
                      <span>Systemkosten:</span>
                      <span>{formatCurrency(systemCost)}</span>
                    </div>
                    <div className="roi-item">
                      <span>Monatliche Betriebskosten (inkl. reLounge Leasing):</span>
                      <span>{formatCurrency(monthlyExpenses)}</span>
                    </div>
                    <div className="roi-item">
                      <span>Monatlicher Nettoertrag:</span>
                      <span className="revenue-value">{formatCurrency(totalRevenue - monthlyExpenses)}</span>
                    </div>
                    <div className="roi-item">
                      <span>Geschätzte Amortisationszeit:</span>
                      <span className="revenue-value">
                        {breakEvenMonths > 0 ? `${breakEvenMonths} Monate` : "N/A"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="results-card">
              <div className="card-header">
                <h2 className="card-title">
                  <ChartIcon />
                  Umsatzvisualisierung
                </h2>
                <p className="card-description">Grafische Darstellung Ihrer Umsatzströme</p>
              </div>
              <div className="card-content">
                <div className="chart-container">
                  {totalRevenue > 0 ? (
                    <Pie ref={chartRef} data={revenueChartData} options={chartOptions} />
                  ) : (
                    <div className="empty-chart">
                      Geben Sie Patientendaten ein, um die Umsatzvisualisierung zu sehen
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {showAdvancedOptions && breakEvenMonths > 0 && (
            <div className="results-card">
              <div className="card-header">
                <h2 className="card-title">
                  <ClockIcon />
                  Amortisationsanalyse
                </h2>
                <p className="card-description">Visualisierung Ihres Return on Investment im Zeitverlauf</p>
              </div>
              <div className="card-content">
                <div className="breakeven-analysis">
                  <div className="progress-section">
                    <div className="progress-header">
                      <div className="progress-label">
                        {Math.min(100, Math.round((breakEvenMonths / 24) * 100))}% bis zur Amortisation
                      </div>
                      <div className="progress-value">{breakEvenMonths} Monate</div>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${Math.min(100, (breakEvenMonths / 24) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="progress-timeline">
                      <span>0</span>
                      <span>6</span>
                      <span>12</span>
                      <span>18</span>
                      <span>24+ Monate</span>
                    </div>
                  </div>

                  <div className="breakeven-message">
                    <div className="message-header">
                      <InfoIcon />
                      <span className={`message-header-text message-header-${getBreakevenInfo(breakEvenMonths).icon}`}>
                        ROI Analyse
                      </span>
                    </div>
                    <p>{getBreakevenInfo(breakEvenMonths).message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="download-section">
            <button 
              className="download-button" 
              onClick={generatePDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <>
                  <span className="loading-spinner"></span>
                  PDF wird erstellt...
                </>
              ) : (
                <>
                  <DownloadIcon />
                  Bericht herunterladen
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ROICalculator;