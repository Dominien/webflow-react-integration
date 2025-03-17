import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './ROICalculator.css';

ChartJS.register(ArcElement, Tooltip, Legend);

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

  // Show results section
  const [showResults, setShowResults] = useState(false);

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
        // Get the position of the element relative to the viewport
        const rect = resultsSection.getBoundingClientRect();
        
        // Calculate where to scroll (element's position + current scroll - some offset for better UX)
        const offset = 20; // Offset from the top of the viewport
        const scrollPosition = rect.top + window.pageYOffset - offset;
        
        // Scroll to position
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }, 300); // Increased timeout to ensure DOM is updated
  };

  // Chart data for revenue breakdown
  const revenueChartData = {
    labels: ["Gesetzlich", "Privat", "Selbstzahler"],
    datasets: [
      {
        label: "Umsatz (€)",
        data: [statutoryRevenue, privateRevenue, selfPayRevenue],
        backgroundColor: ["rgba(53, 162, 235, 0.5)", "rgba(75, 192, 192, 0.5)", "rgba(255, 99, 132, 0.5)"],
        borderColor: ["rgba(53, 162, 235, 1)", "rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Umsatzverteilung",
      },
    },
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
  };

  return (
    <div className="roi-calculator">
      <div className="calculator-card">
        <div className="card-header">
          <h2 className="card-title">Patienteninformationen</h2>
          <p className="card-description">
            Geben Sie die Patientendaten Ihrer Praxis ein, um den potenziellen Umsatz zu berechnen
          </p>
        </div>
        <div className="card-content">
          {/* Statutory Health Insurance Patients */}
          <div className="input-section">
            <h3 className="section-title">Gesetzlich versicherte Patienten</h3>
            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="statutory-patients">Anzahl der Patienten</label>
                <input
                  id="statutory-patients"
                  type="number"
                  min="0"
                  value={statutoryPatients}
                  onChange={(e) => setStatutoryPatients(Number.parseInt(e.target.value) || 0)}
                />
                <p className="input-hint">Gebühr pro Sitzung: {formatCurrency(STATUTORY_FEE)}</p>
              </div>
              <div className="input-group">
                <label htmlFor="statutory-sessions">Durchschnittliche Sitzungen pro Patient</label>
                <input
                  id="statutory-sessions"
                  type="number"
                  min="1"
                  value={statutorySessions}
                  onChange={(e) => setStatutorySessions(Number.parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>

          {/* Private Patients */}
          <div className="input-section">
            <h3 className="section-title">Privatpatienten</h3>
            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="private-patients">Anzahl der Patienten</label>
                <input
                  id="private-patients"
                  type="number"
                  min="0"
                  value={privatePatients}
                  onChange={(e) => setPrivatePatients(Number.parseInt(e.target.value) || 0)}
                />
                <p className="input-hint">Gebühr pro Sitzung: {formatCurrency(PRIVATE_FEE)}</p>
              </div>
              <div className="input-group">
                <label htmlFor="private-sessions">Durchschnittliche Sitzungen pro Patient</label>
                <input
                  id="private-sessions"
                  type="number"
                  min="1"
                  value={privateSessions}
                  onChange={(e) => setPrivateSessions(Number.parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>

          {/* Self-Pay Patients */}
          <div className="input-section">
            <h3 className="section-title">Selbstzahler</h3>
            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="self-pay-patients">Anzahl der Patienten</label>
                <input
                  id="self-pay-patients"
                  type="number"
                  min="0"
                  value={selfPayPatients}
                  onChange={(e) => setSelfPayPatients(Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="input-group">
                <label>Paketauswahl</label>
                <div className="radio-group">
                  {Object.entries(SELF_PAY_PACKAGES).map(([key, pkg]) => (
                    <div key={key} className="radio-item">
                      <input
                        type="radio"
                        id={key}
                        name="package"
                        value={key}
                        checked={selectedPackage === key}
                        onChange={() => setSelectedPackage(key)}
                      />
                      <label htmlFor={key}>
                        {pkg.name} - {formatCurrency(pkg.price)}
                        <span className="price-per-session">
                          ({formatCurrency(pkg.price / pkg.sessions)} pro Sitzung)
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
            <div className="toggle-section">
              <label htmlFor="advanced-toggle" className="toggle-label">
                Erweiterte Optionen anzeigen
              </label>
              <div className="toggle-switch">
                <input
                  id="advanced-toggle"
                  type="checkbox"
                  checked={showAdvancedOptions}
                  onChange={(e) => setShowAdvancedOptions(e.target.checked)}
                />
                <label htmlFor="advanced-toggle"></label>
              </div>
            </div>

            {showAdvancedOptions && (
              <div className="advanced-inputs">
                <div className="input-group">
                  <label htmlFor="system-cost">reLounge Systemkosten (€)</label>
                  <input
                    id="system-cost"
                    type="number"
                    min="0"
                    value={systemCost}
                    onChange={(e) => setSystemCost(Number.parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="monthly-expenses">Monatliche Betriebskosten (€)</label>
                  <input
                    id="monthly-expenses"
                    type="number"
                    min="0"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(Number.parseInt(e.target.value) || 0)}
                  />
                  <p className="input-hint">Inklusive Strom, Wartung, etc.</p>
                </div>
              </div>
            )}
          </div>

          {/* Calculate Button */}
          <div className="button-container">
            <button onClick={calculateResults} className="calculate-button">
              Ergebnisse berechnen
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {showResults && (
        <div id="results-section" className="results-container">
          <div className="results-indicator">
            <div className="arrow-down"></div>
            <span>Ihre Ergebnisse</span>
          </div>

          <div className="results-grid">
            <div className="results-card">
              <div className="card-header">
                <h2 className="card-title">Umsatzübersicht</h2>
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
                <h2 className="card-title">Umsatzvisualisierung</h2>
                <p className="card-description">Grafische Darstellung Ihrer Umsatzströme</p>
              </div>
              <div className="card-content">
                <div className="chart-container">
                  {totalRevenue > 0 ? (
                    <Pie data={revenueChartData} options={chartOptions} />
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
                <h2 className="card-title">Amortisationsanalyse</h2>
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
                    <p>
                      {breakEvenMonths <= 8 ? (
                        <span>
                          Ihre geschätzte Amortisationszeit ist hervorragend! Mit {breakEvenMonths} Monaten werden Sie
                          schneller als der typische Zeitraum von 8-14 Monaten einen Return on Investment sehen.
                        </span>
                      ) : breakEvenMonths <= 14 ? (
                        <span>
                          Ihre geschätzte Amortisationszeit von {breakEvenMonths} Monaten liegt im typischen Bereich von
                          8-14 Monaten für reLounge-Systeme.
                        </span>
                      ) : (
                        <span>
                          Ihre geschätzte Amortisationszeit von {breakEvenMonths} Monaten ist länger als der typische
                          Bereich von 8-14 Monaten. Erwägen Sie eine Anpassung Ihres Patientenmix oder der
                          Paketangebote, um den ROI zu verbessern.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="download-section">
            <button className="download-button">Bericht herunterladen</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ROICalculator;