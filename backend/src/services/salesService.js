import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { Op } from 'sequelize';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import Sale from '../models/Sale.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  importData() {
    const DATA_PATH = path.join(__dirname, '../data/sales_data.csv');

    if (!fs.existsSync(DATA_PATH)) {
      console.warn('Sales data file not found. Skipping import.');
      this.resolveLoaded();
      return;
    }

    const results = [];
    const BATCH_SIZE = 1000;

    fs.createReadStream(DATA_PATH)
      .pipe(csv({
        mapHeaders: ({ header }) => header.toLowerCase().replace(/ /g, '_')
      }))
      .on('data', (data) => {
        const processed = {
          transaction_id: data.transaction_id,
          customer_id: data.customer_id,
          product_id: data.product_id,
          employee_name: data.employee_name,
          customer_name: data.customer_name,
          phone_number: data.phone_number,
          customer_region: data.customer_region,
          gender: data.gender,
          product_category: data.product_category,
          payment_method: data.payment_method,
          date: data.date,
          age: parseInt(data.age) || 0,
          quantity: parseInt(data.quantity) || 0,
          price_per_unit: parseFloat(data.price_per_unit) || 0,
          discount_percentage: parseFloat(data.discount_percentage) || 0,
          total_amount: parseFloat(data.total_amount) || 0,
          final_amount: parseFloat(data.final_amount) || 0,
          tags: data.tags || ''
        };
        results.push(processed);
      })
      .on('end', async () => {
        try {
          console.log(`Parsed ${results.length} records. Inserting into database...`);

          // Insert in batches
          for (let i = 0; i < results.length; i += BATCH_SIZE) {
            const batch = results.slice(i, i + BATCH_SIZE);
            await Sale.bulkCreate(batch, { ignoreDuplicates: true });
            if (i % 10000 === 0) console.log(`Inserted ${i} records...`);
          }

          console.log('Data imported successfully.');
          this.resolveLoaded();
        } catch (error) {
          console.error('Error importing data:', error);
          this.resolveLoaded(); // Resolve anyway to allow app to start
        }
      })
      .on('error', (err) => {
        console.error('Error reading CSV:', err);
        this.resolveLoaded(); // Resolve anyway to allow app to start
      });
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

export default new SalesService();
