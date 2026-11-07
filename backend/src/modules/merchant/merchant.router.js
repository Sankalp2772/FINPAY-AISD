import { Router } from 'express';
import merchantService from './merchant.service.js';
import { sendResponse } from '../../shared/response.js';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// Public / Authenticated read list for students & admin
router.get('/categories', authenticateToken, async (req, res, next) => {
  try {
    const categories = await merchantService.getCategories();
    return sendResponse(res, 200, true, 'Categories fetched', categories);
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    // If student, return only active merchants; if admin, return all
    const merchants = req.user.role === 'ADMIN' 
      ? await merchantService.getAllMerchants()
      : await merchantService.getActiveMerchants();
    return sendResponse(res, 200, true, 'Merchants fetched', merchants);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const merchant = await merchantService.getMerchant(req.params.id);
    return sendResponse(res, 200, true, 'Merchant fetched', merchant);
  } catch (error) {
    next(error);
  }
});

// Admin only actions
router.post('/categories', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const category = await merchantService.createCategory(req.body);
    return sendResponse(res, 201, true, 'Category created', category);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const merchant = await merchantService.createMerchant(req.body);
    return sendResponse(res, 201, true, 'Merchant created', merchant);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const merchant = await merchantService.updateMerchant(req.params.id, req.body);
    return sendResponse(res, 200, true, 'Merchant updated', merchant);
  } catch (error) {
    next(error);
  }
});

export default router;
