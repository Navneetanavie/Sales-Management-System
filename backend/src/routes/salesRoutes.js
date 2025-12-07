import express from 'express';
import { getSales, getFilterOptions } from '../controllers/salesController.js';

const router = express.Router();

router.get('/', getSales);
router.get('/filters', getFilterOptions);

export default router;
