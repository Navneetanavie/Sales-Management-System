import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import Sale from '../models/Sale.js';

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

      
      await sequelize.query('CREATE INDEX IF NOT EXISTS idx_sales_date ON "Sales" (date DESC);');
      await sequelize.query('CREATE INDEX IF NOT EXISTS idx_sales_search ON "Sales" (customer_name, phone_number);');
      await sequelize.query('CREATE INDEX IF NOT EXISTS idx_sales_filters ON "Sales" (customer_region, gender, product_category);');


      console.log('Database initialized in read-only mode.');
      this.resolveLoaded();

    } catch (error) {
      console.error('Database initialization error:', error);
    }
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

    if (params.region)
      where.customer_region = {
        [Op.in]: [].concat(params.region).flatMap(v => v.split(','))
      };

    if (params.gender)
      where.gender = {
        [Op.in]: [].concat(params.gender).flatMap(v => v.split(','))
      };

    if (params.category)
      where.product_category = {
        [Op.in]: [].concat(params.category).flatMap(v => v.split(','))
      };

    if (params.paymentMethod)
      where.payment_method = {
        [Op.in]: [].concat(params.paymentMethod).flatMap(v => v.split(','))
      };


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
      ] 
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
