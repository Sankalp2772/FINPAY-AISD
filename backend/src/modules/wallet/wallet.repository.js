import prisma from '../../config/prisma.js';

class WalletRepository {
  async findByStudentId(studentId) {
    return prisma.wallet.findUnique({
      where: { studentId: Number(studentId) },
      include: {
        student: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true }
            }
          }
        }
      }
    });
  }

  async findByUserId(userId) {
    const student = await prisma.student.findUnique({
      where: { userId: Number(userId) },
      include: {
        wallet: true,
        user: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });
    return student ? { ...student.wallet, student } : null;
  }

  async findById(walletId) {
    return prisma.wallet.findUnique({
      where: { id: Number(walletId) }
    });
  }

  async getTransactions(walletId, limit = 50) {
    return prisma.walletTransaction.findMany({
      where: { walletId: Number(walletId) },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });
  }

  async addTopup(walletId, amount, description = 'Academic Demo Top-up') {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: Number(walletId) }
      });
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + Number(amount);

      const updatedWallet = await tx.wallet.update({
        where: { id: Number(walletId) },
        data: {
          balance: balanceAfter
        }
      });

      const txRef = 'TXN-TOP-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900);
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: Number(walletId),
          transactionRef: txRef,
          type: 'TOPUP',
          direction: 'CREDIT',
          amount: Number(amount),
          balanceBefore,
          balanceAfter,
          description
        }
      });

      return { wallet: updatedWallet, transaction };
    });
  }
}

export default new WalletRepository();
