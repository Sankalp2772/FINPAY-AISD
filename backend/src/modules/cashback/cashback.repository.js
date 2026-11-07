import prisma from '../../config/prisma.js';

class CashbackRepository {
  async getAllRules() {
    return prisma.cashbackRule.findMany({
      include: {
        merchant: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findActiveRuleForMerchant(merchantId) {
    // Check specific merchant rule first, then global rule (merchantId is null)
    const specific = await prisma.cashbackRule.findFirst({
      where: {
        merchantId: Number(merchantId),
        status: 'ACTIVE'
      }
    });

    if (specific) return specific;

    return prisma.cashbackRule.findFirst({
      where: {
        merchantId: null,
        status: 'ACTIVE'
      }
    });
  }

  async createRule(data) {
    return prisma.cashbackRule.create({
      data: {
        title: data.title,
        merchantId: data.merchantId ? Number(data.merchantId) : null,
        percentage: Number(data.percentage),
        minSpend: Number(data.minSpend || 0),
        maxCashback: data.maxCashback ? Number(data.maxCashback) : null,
        status: data.status || 'ACTIVE'
      },
      include: {
        merchant: true
      }
    });
  }

  async updateRule(id, data) {
    const updatePayload = { ...data };
    if (updatePayload.merchantId !== undefined) {
      updatePayload.merchantId = updatePayload.merchantId ? Number(updatePayload.merchantId) : null;
    }
    if (updatePayload.percentage !== undefined) {
      updatePayload.percentage = Number(updatePayload.percentage);
    }
    if (updatePayload.minSpend !== undefined) {
      updatePayload.minSpend = Number(updatePayload.minSpend);
    }
    if (updatePayload.maxCashback !== undefined) {
      updatePayload.maxCashback = updatePayload.maxCashback ? Number(updatePayload.maxCashback) : null;
    }

    return prisma.cashbackRule.update({
      where: { id: Number(id) },
      data: updatePayload,
      include: {
        merchant: true
      }
    });
  }

  async getCashbackHistoryByWallet(walletId) {
    return prisma.cashbackRecord.findMany({
      where: { walletId: Number(walletId) },
      include: {
        paymentTransaction: {
          include: {
            merchant: true
          }
        }
      },
      orderBy: { creditedAt: 'desc' }
    });
  }

  async getAllCashbackHistory() {
    return prisma.cashbackRecord.findMany({
      include: {
        paymentTransaction: {
          include: {
            merchant: true
          }
        },
        wallet: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: { creditedAt: 'desc' }
    });
  }

  async findRecordByPaymentId(paymentTransactionId) {
    return prisma.cashbackRecord.findUnique({
      where: { paymentTransactionId: Number(paymentTransactionId) }
    });
  }
}

export default new CashbackRepository();
