import salesService from '../services/salesService.js';

export const getSales = async (req, res) => {
  try {
    await salesService.ensureLoaded();
    const result = await salesService.getSales(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFilterOptions = async (req, res) => {
  try {
    await salesService.ensureLoaded();
    const filters = await salesService.getFilterOptions();
    res.json(filters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

