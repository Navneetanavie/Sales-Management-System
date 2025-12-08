import React from 'react';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>{text}</span>
      <button
        onClick={handleCopy}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          color: copied ? '#10b981' : '#9ca3af',
          transition: 'color 0.2s'
        }}
        title="Copy phone number"
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        )}
      </button>
    </div>
  );
};

const TransactionTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="no-results">No results found.</div>;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="table-container">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Date</th>
            <th>Customer ID</th>
            <th>Customer Name</th>
            <th>Phone Number</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Product Category</th>
            <th>Quantity</th>
            <th>Total Amount</th>
            <th>Customer Region</th>
            <th>Product ID</th>
            <th>Employee Name</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.transaction_id || index}>
              <td>{item.transaction_id}</td>
              <td>{item.date}</td>
              <td>{item.customer_id}</td>
              <td>{item.customer_name}</td>
              <td><CopyButton text={item.phone_number} /></td>
              <td>{item.gender}</td>
              <td>{item.age}</td>
              <td>{item.product_category}</td>
              <td>{item.quantity.toString().padStart(2, '0')}</td>
              <td>{formatCurrency(item.total_amount)}</td>
              <td>{item.customer_region}</td>
              <td>{item.product_id}</td>
              <td>{item.employee_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
