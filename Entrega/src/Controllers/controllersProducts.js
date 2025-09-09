import { ProductModel } from "../Models/ProductModel.js";

class ProductManager {
  constructor(ProductModel) {
    this.model = ProductModel;
    this.products = [];
    this.getAll();
  }

  /**
   * Esto implementa la creacion del archivo JSON si no existe, y carga los productos desde el archivo.
   * @method getAll
   * @returns {Promise<void>}
   */

  async getAll () {
    try {
      await fs.access(this.model);
      const data = await fs.readFile(this.model, 'utf-8');
      if (data.trim() === '') {
        this.products = [];
        await this.saved();
      } else {
        this.products = JSON.parse(data);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.products = [];
        await this.saved();
      } else {
        console.error('Error al iniciar:', error);
        throw error;
      }
    }
  }

  getById(id) {
    try {
      return this.products.find(prod => prod.id === id);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * almacena los productos en el archivo JSON.
   * @method saved
   * @returns {Promise<void>}
   */

  async saved() {
    try {
      await fs.mkdir(path.dirname(this.model), { recursive: true });
      await fs.writeFile(this.model, JSON.stringify(this.products, null, 2));
    } catch (error) {
      console.error('Error al guardar:', error);
      throw error;
    }
  }

  /**
   *  este metodo agrega un nuevo producto al ProductManager.
   * @method addProduct
   * @param {*} producto
   * @returns {Promise<Object>} Nuevo producto agregado
   * @throws {Error} Si faltan campos obligatorios o si el código del producto ya existe
   
   */

  async addProduct(producto) {
    if (!producto.title || !producto.code) {
      throw new Error('Bro necesitamos el título y el código del producto 😅');
    }
    if (this.products.some(prod => prod.code === producto.code)) {
      throw new Error('Bro, el código del producto ya existe 😒');
    }

    const newProduct = {
      id: this.products.length > 0 ? this.products[this.products.length - 1].id + 1 : 1,
      ...producto,
      timestamp: Date.now()
    };

    this.products.push(newProduct);
    await this.saved();
    return newProduct;
  }

/**
 * este metodo lista todos los productos del ProductManager para poder visualizarlos.
 * @method productlist
 * @returns {Promise<Array>} Lista de productos
 * @throws {Error} Si ocurre un error al leer el archivo JSON
 */


async productlist() {
    try {
        const data = await fs.readFile(this.model, 'utf-8');
        const productos = JSON.parse(data || '[]');
        this.products = productos.map(product => ({
            ...product,
            id: Number(product.id)
        }));
        return this.products;
    } catch (error) {
        if (error.code === 'ENOENT') {
            this.products = [];
            await this.saved();
            return this.products;
        }
        throw error;
    }
}

/**
 * Necesitamos buscar un producto por su ID, para poder visualizarlo.
 * @method searchProduct
 * @param {number} id - ID del producto a buscar
 * @returns {Promise<Object>} Producto encontrado
 */

  async searchProduct(id) {

    await this.productlist();

    const idBuscado = Number(id);

    console.log('[DEBUG] Búsqueda iniciada para ID:', idBuscado);
    console.log('[DEBUG] Productos disponibles:', this.products.map(p => ({id: p.id, type: typeof p.id})));

    const product = this.products.find(prod => {
        return Number(prod.id) === idBuscado;
    });

    if (!product) {
        throw new Error(`Producto con ID ${idBuscado} no encontrado. IDs existentes: ${this.products.map(p => p.id)}`);
    }
    console.log('[DEBUG] Producto encontrado:', product);
    return product;
}

/**
 * no siempre se va a agregar un producto nuevo, a veces se necesita actualizar un producto existente.
 * @method updateProduct
 * @param {number} id - ID del producto a actualizar
 * @param {Object} update - Objeto con los cambios a aplicar al producto
  * @returns {Promise<Object>} Producto actualizado
 */


async updateProduct(id, update) {

    await this.productlist();


    const index = this.products.findIndex(prod => {
        console.log(`[DEBUG] Buscando índice para ${id} en producto ${prod.id}`);
        return prod.id === id;
    });

    if (index === -1) {
        throw new Error(`ID ${id} no encontrado. IDs existentes: ${this.products.map(p => p.id)}`);
    }


    const camposPermitidos = ['title', 'description', 'price', 'thumbnail', 'code', 'stock'];
    const cambios = {};

    Object.keys(update).forEach(key => {
        if (camposPermitidos.includes(key)) {
            cambios[key] = update[key];
        }
    });

    this.products[index] = {
        ...this.products[index],
        ...cambios,
        id
    };

    await this.saved();

    return this.products[index];
}

/**
 * eliminamos un producto por su ID, para poder eliminarlo de la lista de productos.
 * @method delete
 * @param {number} id - ID del producto a eliminar
 * @returns {Promise<Object>} Producto eliminado
 * @throws {Error} Si el ID no existe o si ocurre un error al guardar los cambios
 */

async delete(id) {
    try {
        await this.productlist();

        const idToDelete = Number(id);
        console.log('vamos a borrar ID:', idToDelete);

        const index = this.products.findIndex(prod => {

            return Number(prod.id) === idToDelete;
        });

        if (index === -1) {
            throw new Error(`carck! ${idToDelete} no existe. Productos que estan disponibles son: ${this.products.map(p => p.id)}`);
        }

        const [eliminado] = this.products.splice(index, 1);
        await this.saved();

        console.log('eliminado:', eliminado);
        return eliminado;

    } catch (error) {
        throw error;
    }
}
}


export const ProductManager = new ProductManager(ProductManager);