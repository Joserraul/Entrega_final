import { productModel } from "../Models/ProductModel.js";

class ProductManager {
  constructor(model) {
    this.model = model;
  }

  // ✅ MÉTODO PARA API (con paginación)
async getAllWithPagination(req, res) {
  try {
    // ✅ Obtener parámetros directamente de req.query
    const { limit = 10, page = 1, sort, query } = req.query;
    
    // Construir filtro
    const filter = {};
    
    if (query) {
      try {
        const parsedQuery = JSON.parse(query);
        if (parsedQuery.category) {
          filter.category = parsedQuery.category;
        }
        if (parsedQuery.stock !== undefined) {
          if (parsedQuery.stock === true) {
            filter.stock = { $gt: 0 };
          } else if (parsedQuery.stock === false) {
            filter.stock = { $eq: 0 };
          }
        }
      } catch (error) {
        // ✅ Usar res.status directamente
        return res.status(400).json({ status: 'error', message: 'Invalid query format' });
      }
    }

    // Validar números
    const limitNum = parseInt(limit) || 10;
    const pageNum = parseInt(page) || 1;
    const skip = (pageNum - 1) * limitNum;

    // Opciones de sort
    const sortOptions = {};
    if (sort === 'asc') sortOptions.price = 1;
    if (sort === 'desc') sortOptions.price = -1;

    // Ejecutar consulta
    const products = await this.model
      .find(filter)
      .limit(limitNum)
      .skip(skip)
      .sort(sortOptions)
      .lean();

    // Calcular paginación
    const totalDocs = await this.model.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limitNum);
    
    const hasPrevPage = pageNum > 1;
    const hasNextPage = pageNum < totalPages;
    
    // ✅ Generar links SIN usar req.get (porque no tenemos el objeto req completo)
    const baseUrl = `/productMO`; // URL base relativa
    
    const prevLink = hasPrevPage 
      ? `${baseUrl}?limit=${limit}&page=${pageNum - 1}${sort ? `&sort=${sort}` : ''}${query ? `&query=${encodeURIComponent(query)}` : ''}`
      : null;
    
    const nextLink = hasNextPage 
      ? `${baseUrl}?limit=${limit}&page=${pageNum + 1}${sort ? `&sort=${sort}` : ''}${query ? `&query=${encodeURIComponent(query)}` : ''}`
      : null;

    // ✅ Devolver los datos en lugar de usar res.json()
    return {
      status: 'success',
      payload: products,
      totalPages,
      prevPage: hasPrevPage ? pageNum - 1 : null,
      nextPage: hasNextPage ? pageNum + 1 : null,
      page: pageNum,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink
    };

  } catch (error) {
    console.error('Error in getAllWithPagination:', error);
    // ✅ Lanzar error en lugar de usar res.status()
    throw new Error(error.message);
  }
}

  // ✅ MÉTODO SIMPLE (para Socket.io y vistas)
  async getAllSimple() {
    try {
      return await this.model.find().lean();
    } catch (error) {
      throw new Error(error);
    }
  }

  // ✅ MÉTODO GET BY ID
  async getById(req, res) {
    try {
      const product = await this.model.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ MÉTODO ADD PRODUCT
  async addProduct(req, res) {
    try {
      const newProduct = await this.model.create(req.body);
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ MÉTODO UPDATE PRODUCT
  async updateProduct(req, res) {
    try {
      const updatedProduct = await this.model.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ MÉTODO DELETE
  async delete(req, res) {
    try {
      const deletedProduct = await this.model.findByIdAndDelete(req.params.id);
      if (!deletedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

// ✅ Exportar UNA sola instancia
export const managerproduct = new ProductManager(productModel);