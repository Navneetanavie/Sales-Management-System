const salesService = require('../services/salesService');

exports.getSales = async (req, res) => {
  try {
    await salesService.ensureLoaded();
    const result = salesService.getSales(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFilterOptions = async (req, res) => {
  try {
    await salesService.ensureLoaded();
    const regions = salesService.getUniqueValues('customer_region');
    const genders = salesService.getUniqueValues('gender');
    const categories = salesService.getUniqueValues('product_category');
    const paymentMethods = salesService.getUniqueValues('payment_method');
    const tags = salesService.getAllTags();

    res.json({
      regions,
      genders,
      categories,
      paymentMethods,
      tags
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
