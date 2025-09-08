import fs from 'fs/promises';
import path from 'path';

/**
 * Manager para manejar carritos de compras
 * @class CartManager
 */

class CartManager {
  constructor(filepath, productManager) {
    this.path = path.resolve(filepath);
    this.carts = [];
    this.productManager = productManager;
    this.iniciar();
  }


/**
 * Esto implementa la creacion del archivo JSON si no existe, y carga los carritos desde el archivo.
 * @method iniciar
 */

  async iniciar() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      this.carts = JSON.parse(data || '[]');
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.carts = [];
        await this.guardado();
      } else {
        throw error;
      }
    }
  }

  /**
   * Guarda los carritos en el archivo JSON.
   * @method guardado
   */

  async guardado() {
    await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2));
  }

/**
 * utiliza el metodo para crear un carrito nuevo, asignando un ID y un array de productos vacio.
 * @method crearCarrito
 * @returns {Object} Nuevo carrito creado
 */

  async crearCarrito() {
  try {
    const nuevoCarrito = {
      id: this.carts.length > 0 ? Math.max(...this.carts.map(c => c.id)) + 1 : 1,
      products: []
    };
    this.carts.push(nuevoCarrito);
    await this.guardado();
    return nuevoCarrito;
  } catch (error) {
    console.error('Error al crear carrito:', error);
    throw error;
  }
}

  /**
   * Lista todos los carritos.
   * @method listaCarts
   * @returns {Array} Lista de carritos
   */

  async listaCarts() {
    return this.carts;
  }

  /**
   * Agrega un producto al carrito especificado por su ID.
   * @method agregarProducto
   * @param {number} cid - ID del carrito
   * @param {number} pid - ID del producto
   * @returns {Object} Carrito actualizado
   */

  async agregarProducto(cid, pid) {
    try {
      const producto = await this.productManager.Buscarproducto(pid);

      if (producto.stock <= 0) {
        throw new Error(`Bro, no hay stock ${pid}😅`);
      }

      const cartIndex = this.carts.findIndex(c => c.id === cid);
      if (cartIndex === -1) {
        throw new Error(`Bro, no existe el carrito con id ${cid} 😅`);
      }

      const productIndex = this.carts[cartIndex].products.findIndex(p => p.id === pid);

      if (productIndex !== -1) {
        const nuevaCantidad = this.carts[cartIndex].products[productIndex].quantity + 1;
        if (producto.stock < nuevaCantidad) {
          throw new Error(`Bro, no hay suficiente stock para el producto ${pid} 😅`);
        }
        this.carts[cartIndex].products[productIndex].quantity += 1;
      } else {
        this.carts[cartIndex].products.push({ id: pid, quantity: 1 });
      }

      await this.guardado();
      return this.carts[cartIndex];
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      throw error;
    }
  }

  /**
   * Finaliza la compra del carrito especificado por su ID, me parecio necesario debido a que se manejan los productos, el stock y se limpia el carrito.
   * @method compraRealizada
   * @param {number} cid - ID del carrito
   * @returns {Object} Resultado de la compra
   */

  async compraRealizada(cid) {
    try {
      const cartIndex = this.carts.findIndex(c => c.id === cid);
      if (cartIndex === -1) {
        throw new Error(`Bro, no existe el carrito con id ${cid} 😅`);
      }

      const cart = this.carts[cartIndex];

      for (const item of cart.products) {
        const producto = await this.productManager.Buscarproducto(item.id);
        if (producto.stock < item.quantity) {
          throw new Error(`Bro, no hay suficiente stock para el producto ${item.id} 😅`);
        }
        await this.productManager.Actualizarproducto(item.id, { 
          stock: producto.stock - item.quantity 
        });
      }

      this.carts[cartIndex].products = [];
      await this.guardado();
      return { success: true, message: 'Compra realizada con éxito' };
    } catch (error) {
      console.error('Error al realizar la compra:', error);
      throw error;
    }
  }
}

export default CartManager;