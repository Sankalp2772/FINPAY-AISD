import prisma from '../../config/prisma.js';

class AuthRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        student: {
          include: {
            wallet: true
          }
        }
      }
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        student: {
          include: {
            wallet: true
          }
        }
      }
    });
  }

  async createStudentUser({ email, hashedPassword, fullName, studentIdCard, department, semester, phone }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          role: 'STUDENT'
        }
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          studentIdCard,
          department,
          semester,
          phone: phone || null
        }
      });

      const walletNumber = 'FPW' + Date.now().toString().slice(-6) + Math.floor(1000 + Math.random() * 9000);
      const wallet = await tx.wallet.create({
        data: {
          studentId: student.id,
          walletNumber,
          balance: 0.00,
          currency: 'INR'
        }
      });

      return {
        ...user,
        student: {
          ...student,
          wallet
        }
      };
    });
  }
}

export default new AuthRepository();
