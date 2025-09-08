import { Router } from 'express';
import ProductManager from '../Manager/ProductManager.js';
import { productValidator } from '../Middleware/Validator_Product.js';
import { upload } from '../Middleware/multer.js';


const router = Router();
const productManager = new ProductManager('./src/data/products.json');


router.get('/', async (req, res) => {
  try {
    const products = await productManager.listarproductos();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const product = await productManager.Buscarproducto(parseInt(req.params.id));
    res.json(product);
  } catch (error) {
    res.status(404).json({ error: 'Bro, no encontre ese producto, estas seguro que lo agregaste?🤔' });
  }
});


router.post("/with-image",
  [productValidator, upload.single("image")],
  async (req, res, next) => {
    try {
      const product = await productManager.agregarproducto({
        ...req.body,
        image: req.file?.path || '',
      });
      const products = await productManager.listarproductos();
      if (req.io) {
        req.io.emit('productsUpdated', products);
      }
      
      res.json(product);
    } catch (error) {
      next(error);
    }
  }
);


router.post('/', async (req, res) => {
  try {
    console.log('Body recibido:', req.body);

    const { title, description, price, thumbnail, code, stock } = req.body;

    if (!title || !description || !price || !code) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const newProduct = {
      title,
      description,
      price: parseFloat(price),
      thumbnail: thumbnail || 'sin-imagen',
      code,
      stock: stock ? parseInt(stock) : 0,
      status: true
    };

    const createdProduct = await productManager.agregarproducto(newProduct);

    const products = await productManager.listarproductos();
    if (req.io) {
      req.io.emit('productsUpdated', products);
    }
    
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error en POST /api/products:', error);
    res.status(500).json({
      error: 'Error al agregar el producto',
      details: error.message
    });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const id = Number(req.params.pid);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID debe ser un número' });
    }

    const actualizado = await productManager.Actualizarproducto(id, req.body);

    const products = await productManager.listarproductos();
    if (req.io) {
      req.io.emit('productsUpdated', products);
    }

    res.json({ success: true, product: actualizado });
  } catch (error) {
    console.error('[API ERROR]', error);
    res.status(404).json({ error: error.message });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    const id = Number(req.params.pid);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID debe ser un número' });
    }

    const productoEliminado = await productManager.Borrarproducto(id);

    const products = await productManager.listarproductos();
    if (req.io) {
      req.io.emit('productsUpdated', products);
    }

    res.json({
      success: true,
      message: 'Producto eliminado correctamente',
      deletedProduct: productoEliminado
    });
  } catch (error) {
    console.error('[DELETE ERROR]', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;