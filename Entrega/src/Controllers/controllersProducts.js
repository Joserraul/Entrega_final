import { productModel } from "../Models/ProductModel.js";

class ProductManager {
  constructor(model) {
    this.model = model;
  }

  async getAll() {
    return await this.model.find();
  }

  async getById(id) {
    return await this.model.findById(id);
  }

  async addProduct(producto) {
    return await this.model.create(producto);
  }

  async updateProduct(id, update) {
    return await this.model.findByIdAndUpdate(id, update, { new: true });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }
}

export const managerproduct = new ProductManager(productModel);