import React, { useState, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import './ROICalculator.css';

ChartJS.register(ArcElement, ChartTooltip, Legend);

// Fee constants
const STATUTORY_FEE = 10.53;
const PRIVATE_FEE_MULTIPLIER = 1.8;
const PRIVATE_FEE = STATUTORY_FEE * PRIVATE_FEE_MULTIPLIER;
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

function ROICalculator() {
  // Patient counts
  const [statutoryPatients, setStatutoryPatients] = useState(20);
  const [privatePatients, setPrivatePatients] = useState(5);
  const [selfPayPatients, setSelfPayPatients] = useState(10);

  // Sessions per patient
  const [statutorySessions, setStatutorySessions] = useState(6);
  const [privateSessions, setPrivateSessions] = useState(6);

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
    // Calculate revenue for statutory patients
    const statRevenue = statutoryPatients * statutorySessions * STATUTORY_FEE;
    setStatutoryRevenue(statRevenue);

    // Calculate revenue for private patients
    const privRevenue = privatePatients * privateSessions * PRIVATE_FEE;
    setPrivateRevenue(privRevenue);

    // Calculate revenue for self-pay patients
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
      
      // Title text
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text("reLounge ROI Kalkulation", 20, 20);
      
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
      
      const summaryText = [
        `Dieser Bericht analysiert die potenzielle Rentabilität eines reLounge Therapiesystems`,
        `basierend auf ${statutoryPatients + privatePatients + selfPayPatients} Patienten und einem geschätzten monatlichen Umsatz`,
        `von ${formatCurrency(totalRevenue)}.`,
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
           formatCurrency(STATUTORY_FEE), 
           formatCurrency(statutoryRevenue)
          ],
          ['Privatpatienten', 
           privatePatients.toString(), 
           privateSessions.toString(), 
           formatCurrency(PRIVATE_FEE), 
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
            ['Monatliche Betriebskosten', formatCurrency(monthlyExpenses)],
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
            Geben Sie die Patientendaten Ihrer Praxis ein, um den potenziellen Umsatz zu berechnen
          </p>
        </div>
        <div className="card-content">
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
                hint={`Gebühr pro Sitzung: ${formatCurrency(STATUTORY_FEE)}`}
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
                hint={`Gebühr pro Sitzung: ${formatCurrency(PRIVATE_FEE)}`}
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
                  hint="Inklusive Strom, Wartung, etc."
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
                  Umsatzübersicht
                </h2>
                <p className="card-description">Geschätzter Umsatz basierend auf Ihren Eingaben</p>
              </div>
              <div className="card-content">
                <div className="revenue-summary">
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
                      <span>Monatliche Betriebskosten:</span>
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