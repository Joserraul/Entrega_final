import express from 'express';
import productRouter from './src/router/router_ProductManager.js';

// Agrega estas importaciones
import cartRouter from './src/router/router_Cart.js';
import { cartManager } from './src/Controllers/controllersCart.js';

import router_views from './src/router/router_views.js';
import handlebars from 'express-handlebars';
import { __dirname } from './utils.js';
import { errorHandler } from './src/Middleware/error_Handdlerbars.js';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';
import { initMongoDB } from "./conection.js";
import { managerproduct } from './src/Controllers/controllersProducts.js';
import mongoose from 'mongoose';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server);

// Middleware para pasar io a las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});


app.use('/api/carts', cartRouter);

app.get('/productMO', async (req, res) => {
  try {
    // ✅ Pasar el objeto req completo de Express
    const result = await managerproduct.getAllWithPagination(req, res);
    
    // Renderizar la vista con datos REALES
    res.render('productMO', {
      products: result.payload,       // Productos de MongoDB
      pagination: result             // Datos de paginación
    });
  } catch (error) {
    console.error('Error loading products:', error);
    // ✅ Renderizar error simple sin vista "error"
    res.status(500).send(`
      <html>
        <body>
          <h1>Error al cargar productos</h1>
          <p>${error.message}</p>
          <a href="/productMO">Volver a productos</a>
        </body>
      </html>
    `);
  }
});


app.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await cartManager.getCartById({
            params: { cid: req.params.cid }
        }, {
            json: (data) => data,
            status: (code) => ({ 
                json: (data) => {
                    if (code !== 200) throw new Error(data.error);
                    return data;
                }
            })
        });
        
        res.render('CartMO', { cart });
    } catch (error) {
        console.error('Error loading cart:', error);
        res.status(500).send(`
            <html>
                <body>
                    <h1>Error al cargar el carrito</h1>
                    <p>${error.message}</p>
                    <a href="/productMO">Volver a productos</a>
                </body>
            </html>
        `);
    }
});

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'src/views/layouts'),
  partialsDir: path.join(__dirname, 'src/views/partials'),
  helpers: {
    // Helper para multiplicar precio por cantidad
    multiply: (a, b) => a * b,
    
    // Helper para calcular totales
    calculateTotals: function(products) {
      const subtotal = products.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const shipping = subtotal > 0 ? 5000 : 0;
      const total = subtotal + shipping;
      
      return {
        subtotal: subtotal.toLocaleString(),
        shipping: shipping.toLocaleString(),
        total: total.toLocaleString()
      };
    }
  }
}));

app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'handlebars');

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

// Rutas
app.use('/api/products', productRouter);
app.use('/', router_views);

app.use('/api/carts', cartRouter);


// Agrega esta ruta en tu server.js
app.get('/productMO', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    
    // Usar el método con paginación que ya creamos
    const result = await managerproduct.getAllWithPagination({
      query: { limit, page, sort, query }
    }, {
      json: (data) => data
    });

    // Renderizar la vista productMO con los datos reales
    res.render('productMO', {
      products: result.payload,
      pagination: result,
      cartId: req.cartId || null
    });
  } catch (error) {
    console.error('Error loading products:', error);
    res.status(500).render('error', { error: 'Error al cargar productos' });
  }
});

// Socket.io events (ACTUALIZADO)
io.on('connection', (socket) => {
  console.log('✅ Cliente conectado');

  socket.on('requestProducts', async () => {
    try {
      // ✅ Usa el método simple para Socket.io
      const products = await managerproduct.getAllSimple();
      socket.emit('productsUpdated', products);
    } catch (error) {
      console.error('Error en requestProducts:', error);
      socket.emit('error', error.message);
    }
  });

  socket.on('addProduct', async (productData) => {
    try {
      // ✅ Crear producto usando el método addProduct
      await managerproduct.addProduct({
        body: productData
      }, {
        json: (product) => product,
        status: (code) => ({
          json: (data) => {
            if (code !== 201) throw new Error(data.error);
          }
        })
      });

      // ✅ Emitir actualización con todos los productos
      const products = await managerproduct.getAllSimple();
      io.emit('productsUpdated', products);
    } catch (error) {
      console.error('Error en addProduct:', error);
      socket.emit('error', error.message);
    }
  });

  socket.on('deleteProduct', async (productId) => {
    try {
      // ✅ Eliminar producto usando el método delete
      await managerproduct.delete({
        params: { id: productId }
      }, {
        json: (result) => result,
        status: (code) => ({
          json: (data) => {
            if (code !== 200) throw new Error(data.error);
          }
        })
      });

      // ✅ Emitir actualización con todos los productos
      const products = await managerproduct.getAllSimple();
      io.emit('productsUpdated', products);
    } catch (error) {
      console.error('Error en deleteProduct:', error);
      socket.emit('error', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado');
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores
app.use(errorHandler);

// Inicializar MongoDB
initMongoDB()
  .then(() => {
    console.log("📊 Database name:", mongoose.connection.db.databaseName);
    console.log("📊 Collections:", mongoose.connection.db.collections);
  })
  .catch((err) => console.log(err));

// Iniciar servidor
server.listen(8080, () => {
  console.log('🚀 Server running on port 8080');
  console.log('📝 API Products: http://localhost:8080/api/products');
  console.log('👀 RealTime Products: http://localhost:8080/realtimeproducts');
});