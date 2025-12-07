import React from 'react';

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
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
        <div className="stat-value">{stats.totalUnits}</div>
      </div>
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Total Amount</span>
          <InfoIcon />
        </div>
        <div className="stat-value">
          {formatCurrency(stats.totalAmount)} <span className="stat-value">(19 SRs)</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">Total Discount</span>
          <InfoIcon />
        </div>
        <div className="stat-value">
          {formatCurrency(stats.totalDiscount)} <span className="stat-value">(45 SRs)</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
