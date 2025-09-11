import { Router } from "express";
import { managerproduct } from '../Controllers/controllersProducts.js';

const router = Router();

router.get ("/homeMO", (req, res) => {
  res.render("homeMO");
});

router.get("/productMO", (req, res) => {
  res.render("productMO");
});

router.get("/cartMO", (req, res) => {
  res.render("cartMO");
});

router.get('/products', async (req, res) => {
  try {
    const { limit, page, sort, query } = req.query;

    // Usa el método que ya tienes en tu controller de productos
    const result = await managerproduct.getAllWithPagination({
      query: { limit, page, sort, query }
    }, {
      json: (data) => data
    });

    // Renderiza la vista 'productsMO' con los datos
    res.render('productsMO', {
      products: result.payload,
      pagination: result
    });
  } catch (error) {
    res.status(500).render('error', { error: 'Error al cargar productos' });
  }
});



export default router;
