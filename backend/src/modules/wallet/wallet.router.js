import { Router } from 'express';
import walletService from './wallet.service.js';
import { sendResponse, sendError } from '../../shared/response.js';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/my-wallet', async (req, res, next) => {
  try {
    const wallet = await walletService.getWalletByStudentUser(req.user.id);
    return sendResponse(res, 200, true, 'Wallet fetched successfully', wallet);
  } catch (error) {
    next(error);
  }
});

router.get('/my-transactions', async (req, res, next) => {
  try {
    const wallet = await walletService.getWalletByStudentUser(req.user.id);
    const limit = req.query.limit || 50;
    const transactions = await walletService.getWalletTransactions(wallet.id, limit);
    return sendResponse(res, 200, true, 'Transactions fetched successfully', transactions);
  } catch (error) {
    next(error);
  }
});

router.post('/topup', async (req, res, next) => {
  try {
    const wallet = await walletService.getWalletByStudentUser(req.user.id);
    const { amount } = req.body;
    const result = await walletService.topupWallet(wallet.id, amount);
    return sendResponse(res, 200, true, 'Wallet topped up successfully', result);
  } catch (error) {
    next(error);
  }
});

router.get('/:walletId/transactions', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { walletId } = req.params;
    const transactions = await walletService.getWalletTransactions(walletId, req.query.limit || 50);
    return sendResponse(res, 200, true, 'Transactions fetched', transactions);
  } catch (error) {
    next(error);
  }
});

export default router;
