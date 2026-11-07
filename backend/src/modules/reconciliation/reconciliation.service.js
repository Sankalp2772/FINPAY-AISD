import reconciliationRepository from './reconciliation.repository.js';

class ReconciliationService {
  async generateMonthlyReconciliation(year, month, reconciledBy = 'Admin') {
    const y = Number(year);
    const m = Number(month);

    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      const error = new Error('Invalid year or month specified.');
      error.statusCode = 400;
      throw error;
    }

    // Start of the month at 00:00:00 UTC
    const startDate = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
    // End of the month
    const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

    const payments = await reconciliationRepository.getPaymentsInDateRange(startDate, endDate);
    const cashbackRecords = await reconciliationRepository.getCashbackInDateRange(startDate, endDate);

    let totalPaymentAmount = 0;
    let eligiblePaymentAmount = 0;
    let eligiblePaymentsCount = 0;
    let expectedCashbackAmount = 0;

    for (const p of payments) {
      const amt = Number(p.amount);
      totalPaymentAmount += amt;

      const cb = Number(p.cashbackAmount);
      if (cb > 0) {
        eligiblePaymentsCount += 1;
        eligiblePaymentAmount += amt;
        expectedCashbackAmount += cb;
      }
    }

    let totalCashbackCredited = 0;
    for (const cr of cashbackRecords) {
      totalCashbackCredited += Number(cr.amount);
    }

    const differenceAmount = Math.round((totalCashbackCredited - expectedCashbackAmount) * 100) / 100;

    const summary = {
      year: y,
      month: m,
      totalPaymentsCount: payments.length,
      totalPaymentAmount: Math.round(totalPaymentAmount * 100) / 100,
      eligiblePaymentsCount,
      eligiblePaymentAmount: Math.round(eligiblePaymentAmount * 100) / 100,
      totalCashbackCredited: Math.round(totalCashbackCredited * 100) / 100,
      expectedCashbackAmount: Math.round(expectedCashbackAmount * 100) / 100,
      differenceAmount,
      reconciledBy,
      status: Math.abs(differenceAmount) < 0.01 ? 'MATCHED' : 'DISCREPANCY_DETECTED',
      payments,
      cashbackRecords
    };

    // Save to DB
    const saved = await reconciliationRepository.upsertReconciliationRecord({
      year: y,
      month: m,
      totalPaymentsCount: summary.totalPaymentsCount,
      totalPaymentAmount: summary.totalPaymentAmount,
      eligiblePaymentsCount: summary.eligiblePaymentsCount,
      eligiblePaymentAmount: summary.eligiblePaymentAmount,
      totalCashbackCredited: summary.totalCashbackCredited,
      expectedCashbackAmount: summary.expectedCashbackAmount,
      differenceAmount: summary.differenceAmount,
      reconciledBy
    });

    return {
      record: saved,
      details: summary
    };
  }

  async exportCsv(year, month) {
    const report = await this.generateMonthlyReconciliation(year, month);
    const payments = report.details.payments;

    const headers = [
      'Payment Ref',
      'Date & Time',
      'Student Name',
      'Student ID',
      'Merchant Name',
      'Merchant Code',
      'Amount (INR)',
      'Cashback Credited (INR)',
      'Status'
    ];

    const rows = payments.map((p) => {
      const studentName = p.wallet?.student?.user?.fullName || 'N/A';
      const studentId = p.wallet?.student?.studentIdCard || 'N/A';
      const merchantName = p.merchant?.name || 'N/A';
      const merchantCode = p.merchant?.merchantCode || 'N/A';
      const date = new Date(p.createdAt).toISOString();
      return [
        `"${p.paymentRef}"`,
        `"${date}"`,
        `"${studentName}"`,
        `"${studentId}"`,
        `"${merchantName}"`,
        `"${merchantCode}"`,
        Number(p.amount).toFixed(2),
        Number(p.cashbackAmount).toFixed(2),
        p.status
      ].join(',');
    });

    // Summary lines at bottom
    const summaryRows = [
      '',
      `"--- RECONCILIATION SUMMARY FOR ${month}/${year} ---"`,
      `"Total Transactions",${report.details.totalPaymentsCount}`,
      `"Total Payment Amount (INR)",${report.details.totalPaymentAmount}`,
      `"Eligible Payments Count",${report.details.eligiblePaymentsCount}`,
      `"Eligible Payments Amount (INR)",${report.details.eligiblePaymentAmount}`,
      `"Total Cashback Credited (INR)",${report.details.totalCashbackCredited}`,
      `"Expected Cashback (INR)",${report.details.expectedCashbackAmount}`,
      `"Discrepancy (INR)",${report.details.differenceAmount}`,
      `"Reconciliation Status",${report.details.status}`
    ];

    return [headers.join(','), ...rows, ...summaryRows].join('\n');
  }

  async getSavedReconciliations() {
    return reconciliationRepository.getSavedReconciliations();
  }

  async getAdminDashboardStats() {
    return reconciliationRepository.getDashboardStats();
  }

  async getStudentDashboardStats(studentId, walletId) {
    return reconciliationRepository.getStudentDashboardStats(studentId, walletId);
  }
}

export default new ReconciliationService();
