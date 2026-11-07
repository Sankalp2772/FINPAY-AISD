import prisma from '../../config/prisma.js';

class ReconciliationRepository {
  async getPaymentsInDateRange(startDate, endDate) {
    return prisma.paymentTransaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'SUCCESS'
      },
      include: {
        merchant: true,
        wallet: {
          include: {
            student: {
              include: { user: true }
            }
          }
        },
        cashbackRecord: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCashbackInDateRange(startDate, endDate) {
    return prisma.cashbackRecord.findMany({
      where: {
        creditedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        paymentTransaction: {
          include: { merchant: true }
        },
        wallet: {
          include: {
            student: {
              include: { user: true }
            }
          }
        }
      },
      orderBy: { creditedAt: 'desc' }
    });
  }

  async upsertReconciliationRecord(data) {
    return prisma.reconciliation.upsert({
      where: {
        year_month: {
          year: data.year,
          month: data.month
        }
      },
      update: {
        totalPaymentsCount: data.totalPaymentsCount,
        totalPaymentAmount: data.totalPaymentAmount,
        eligiblePaymentsCount: data.eligiblePaymentsCount,
        eligiblePaymentAmount: data.eligiblePaymentAmount,
        totalCashbackCredited: data.totalCashbackCredited,
        expectedCashbackAmount: data.expectedCashbackAmount,
        differenceAmount: data.differenceAmount,
        generatedAt: new Date(),
        reconciledBy: data.reconciledBy || 'Admin'
      },
      create: {
        year: data.year,
        month: data.month,
        totalPaymentsCount: data.totalPaymentsCount,
        totalPaymentAmount: data.totalPaymentAmount,
        eligiblePaymentsCount: data.eligiblePaymentsCount,
        eligiblePaymentAmount: data.eligiblePaymentAmount,
        totalCashbackCredited: data.totalCashbackCredited,
        expectedCashbackAmount: data.expectedCashbackAmount,
        differenceAmount: data.differenceAmount,
        reconciledBy: data.reconciledBy || 'Admin'
      }
    });
  }

  async getSavedReconciliations() {
    return prisma.reconciliation.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });
  }

  async getDashboardStats() {
    const totalStudents = await prisma.student.count();
    const totalMerchants = await prisma.merchant.count();
    const paymentsAggregate = await prisma.paymentTransaction.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true, cashbackAmount: true },
      _count: { id: true }
    });

    const recentPayments = await prisma.paymentTransaction.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        merchant: true,
        wallet: {
          include: { student: { include: { user: true } } }
        }
      }
    });

    return {
      totalStudents,
      totalMerchants,
      totalPaymentsCount: paymentsAggregate._count.id || 0,
      totalPaymentVolume: paymentsAggregate._sum.amount ? Number(paymentsAggregate._sum.amount) : 0,
      totalCashbackCredited: paymentsAggregate._sum.cashbackAmount ? Number(paymentsAggregate._sum.cashbackAmount) : 0,
      recentPayments
    };
  }

  async getStudentDashboardStats(studentId, walletId) {
    const wallet = await prisma.wallet.findUnique({
      where: { id: Number(walletId) }
    });

    const paymentsAgg = await prisma.paymentTransaction.aggregate({
      where: { walletId: Number(walletId), status: 'SUCCESS' },
      _sum: { amount: true, cashbackAmount: true },
      _count: { id: true }
    });

    const recentTxns = await prisma.walletTransaction.findMany({
      where: { walletId: Number(walletId) },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return {
      balance: wallet ? Number(wallet.balance) : 0,
      walletNumber: wallet ? wallet.walletNumber : '',
      currency: wallet ? wallet.currency : 'INR',
      totalSpent: paymentsAgg._sum.amount ? Number(paymentsAgg._sum.amount) : 0,
      totalCashbackEarned: paymentsAgg._sum.cashbackAmount ? Number(paymentsAgg._sum.cashbackAmount) : 0,
      paymentsCount: paymentsAgg._count.id || 0,
      recentTransactions: recentTxns
    };
  }
}

export default new ReconciliationRepository();
