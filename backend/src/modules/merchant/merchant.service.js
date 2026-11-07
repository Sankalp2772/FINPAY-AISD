import merchantRepository from './merchant.repository.js';

class MerchantService {
  async getCategories() {
    return merchantRepository.getAllCategories();
  }

  async createCategory(data) {
    if (!data.name || !data.code) {
      const error = new Error('Category name and code are required');
      error.statusCode = 400;
      throw error;
    }
    return merchantRepository.createCategory(data);
  }

  async getActiveMerchants() {
    return merchantRepository.getAllMerchants({ isActive: true });
  }

  async getAllMerchants() {
    return merchantRepository.getAllMerchants({});
  }

  async getMerchant(id) {
    const merchant = await merchantRepository.getMerchantById(id);
    if (!merchant) {
      const error = new Error('Merchant not found');
      error.statusCode = 404;
      throw error;
    }
    return merchant;
  }

  async createMerchant(data) {
    const { name, categoryId, contactEmail, phone, location } = data;
    if (!name || !categoryId || !contactEmail || !phone || !location) {
      const error = new Error('All merchant fields are required');
      error.statusCode = 400;
      throw error;
    }
    const merchantCode = 'MRC-' + (data.name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'FIN') + '-' + Math.floor(100 + Math.random() * 900);
    return merchantRepository.createMerchant({
      ...data,
      merchantCode
    });
  }

  async updateMerchant(id, data) {
    await this.getMerchant(id);
    return merchantRepository.updateMerchant(id, data);
  }
}

export default new MerchantService();
