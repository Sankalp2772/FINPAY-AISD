import { Router } from 'express';
import paymentService from './payment.service.js';
import { sendResponse } from '../../shared/response.js';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/pay', async (req, res, next) => {
  try {
    const { merchantId, amount } = req.body;
    const result = await paymentService.processPayment({
      userId: req.user.id,
      merchantId,
      amount
    });
    return sendResponse(res, 200, true, 'Payment processed successfully', result);
  } catch (error) {
    next(error);
  }
});

router.get('/my-history', async (req, res, next) => {
  try {
    const payments = await paymentService.getStudentPayments(req.user.id, req.query.limit || 50);
    return sendResponse(res, 200, true, 'Payments history fetched', payments);
  } catch (error) {
    next(error);
  }
});

router.get('/all-history', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const payments = await paymentService.getAllPayments(req.query.limit || 100);
    return sendResponse(res, 200, true, 'All payments fetched', payments);
  } catch (error) {
    next(error);
  }
});

export default router;
