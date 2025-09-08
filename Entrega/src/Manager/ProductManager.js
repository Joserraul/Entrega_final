import path from 'path';
import fs from 'fs/promises';

/**
 * 
 * @class ProductManager para manejar productos
 * @method iniciar - Inicializa el ProductManager, cargando los productos desde un archivo JSON.
 * @method guardado() - Guarda los productos en el archivo JSON.
 */

class ProductManager {
  constructor(filepath) {
    this.path = path.resolve(filepath);
    this.products = [];
    this.iniciar();
  }

  /**
   * Esto implementa la creacion del archivo JSON si no existe, y carga los productos desde el archivo.
   * @method iniciar
   * @returns {Promise<void>}
   */

  async iniciar () {
    try {
      await fs.access(this.path);
      const data = await fs.readFile(this.path, 'utf-8');
      if (data.trim() === '') {
        this.products = [];
        await this.guardado();
      } else {
        this.products = JSON.parse(data);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.products = [];
        await this.guardado();
      } else {
        console.error('Error al iniciar:', error);
        throw error;
      }
    }
  }

  /**
   * almacena los productos en el archivo JSON.
   * @method guardado
   * @returns {Promise<void>}
   */

  async guardado() {
    try {
      await fs.mkdir(path.dirname(this.path), { recursive: true });
      await fs.writeFile(this.path, JSON.stringify(this.products, null, 2));
    } catch (error) {
      console.error('Error al guardar:', error);
      throw error;
    }
  }

  /**
   *  este metodo agrega un nuevo producto al ProductManager.
   * @method agregarproducto
   * @param {*} producto 
   * @returns {Promise<Object>} Nuevo producto agregado
   * @throws {Error} Si faltan campos obligatorios o si el código del producto ya existe
   
   */

  async agregarproducto(producto) {
    if (!producto.title || !producto.code) {
      throw new Error('Bro necesitamos el título y el código del producto 😅');
    }
    if (this.products.some(prod => prod.code === producto.code)) {
      throw new Error('Bro, el código del producto ya existe 😒');
    }

    const nuevoproducto = {
      id: this.products.length > 0 ? this.products[this.products.length - 1].id + 1 : 1,
      ...producto,
      timestamp: Date.now()
    };

    this.products.push(nuevoproducto);
    await this.guardado();
    return nuevoproducto;
  }

/**
 * este metodo lista todos los productos del ProductManager para poder visualizarlos.
 * @method listarproductos
 * @returns {Promise<Array>} Lista de productos
 * @throws {Error} Si ocurre un error al leer el archivo JSON
 */


async listarproductos() {
    try {
        const data = await fs.readFile(this.path, 'utf-8');
        const productos = JSON.parse(data || '[]');
        this.products = productos.map(producto => ({
            ...producto,
            id: Number(producto.id)
        }));
        return this.products;
    } catch (error) {
        if (error.code === 'ENOENT') {
            this.products = [];
            await this.guardado();
            return this.products;
        }
        throw error;
    }
}

/**
 * Necesitamos buscar un producto por su ID, para poder visualizarlo.
 * @method Buscarproducto
  * @param {number} id - ID del producto a buscar
  * @returns {Promise<Object>} Producto encontrado
 */

  async Buscarproducto(id) {

    await this.listarproductos();

    const idBuscado = Number(id);

    console.log('[DEBUG] Búsqueda iniciada para ID:', idBuscado);
    console.log('[DEBUG] Productos disponibles:', this.products.map(p => ({id: p.id, type: typeof p.id})));

    const producto = this.products.find(prod => {

        return Number(prod.id) === idBuscado;
    });

    if (!producto) {
        throw new Error(`Producto con ID ${idBuscado} no encontrado. IDs existentes: ${this.products.map(p => p.id)}`);
    }
    console.log('[DEBUG] Producto encontrado:', producto);
    return producto;
}

/**
 * no siempre se va a agregar un producto nuevo, a veces se necesita actualizar un producto existente.
 * @method Actualizarproducto
 * @param {number} id - ID del producto a actualizar
 * @param {Object} Update - Objeto con los cambios a aplicar al producto
  * @returns {Promise<Object>} Producto actualizado
 */ 


async Actualizarproducto(id, Update) {

    await this.listarproductos();


    const index = this.products.findIndex(prod => {
        console.log(`[DEBUG] Buscando índice para ${id} en producto ${prod.id}`);
        return prod.id === id;
    });

    if (index === -1) {
        throw new Error(`ID ${id} no encontrado. IDs existentes: ${this.products.map(p => p.id)}`);
    }


    const camposPermitidos = ['title', 'description', 'price', 'thumbnail', 'code', 'stock'];
    const cambios = {};

    Object.keys(Update).forEach(key => {
        if (camposPermitidos.includes(key)) {
            cambios[key] = Update[key];
        }
    });

    this.products[index] = {
        ...this.products[index],
        ...cambios,
        id
    };

    await this.guardado();

    return this.products[index];
}

/**
 * eliminamos un producto por su ID, para poder eliminarlo de la lista de productos.
 * @method Borrarproducto
 * @param {number} id - ID del producto a eliminar
 * @returns {Promise<Object>} Producto eliminado
 * @throws {Error} Si el ID no existe o si ocurre un error al guardar los cambios
 */

async Borrarproducto(id) {
    try {
        await this.listarproductos();

        const idABorrar = Number(id);
        console.log('vamos a borrar ID:', idABorrar);

        const index = this.products.findIndex(prod => {

            return Number(prod.id) === idABorrar;
        });

        if (index === -1) {
            throw new Error(`carck! ${idABorrar} no existe. Productos que estan disponibles son: ${this.products.map(p => p.id)}`);
        }

        const [eliminado] = this.products.splice(index, 1);
        await this.guardado();

        console.log('eliminado:', eliminado);
        return eliminado;

    } catch (error) {
        throw error;
    }
}
}


export default ProductManager;