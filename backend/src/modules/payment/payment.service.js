import paymentRepository from './payment.repository.js';
import merchantService from '../merchant/merchant.service.js';
import cashbackService from '../cashback/cashback.service.js';
import walletRepository from '../wallet/wallet.repository.js';

class PaymentService {
  async processPayment({ userId, merchantId, amount }) {
    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      const error = new Error('Invalid payment amount. Must be greater than zero.');
      error.statusCode = 400;
      throw error;
    }

    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      const error = new Error('Wallet not found for student.');
      error.statusCode = 404;
      throw error;
    }

    const merchant = await merchantService.getMerchant(merchantId);
    if (!merchant || !merchant.isActive) {
      const error = new Error('Selected merchant is inactive or invalid.');
      error.statusCode = 400;
      throw error;
    }

    if (Number(wallet.balance) < paymentAmount) {
      const error = new Error(`Insufficient wallet balance. Current: ₹${wallet.balance}, Required: ₹${paymentAmount.toFixed(2)}`);
      error.statusCode = 400;
      throw error;
    }

    // Calculate Cashback via Cashback Service
    const cashbackCalc = await cashbackService.calculateCashback(merchant.id, paymentAmount);

    // Execute atomic payment + wallet deduction + cashback credit in repository
    const result = await paymentRepository.executePaymentTransaction({
      walletId: wallet.id,
      merchantId: merchant.id,
      paymentAmount,
      merchantName: merchant.name,
      cashback: cashbackCalc
    });

    return {
      success: true,
      payment: result.payment,
      cashback: result.cashbackRecord,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        code: merchant.merchantCode
      },
      newBalance: result.newBalance
    };
  }

  async getStudentPayments(userId, limit) {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) return [];
    return paymentRepository.getPaymentsByWallet(wallet.id, limit);
  }

  async getAllPayments(limit) {
    return paymentRepository.getAllPayments(limit);
  }
}

export default new PaymentService();
