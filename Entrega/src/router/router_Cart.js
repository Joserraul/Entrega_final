import { Router } from 'express';
import CartManager from '../Manager/Cart_Manager.js';
import ProductManager from '../Manager/ProductManager.js';

const router = Router();

const productManager = new ProductManager('./src/data/products.json');
const cartManager = new CartManager('./src/data/carts.json', productManager);

router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.crearCarrito();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const carts = await cartManager.listaCarts();
    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/:cid/products/:pid', async (req, res) => {
  try {
    const cid = Number(req.params.cid);
    const pid = Number(req.params.pid);

    const updatedCart = await cartManager.agregarProducto(cid, pid);
    res.json({
      success: true,
      message: `Producto  ${pid} agregado al carrito con ID ${cid}`,
      cart: updatedCart
    });
  } catch (error) {
    if (error.message.includes('no hay disponible')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(404).json({ error: error.message });
  }
}
});

router.post('/:cid/checkout', async (req, res) => {
  try {
    const cid = Number(req.params.cid);
    const purchaseResult = await cartManager.compraRealizada(cid);
    res.json(purchaseResult);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



export default router;