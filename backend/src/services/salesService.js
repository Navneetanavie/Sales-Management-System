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

    this.filtersCache = null;
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

      await sequelize.query('PRAGMA journal_mode = WAL;');
      await sequelize.query('PRAGMA synchronous = NORMAL;');
      await sequelize.query('PRAGMA temp_store = MEMORY;');
      await sequelize.query('PRAGMA cache_size = -100000;');

      // Helpful indexes for common filters/sorts
      await sequelize.query('CREATE INDEX IF NOT EXISTS idx_sales_date ON "Sales" (date DESC);');
      await sequelize.query('CREATE INDEX IF NOT EXISTS idx_sales_search ON "Sales" (customer_name, phone_number);');
      await sequelize.query('CREATE INDEX IF NOT EXISTS idx_sales_filters ON "Sales" (customer_region, gender, product_category);');


      const count = await Sale.count();
      if (count === 0) {
        console.log('Database is empty. Importing data from CSV in background...');
        this.importData();        // ✅ DO NOT await
        this.resolveLoaded();    // ✅ API will work instantly
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

            await sequelize.transaction(async (t) => {
              await Sale.bulkCreate(batch, {
                ignoreDuplicates: true,
                transaction: t
              });
            });

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
      const search = `%${params.search}%`;
      where[Op.or] = [
        { customer_name: { [Op.like]: search } },
        { phone_number: { [Op.like]: search } }
      ];
    }

    if (params.region) where.customer_region = { [Op.in]: [].concat(params.region) };
    if (params.gender) where.gender = { [Op.in]: [].concat(params.gender) };
    if (params.category) where.product_category = { [Op.in]: [].concat(params.category) };
    if (params.paymentMethod) where.payment_method = { [Op.in]: [].concat(params.paymentMethod) };

    if (params.minAge || params.maxAge) {
      where.age = {};
      if (params.minAge) where.age[Op.gte] = +params.minAge;
      if (params.maxAge) where.age[Op.lte] = +params.maxAge;
    }

    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) where.date[Op.gte] = params.startDate;
      if (params.endDate) where.date[Op.lte] = params.endDate;
    }

    const page = +params.page || 1;
    const limit = Math.min(+params.limit || 20, 100);
    const offset = (page - 1) * limit;


    let order = [['date', 'DESC']];
    if (params.sortBy === 'quantity') {
      order = [['quantity', 'DESC']];
    } else if (params.sortBy === 'customer_name') {
      order = [['customer_name', 'ASC']];
    }

    const data = await Sale.findAll({
      where,
      order,
      limit,
      offset,
      attributes: [
        'transaction_id', 'customer_name', 'phone_number', 'product_category',
        'final_amount', 'date',
        'customer_id', 'employee_name', 'customer_region', 'gender',
        'age', 'quantity', 'total_amount', 'product_id'
      ] // ✅ send ALL data needed for table
    });

    const stats = await Sale.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('transaction_id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalUnits'],
        [sequelize.fn('SUM', sequelize.col('final_amount')), 'totalAmount'],
        [sequelize.fn('SUM', sequelize.literal('total_amount - final_amount')), 'totalDiscount']
      ],
      where,
      raw: true
    });

    const totalCount = Number(stats?.count || 0);

    return {
      data,
      stats: {
        totalUnits: Number(stats?.totalUnits || 0),
        totalAmount: Number(stats?.totalAmount || 0),
        totalDiscount: Number(stats?.totalDiscount || 0),
        count: totalCount
      },
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    };
  }


  async getFilterOptions() {
    if (this.filtersCache) return this.filtersCache;

    const [regions, genders, categories, paymentMethods] = await Promise.all([
      Sale.findAll({
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('customer_region')), 'v']],
        raw: true
      }),
      Sale.findAll({
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('gender')), 'v']],
        raw: true
      }),
      Sale.findAll({
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('product_category')), 'v']],
        raw: true
      }),
      Sale.findAll({
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('payment_method')), 'v']],
        raw: true
      })
    ]);

    const filters = {
      regions: regions.map(x => x.v).filter(Boolean),
      genders: genders.map(x => x.v).filter(Boolean),
      categories: categories.map(x => x.v).filter(Boolean),
      paymentMethods: paymentMethods.map(x => x.v).filter(Boolean),
      tags: await this.getAllTags()
    };

    this.filtersCache = filters;
    return filters;
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
