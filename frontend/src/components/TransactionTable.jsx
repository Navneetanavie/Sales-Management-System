import React from 'react';

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
              <td>{item.phone_number}</td>
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
