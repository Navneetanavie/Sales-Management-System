import React from 'react';

const StatsCards = ({ stats }) => {
  const safeStats = stats || {
    totalUnits: 0,
    totalAmount: 0,
    totalDiscount: 0,
    count: 0
  };

  const formatCurrency = (value) => {
    const safeValue = Number(value) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(safeValue);
  };

  const InfoIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px', color: '#9ca3af', cursor: 'pointer' }}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );

  return (
    <div className="stats-cards">
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Total units sold</span>
          <InfoIcon />
        </div>
        <div className="stat-value">{safeStats.totalUnits}</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Total Amount</span>
          <InfoIcon />
        </div>
        <div className="stat-value">
          {formatCurrency(safeStats.totalAmount)} <span>(19 SRs)</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Total Discount</span>
          <InfoIcon />
        </div>
        <div className="stat-value">
          {formatCurrency(safeStats.totalDiscount)} <span className="stat-value">(45 SRs)</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
