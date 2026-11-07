import { Router } from 'express';
import cashbackService from './cashback.service.js';
import walletService from '../wallet/wallet.service.js';
import { sendResponse } from '../../shared/response.js';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

// Student get their own cashback records
router.get('/my-cashback', async (req, res, next) => {
  try {
    const wallet = await walletService.getWalletByStudentUser(req.user.id);
    const records = await cashbackService.getCashbackHistoryForWallet(wallet.id);
    return sendResponse(res, 200, true, 'Cashback history fetched', records);
  } catch (error) {
    next(error);
  }
});

// Admin endpoints
router.get('/rules', async (req, res, next) => {
  try {
    const rules = await cashbackService.getRules();
    return sendResponse(res, 200, true, 'Cashback rules fetched', rules);
  } catch (error) {
    next(error);
  }
});

router.post('/rules', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const rule = await cashbackService.createRule(req.body);
    return sendResponse(res, 201, true, 'Cashback rule created', rule);
  } catch (error) {
    next(error);
  }
});

router.put('/rules/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const rule = await cashbackService.updateRule(req.params.id, req.body);
    return sendResponse(res, 200, true, 'Cashback rule updated', rule);
  } catch (error) {
    next(error);
  }
});

router.get('/all-history', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const history = await cashbackService.getAllCashbackHistory();
    return sendResponse(res, 200, true, 'All cashback history fetched', history);
  } catch (error) {
    next(error);
  }
});

export default router;
