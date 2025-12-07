const mockData = require('../data/mockData');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

class SalesService {
  constructor() {
    this.data = [];
    this.loadData();
  }

  loadData() {
    const FILE_ID = '1tzbyuxBmrBwMSXbL22r33FUMtO0V_lxb';
    const DRIVE_URL = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;

    console.log('Fetching data from Google Drive...');

    const parseCSV = (stream) => {
      const { Readable } = require('stream');
      const nodeStream = Readable.fromWeb(stream);
      const results = [];

      nodeStream
        .pipe(csv({
          mapHeaders: ({ header }) => header.toLowerCase().replace(/ /g, '_')
        }))
        .on('data', (data) => {
          const processed = {
            ...data,
            age: parseInt(data.age) || 0,
            quantity: parseInt(data.quantity) || 0,
            price_per_unit: parseFloat(data.price_per_unit) || 0,
            discount_percentage: parseFloat(data.discount_percentage) || 0,
            total_amount: parseFloat(data.total_amount) || 0,
            final_amount: parseFloat(data.final_amount) || 0,
            tags: data.tags ? data.tags.split(',').map(t => t.trim()) : []
          };
          results.push(processed);
        })
        .on('end', () => {
          this.data = results;
          console.log(`Successfully loaded ${this.data.length} records from Google Drive.`);
        })
        .on('error', (err) => {
          console.error('Error parsing CSV stream:', err);
          this.data = mockData;
        });
    };

    fetch(DRIVE_URL)
      .then(async response => {
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          console.log('Virus warning detected. Attempting to bypass...');
          const text = await response.text();


          const confirmMatch = text.match(/name="confirm" value="([^"]+)"/);
          const uuidMatch = text.match(/name="uuid" value="([^"]+)"/);

          if (confirmMatch && uuidMatch) {
            const confirm = confirmMatch[1];
            const uuid = uuidMatch[1];
            const CONFIRM_URL = `https://drive.usercontent.google.com/download?id=${FILE_ID}&export=download&confirm=${confirm}&uuid=${uuid}`;

            console.log('Fetching with confirmation...');
            return fetch(CONFIRM_URL).then(res => {
              if (!res.ok) throw new Error(`Failed to fetch confirmed URL: ${res.statusText}`);
              return res.body;
            });
          } else {
            throw new Error('Could not extract confirmation tokens from Drive page.');
          }
        }

        return response.body;
      })
      .then(body => parseCSV(body))
      .catch(err => {
        console.error('Error loading data from Drive:', err.message);
        console.log('Falling back to mock data.');
        this.data = mockData;
      });
  }

  getSales(params) {
    let results = [...this.data];


    if (params.search) {
      const searchLower = params.search.toLowerCase();
      results = results.filter(item =>
        (item.customer_name && item.customer_name.toLowerCase().includes(searchLower)) ||
        (item.phone_number && item.phone_number.includes(searchLower))
      );
    }


    if (params.region) {
      const regions = Array.isArray(params.region) ? params.region : [params.region];
      results = results.filter(item => regions.includes(item.customer_region));
    }

    if (params.gender) {
      const genders = Array.isArray(params.gender) ? params.gender : [params.gender];
      results = results.filter(item => genders.includes(item.gender));
    }

    if (params.category) {
      const categories = Array.isArray(params.category) ? params.category : [params.category];
      results = results.filter(item => categories.includes(item.product_category));
    }

    if (params.paymentMethod) {
      const methods = Array.isArray(params.paymentMethod) ? params.paymentMethod : [params.paymentMethod];
      results = results.filter(item => methods.includes(item.payment_method));
    }

    if (params.minAge) {
      results = results.filter(item => item.age >= parseInt(params.minAge));
    }
    if (params.maxAge) {
      results = results.filter(item => item.age <= parseInt(params.maxAge));
    }

    if (params.startDate) {
      results = results.filter(item => new Date(item.date) >= new Date(params.startDate));
    }
    if (params.endDate) {
      results = results.filter(item => new Date(item.date) <= new Date(params.endDate));
    }

    if (params.tags) {
      const tags = Array.isArray(params.tags) ? params.tags : [params.tags];
      results = results.filter(item => item.tags.some(tag => tags.includes(tag)));
    }



    if (params.sortBy) {
      results.sort((a, b) => {
        if (params.sortBy === 'date') {
          return new Date(b.date) - new Date(a.date);
        } else if (params.sortBy === 'quantity') {
          return b.quantity - a.quantity;
        } else if (params.sortBy === 'customer_name') {
          return (a.customer_name || '').localeCompare(b.customer_name || '');
        }
        return 0;
      });
    } else {

      results.sort((a, b) => new Date(b.date) - new Date(a.date));
    }


    const stats = results.reduce((acc, item) => {
      acc.totalUnits += item.quantity || 0;
      acc.totalAmount += item.final_amount || 0;
      const discount = (item.total_amount || 0) - (item.final_amount || 0);
      acc.totalDiscount += discount;

      acc.count += 1;
      if ((item.final_amount || 0) > 0) acc.amountCount += 1;
      if (discount > 0) acc.discountCount += 1;

      return acc;
    }, { totalUnits: 0, totalAmount: 0, totalDiscount: 0, count: 0, amountCount: 0, discountCount: 0 });


    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedResults = results.slice(startIndex, endIndex);

    return {
      data: paginatedResults,
      stats,
      total: results.length,
      page,
      limit,
      totalPages: Math.ceil(results.length / limit)
    };
  }

  getUniqueValues(field) {
    const values = new Set(this.data.map(item => item[field]).filter(Boolean));
    return Array.from(values);
  }

  getAllTags() {
    const tags = new Set();
    this.data.forEach(item => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  }
}

module.exports = new SalesService();
