import { cartModel } from "../Models/CartModel.js";
import { productModel } from "../Models/ProductModel.js";

class CartManager {
  constructor(model) {
    this.model = model;
  }

  // ✅ CREATE - Crear nuevo carrito
  async createCart(req, res) {
    try {
      const newCart = await this.model.create({ products: [] });
      res.status(201).json(newCart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ GET BY ID - Obtener carrito con populate
  async getCartById(req, res) {
    try {
      const cart = await this.model.findById(req.params.cid)
        .populate('products.product'); // ✅ POPULATE para productos completos
      
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ ADD PRODUCT - Agregar producto al carrito
  async addProductToCart(req, res) {
    try {
      const { cid, pid } = req.params;
      
      // Verificar si el producto existe
      const product = await productModel.findById(pid);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Buscar carrito
      const cart = await this.model.findById(cid);
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      // Verificar si el producto ya está en el carrito
      const productIndex = cart.products.findIndex(
        item => item.product.toString() === pid
      );

      if (productIndex !== -1) {
        // Incrementar cantidad
        cart.products[productIndex].quantity += 1;
      } else {
        // Agregar nuevo producto
        cart.products.push({ product: pid, quantity: 1 });
      }

      await cart.save();
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ DELETE PRODUCT - Eliminar producto del carrito (PUNTO 2)
  async deleteProductFromCart(req, res) {
    try {
      const { cid, pid } = req.params;
      
      const cart = await this.model.findById(cid);
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      // Filtrar el producto a eliminar
      cart.products = cart.products.filter(
        item => item.product.toString() !== pid
      );

      await cart.save();
      res.json({ message: 'Product removed from cart', cart });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ UPDATE CART - Actualizar todo el carrito (PUNTO 2)
  async updateCart(req, res) {
    try {
      const { cid } = req.params;
      const { products } = req.body;

      // Validar formato de products
      if (!Array.isArray(products)) {
        return res.status(400).json({ error: 'Products must be an array' });
      }

      const cart = await this.model.findByIdAndUpdate(
        cid,
        { products },
        { new: true, runValidators: true }
      ).populate('products.product');

      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ UPDATE PRODUCT QUANTITY - Actualizar cantidad (PUNTO 2)
  async updateProductQuantity(req, res) {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: 'Quantity must be at least 1' });
      }

      const cart = await this.model.findById(cid);
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      const productItem = cart.products.find(
        item => item.product.toString() === pid
      );

      if (!productItem) {
        return res.status(404).json({ error: 'Product not found in cart' });
      }

      productItem.quantity = quantity;
      await cart.save();

      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ DELETE ALL PRODUCTS - Vaciar carrito (PUNTO 2)
  async clearCart(req, res) {
    try {
      const { cid } = req.params;

      const cart = await this.model.findByIdAndUpdate(
        cid,
        { products: [] },
        { new: true }
      );

      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      res.json({ message: 'Cart cleared successfully', cart });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

// ✅ Exportar instancia
export const cartManager = new CartManager(cartModel);