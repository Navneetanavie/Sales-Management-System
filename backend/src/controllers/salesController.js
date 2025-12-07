const salesService = require('../services/salesService');

exports.getSales = async (req, res) => {
  try {
    await salesService.ensureLoaded();
    const result = await salesService.getSales(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFilterOptions = async (req, res) => {
  try {
    await salesService.ensureLoaded();
    const regions = await salesService.getUniqueValues('customer_region');
    const genders = await salesService.getUniqueValues('gender');
    const categories = await salesService.getUniqueValues('product_category');
    const paymentMethods = await salesService.getUniqueValues('payment_method');
    const tags = await salesService.getAllTags();

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
