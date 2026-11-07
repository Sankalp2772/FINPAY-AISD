import prisma from '../../config/prisma.js';

class MerchantRepository {
  async getAllCategories() {
    return prisma.merchantCategory.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async createCategory(data) {
    return prisma.merchantCategory.create({
      data
    });
  }

  async getAllMerchants(filter = {}) {
    return prisma.merchant.findMany({
      where: filter,
      include: {
        category: true,
        cashbackRules: {
          where: { status: 'ACTIVE' }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getMerchantById(id) {
    return prisma.merchant.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        cashbackRules: true
      }
    });
  }

  async createMerchant(data) {
    return prisma.merchant.create({
      data: {
        ...data,
        categoryId: Number(data.categoryId)
      },
      include: {
        category: true
      }
    });
  }

  async updateMerchant(id, data) {
    const updateData = { ...data };
    if (updateData.categoryId) {
      updateData.categoryId = Number(updateData.categoryId);
    }
    return prisma.merchant.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        category: true
      }
    });
  }
}

export default new MerchantRepository();
