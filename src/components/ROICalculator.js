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
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const EuroIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10h12"></path>
    <path d="M4 14h9"></path>
    <path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
    <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path>
    <path d="M12 14v2"></path>
    <path d="M8 9V5"></path>
    <path d="M16 9V5"></path>
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"></path>
    <path d="M18 17V9"></path>
    <path d="M13 17V5"></path>
    <path d="M8 17v-3"></path>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const EuroCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 9.5V8a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-1.5"></path>
    <path d="M7 7v10"></path>
    <path d="M20 7v10"></path>
    <path d="M8 15c4 0 6-2 6-5"></path>
    <path d="M8 9c4 0 6 2 6 5"></path>
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  // Chart data for revenue breakdown
  const revenueChartData = {
    labels: ["Gesetzlich", "Privat", "Selbstzahler"],
    datasets: [
      {
        label: "Umsatz (€)",
        data: [statutoryRevenue, privateRevenue, selfPayRevenue],
        backgroundColor: [
          "rgba(37, 58, 111, 0.7)",  // Secondary color (dark blue)
          "rgba(37, 58, 111, 0.4)",  // Lighter secondary
          "rgba(240, 180, 34, 0.7)"  // Primary color (gold)
        ],
        borderColor: [
          "rgba(37, 58, 111, 1)",    // Secondary color
          "rgba(37, 58, 111, 0.8)",  // Lighter secondary
          "rgba(240, 180, 34, 1)"    // Primary color
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 12,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
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
      
      // PDF title and header
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.setTextColor(37, 58, 111); // Secondary color
      pdf.text("reLounge ROI Kalkulationsbericht", 105, 20, { align: "center" });
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Erstellt am " + new Date().toLocaleDateString("de-DE"), 105, 30, { align: "center" });
      
      // Horizontal line
      pdf.setDrawColor(240, 180, 34); // Primary color
      pdf.setLineWidth(0.5);
      pdf.line(20, 35, 190, 35);
      
      // Patient Information Section
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(37, 58, 111);
      pdf.text("Patienteninformationen", 20, 45);
      
      // Patient table
      autoTable(pdf, {
        startY: 50,
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
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [37, 58, 111], textColor: [255, 255, 255] },
        columnStyles: { 
          0: { fontStyle: 'bold' }, 
          4: { halign: 'right', fontStyle: 'bold' } 
        },
        foot: [['Gesamt', '', '', '', formatCurrency(totalRevenue)]],
        footStyles: { fillColor: [240, 180, 34, 0.1], textColor: [0, 0, 0], fontStyle: 'bold' }
      });
      
      // Package information
      const packageY = pdf.previousAutoTable.finalY + 10;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Gewähltes Selbstzahlerpaket:", 20, packageY);
      
      pdf.setFont("helvetica", "normal");
      const selectedPkg = SELF_PAY_PACKAGES[selectedPackage];
      pdf.text(`${selectedPkg.name} - ${formatCurrency(selectedPkg.price)} (${formatCurrency(selectedPkg.price / selectedPkg.sessions)} pro Sitzung)`, 85, packageY);
      
      // Revenue chart section
      if (chartRef.current) {
        const chartY = packageY + 20;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(37, 58, 111);
        pdf.text("Umsatzvisualisierung", 105, chartY, { align: "center" });
        
        // Convert the chart to an image
        const chartCanvas = await html2canvas(chartRef.current.canvas);
        const chartImgData = chartCanvas.toDataURL('image/png');
        
        // Add the chart image to the PDF
        pdf.addImage(chartImgData, 'PNG', 55, chartY + 5, 100, 80);
      }
      
      // ROI Analysis Section (only if advanced options were shown)
      if (showAdvancedOptions) {
        const roiY = pdf.previousAutoTable ? (pdf.previousAutoTable.finalY + 100) : 170;
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(37, 58, 111);
        pdf.text("ROI Analyse", 20, roiY);
        
        autoTable(pdf, {
          startY: roiY + 5,
          head: [['Parameter', 'Wert']],
          body: [
            ['Systemkosten', formatCurrency(systemCost)],
            ['Monatliche Betriebskosten', formatCurrency(monthlyExpenses)],
            ['Monatlicher Nettoertrag', formatCurrency(totalRevenue - monthlyExpenses)],
            ['Geschätzte Amortisationszeit', `${breakEvenMonths} Monate`]
          ],
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 5 },
          headStyles: { fillColor: [37, 58, 111], textColor: [255, 255, 255] },
          columnStyles: { 0: { fontStyle: 'bold' } },
        });
        
        // ROI Analysis message
        const messageY = pdf.previousAutoTable.finalY + 10;
        const breakEvenInfo = getBreakevenInfo(breakEvenMonths);
        
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("ROI Bewertung:", 20, messageY);
        
        // Add colored icon based on breakeven status
        const iconColor = breakEvenInfo.color === "green" ? [0, 128, 0] : 
                          breakEvenInfo.color === "orange" ? [255, 140, 0] : [220, 0, 0];
        pdf.setFillColor(...iconColor);
        pdf.circle(17, messageY - 1, 2, 'F');
        
        // Add message text with word wrapping
        pdf.setFont("helvetica", "normal");
        const splitMessage = pdf.splitTextToSize(breakEvenInfo.message, 170);
        pdf.text(splitMessage, 20, messageY + 7);
      }
      
      // Footer
      pdf.setDrawColor(240, 180, 34);
      pdf.setLineWidth(0.5);
      pdf.line(20, 280, 190, 280);
      
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text("ROI Kalkulation für reLounge Therapiesysteme", 105, 285, { align: "center" });
      pdf.text("Generiert mit dem reLounge ROI Kalkulator", 105, 290, { align: "center" });
      
      // Save the PDF
      pdf.save("reLounge_ROI_Kalkulation.pdf");
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