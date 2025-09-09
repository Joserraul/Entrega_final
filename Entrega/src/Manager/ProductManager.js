import { ProductModel } from "../Models/ProductModel.js";

class ProductManager {
  constructor(model) {
    this.model = model;
  }

  getAll = async () => {
    try {
      return await this.model.find();
    } catch (error) {
      throw new Error(error);
    }
  };

  getById = async (id) => {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw new Error(error);
    }
  };

  create = async (userData) => {
    try {
      return await this.model.create(userData);
    } catch (error) {
      throw new Error(error);
    }
  };

  update = async (id, userData) => {
    try {
      return await this.model.findByIdAndUpdate(id, userData, { new: true });
    } catch (error) {
      throw new Error(error);
    }
  };

  delete = async (id) => {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(error);
    }
  };
}

export const ProductManager = new ProductManager(ProductModel);