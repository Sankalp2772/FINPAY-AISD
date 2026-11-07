import cashbackRepository from './cashback.repository.js';

class CashbackService {
  async getRules() {
    return cashbackRepository.getAllRules();
  }

  async createRule(data) {
    if (!data.title || data.percentage === undefined) {
      const error = new Error('Rule title and percentage are required');
      error.statusCode = 400;
      throw error;
    }
    return cashbackRepository.createRule(data);
  }

  async updateRule(id, data) {
    return cashbackRepository.updateRule(id, data);
  }

  async calculateCashback(merchantId, amount) {
    const numAmount = Number(amount);
    const rule = await cashbackRepository.findActiveRuleForMerchant(merchantId);

    if (!rule) {
      return { eligible: false, amount: 0, percentage: 0, rule: null };
    }

    if (numAmount < Number(rule.minSpend)) {
      return { eligible: false, amount: 0, percentage: Number(rule.percentage), rule };
    }

    let calculated = (numAmount * Number(rule.percentage)) / 100;
    if (rule.maxCashback && calculated > Number(rule.maxCashback)) {
      calculated = Number(rule.maxCashback);
    }

    // Round to 2 decimal places
    calculated = Math.round(calculated * 100) / 100;

    return {
      eligible: calculated > 0,
      amount: calculated,
      percentage: Number(rule.percentage),
      rule
    };
  }

  async getCashbackHistoryForWallet(walletId) {
    return cashbackRepository.getCashbackHistoryByWallet(walletId);
  }

  async getAllCashbackHistory() {
    return cashbackRepository.getAllCashbackHistory();
  }

  async checkDuplicate(paymentTransactionId) {
    return cashbackRepository.findRecordByPaymentId(paymentTransactionId);
  }
}

export default new CashbackService();
