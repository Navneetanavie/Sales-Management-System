const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sale = sequelize.define('Sale', {
  transaction_id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  customer_id: DataTypes.STRING,
  product_id: DataTypes.STRING,
  employee_name: DataTypes.STRING,
  customer_name: DataTypes.STRING,
  phone_number: DataTypes.STRING,
  customer_region: DataTypes.STRING,
  gender: DataTypes.STRING,
  product_category: DataTypes.STRING,
  payment_method: DataTypes.STRING,
  date: DataTypes.DATEONLY,
  age: DataTypes.INTEGER,
  quantity: DataTypes.INTEGER,
  price_per_unit: DataTypes.FLOAT,
  discount_percentage: DataTypes.FLOAT,
  total_amount: DataTypes.FLOAT,
  final_amount: DataTypes.FLOAT,
  tags: DataTypes.TEXT // Stored as comma-separated string
}, {
  indexes: [
    { fields: ['customer_region'] },
    { fields: ['gender'] },
    { fields: ['product_category'] },
    { fields: ['payment_method'] },
    { fields: ['date'] },
    { fields: ['customer_name'] },
    { fields: ['phone_number'] }
  ]
});

module.exports = Sale;
