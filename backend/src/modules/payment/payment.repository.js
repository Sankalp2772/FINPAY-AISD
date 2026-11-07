import prisma from '../../config/prisma.js';

class PaymentRepository {
  async executePaymentTransaction({
    walletId,
    merchantId,
    paymentAmount,
    merchantName,
    cashback
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch wallet
      const wallet = await tx.wallet.findUnique({
        where: { id: Number(walletId) }
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.status !== 'ACTIVE') {
        throw new Error('Wallet is inactive or frozen');
      }

      const currentBalance = Number(wallet.balance);
      if (currentBalance < paymentAmount) {
        throw new Error('Insufficient wallet balance to complete payment');
      }

      // 2. Generate references
      const paymentRef = 'PAY-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);

      // 3. Deduct wallet for payment
      const balanceAfterPayment = currentBalance - paymentAmount;

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfterPayment }
      });

      // 4. Create payment transaction record
      const payment = await tx.paymentTransaction.create({
        data: {
          paymentRef,
          walletId: wallet.id,
          merchantId: Number(merchantId),
          amount: paymentAmount,
          status: 'SUCCESS',
          cashbackAmount: cashback && cashback.eligible ? cashback.amount : 0.00
        }
      });

      // 5. Create wallet debit transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          transactionRef: 'TXN-DBT-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900),
          type: 'PAYMENT',
          direction: 'DEBIT',
          amount: paymentAmount,
          balanceBefore: currentBalance,
          balanceAfter: balanceAfterPayment,
          description: `Payment to ${merchantName}`,
          referenceEntity: 'PAYMENT',
          referenceId: payment.id
        }
      });

      let cashbackRecord = null;
      let finalBalance = balanceAfterPayment;

      // 6. Handle Cashback if eligible
      if (cashback && cashback.eligible && cashback.amount > 0) {
        finalBalance = balanceAfterPayment + cashback.amount;

        // Credit wallet
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: finalBalance }
        });

        // Create cashback record
        cashbackRecord = await tx.cashbackRecord.create({
          data: {
            paymentTransactionId: payment.id,
            walletId: wallet.id,
            amount: cashback.amount,
            percentageApplied: cashback.percentage
          }
        });

        // Create wallet credit transaction for cashback
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            transactionRef: 'TXN-CSH-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900),
            type: 'CASHBACK',
            direction: 'CREDIT',
            amount: cashback.amount,
            balanceBefore: balanceAfterPayment,
            balanceAfter: finalBalance,
            description: `Cashback reward (${cashback.percentage}%) for payment to ${merchantName}`,
            referenceEntity: 'CASHBACK',
            referenceId: cashbackRecord.id
          }
        });
      }

      return {
        payment,
        cashbackRecord,
        newBalance: finalBalance
      };
    });
  }

  async getPaymentsByWallet(walletId, limit = 50) {
    return prisma.paymentTransaction.findMany({
      where: { walletId: Number(walletId) },
      include: {
        merchant: {
          include: { category: true }
        },
        cashbackRecord: true
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });
  }

  async getAllPayments(limit = 100) {
    return prisma.paymentTransaction.findMany({
      include: {
        merchant: {
          include: { category: true }
        },
        wallet: {
          include: {
            student: {
              include: { user: true }
            }
          }
        },
        cashbackRecord: true
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });
  }
}

export default new PaymentRepository();
