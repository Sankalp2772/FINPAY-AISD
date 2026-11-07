import { Router } from 'express';
import reconciliationService from './reconciliation.service.js';
import { sendResponse } from '../../shared/response.js';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

// Admin dashboard statistics
router.get('/admin-dashboard', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const stats = await reconciliationService.getAdminDashboardStats();
    return sendResponse(res, 200, true, 'Admin stats fetched', stats);
  } catch (error) {
    next(error);
  }
});

// Student dashboard statistics
router.get('/student-dashboard', async (req, res, next) => {
  try {
    const stats = await reconciliationService.getStudentDashboardStats(
      req.user.studentId,
      req.user.walletId
    );
    return sendResponse(res, 200, true, 'Student dashboard stats fetched', stats);
  } catch (error) {
    next(error);
  }
});

// Admin generate reconciliation report
router.get('/report', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const currentYear = year ? Number(year) : new Date().getFullYear();
    const currentMonth = month ? Number(month) : new Date().getMonth() + 1;

    const result = await reconciliationService.generateMonthlyReconciliation(
      currentYear,
      currentMonth,
      req.user.email
    );
    return sendResponse(res, 200, true, 'Reconciliation report generated', result);
  } catch (error) {
    next(error);
  }
});

// Admin export reconciliation CSV
router.get('/export-csv', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const currentYear = year ? Number(year) : new Date().getFullYear();
    const currentMonth = month ? Number(month) : new Date().getMonth() + 1;

    const csvData = await reconciliationService.exportCsv(currentYear, currentMonth);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="finpay_reconciliation_${currentYear}_${currentMonth}.csv"`
    );
    return res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
});

// Admin list past reconciliations
router.get('/history', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const list = await reconciliationService.getSavedReconciliations();
    return sendResponse(res, 200, true, 'Reconciliation history fetched', list);
  } catch (error) {
    next(error);
  }
});

export default router;
