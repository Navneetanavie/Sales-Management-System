const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Sale = require('../models/Sale');

class SalesService {
  constructor() {
    this.dataLoaded = new Promise((resolve) => {
      this.resolveLoaded = resolve;
    });
    this.initDatabase();
  }

  async ensureLoaded() {
    await this.dataLoaded;
  }

  async initDatabase() {
    try {
      await sequelize.authenticate();
      console.log('Connected to SQLite database.');

      await sequelize.sync();

      const count = await Sale.count();
      if (count === 0) {
        console.log('Database is empty. Importing data from CSV...');
        await this.importData();
      } else {
        console.log(`Database already contains ${count} records.`);
        this.resolveLoaded();
      }
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  async getSales(params) {
    const where = {};

    if (params.search) {
      const searchLower = `%${params.search.toLowerCase()}%`;
      where[Op.or] = [
        { customer_name: { [Op.like]: searchLower } },
        { phone_number: { [Op.like]: searchLower } }
      ];
    }

    if (params.region) {
      where.customer_region = Array.isArray(params.region) ? { [Op.in]: params.region } : params.region;
    }

    if (params.gender) {
      where.gender = Array.isArray(params.gender) ? { [Op.in]: params.gender } : params.gender;
    }

    if (params.category) {
      where.product_category = Array.isArray(params.category) ? { [Op.in]: params.category } : params.category;
    }

    if (params.paymentMethod) {
      where.payment_method = Array.isArray(params.paymentMethod) ? { [Op.in]: params.paymentMethod } : params.paymentMethod;
    }

    if (params.minAge) where.age = { ...where.age, [Op.gte]: parseInt(params.minAge) };
    if (params.maxAge) where.age = { ...where.age, [Op.lte]: parseInt(params.maxAge) };

    if (params.startDate) where.date = { ...where.date, [Op.gte]: params.startDate };
    if (params.endDate) where.date = { ...where.date, [Op.lte]: params.endDate };

    if (params.tags) {
      const tags = Array.isArray(params.tags) ? params.tags : [params.tags];
      where.tags = { [Op.or]: tags.map(tag => ({ [Op.like]: `%${tag}%` })) };
    }

    const order = [];
    if (params.sortBy) {
      if (params.sortBy === 'date') order.push(['date', 'DESC']);
      else if (params.sortBy === 'quantity') order.push(['quantity', 'DESC']);
      else if (params.sortBy === 'customer_name') order.push(['customer_name', 'ASC']);
    } else {
      order.push(['date', 'DESC']);
    }

    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Sale.findAndCountAll({
      where,
      order,
      limit,
      offset
    });

    // Calculate stats (simplified for performance, or do separate aggregate query)
    // For large datasets, calculating stats on filtered result might be expensive.
    // We'll do a separate aggregate query for stats on the filtered set.
    const stats = await Sale.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalUnits'],
        [sequelize.fn('SUM', sequelize.col('final_amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('transaction_id')), 'count'],
        [sequelize.literal('SUM(total_amount - final_amount)'), 'totalDiscount'],
        [sequelize.literal('SUM(CASE WHEN total_amount > final_amount THEN 1 ELSE 0 END)'), 'discountCount']
      ],
      where,
      raw: true
    });

    // Calculate total discount manually or via another query if critical
    // For now, let's use the basic stats
    const statResult = stats[0] || {};

    return {
      data: rows,
      stats: {
        totalUnits: statResult.totalUnits || 0,
        totalAmount: statResult.totalAmount || 0,
        totalDiscount: statResult.totalDiscount || 0,
        count: statResult.count || 0,
        amountCount: statResult.count || 0,
        discountCount: statResult.discountCount || 0
      },
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  async getUniqueValues(field) {
    const results = await Sale.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col(field)), field]],
      raw: true
    });
    return results.map(item => item[field]).filter(Boolean);
  }

  async getAllTags() {
    // This is expensive in SQL if tags are comma-separated strings.
    // Ideally tags should be normalized. For now, we'll fetch all tags and process in memory 
    // (or use a distinct query if possible, but split is hard).
    // Given the constraint, let's just return empty or a predefined list to avoid performance kill.
    // Or, we can fetch distinct tags column and split.
    const results = await Sale.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('tags')), 'tags']],
      raw: true
    });

    const tags = new Set();
    results.forEach(item => {
      if (item.tags) {
        item.tags.split(',').forEach(tag => tags.add(tag.trim()));
      }
    });
    return Array.from(tags);
  }
}

module.exports = new SalesService();
