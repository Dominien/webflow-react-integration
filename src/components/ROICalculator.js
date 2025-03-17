import React, { useState } from 'react';
import './ROICalculator.css';

function ROICalculator() {
  // State variables for calculator inputs
  const [investment, setInvestment] = useState(15000);
  const [monthlyRevenue, setMonthlyRevenue] = useState(1000);
  const [expenses, setExpenses] = useState(200);
  
  // Calculate ROI metrics
  const netMonthlyRevenue = monthlyRevenue - expenses;
  const monthsToBreakEven = investment / netMonthlyRevenue;
  const annualROI = (netMonthlyRevenue * 12 / investment) * 100;
  
  return (
    <div className="roi-calculator">
      <h2>ROI Calculator</h2>
      <div className="calculator-inputs">
        <div className="input-group">
          <label htmlFor="investment">Initial Investment (€)</label>
          <input
            id="investment"
            type="number"
            value={investment}
            onChange={(e) => setInvestment(Number(e.target.value))}
            min="0"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="revenue">Monthly Revenue (€)</label>
          <input
            id="revenue"
            type="number"
            value={monthlyRevenue}
            onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
            min="0"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="expenses">Monthly Expenses (€)</label>
          <input
            id="expenses"
            type="number"
            value={expenses}
            onChange={(e) => setExpenses(Number(e.target.value))}
            min="0"
          />
        </div>
      </div>
      
      <div className="results">
        <div className="result-item">
          <span className="result-label">Net Monthly Revenue:</span>
          <span className="result-value">{netMonthlyRevenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
        </div>
        
        <div className="result-item">
          <span className="result-label">Months to Break Even:</span>
          <span className="result-value">{monthsToBreakEven.toFixed(1)} months</span>
        </div>
        
        <div className="result-item">
          <span className="result-label">Annual ROI:</span>
          <span className="result-value">{annualROI.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

export default ROICalculator;