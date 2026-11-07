import walletRepository from './wallet.repository.js';

class WalletService {
  async getWalletByStudentUser(userId) {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      const error = new Error('Wallet not found for this student.');
      error.statusCode = 404;
      throw error;
    }
    return wallet;
  }

  async getWalletTransactions(walletId, limit) {
    return walletRepository.getTransactions(walletId, limit);
  }

  async topupWallet(walletId, amount) {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      const error = new Error('Topup amount must be a positive number.');
      error.statusCode = 400;
      throw error;
    }
    return walletRepository.addTopup(walletId, numericAmount, 'Academic Demo Top-up');
  }

  async getWalletById(walletId) {
    const wallet = await walletRepository.findById(walletId);
    if (!wallet) {
      const error = new Error('Wallet not found.');
      error.statusCode = 404;
      throw error;
    }
    return wallet;
  }
}

export default new WalletService();
