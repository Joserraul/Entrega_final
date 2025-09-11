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

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'src/views/layouts'),
  partialsDir: path.join(__dirname, 'src/views/partials')
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

// Ruta para realtimeproducts (ACTUALIZADA)
app.get('/realtimeproducts', async (req, res) => {
  try {
    // ✅ Usa el método simple para obtener todos los productos
    const products = await managerproduct.getAllSimple();
    res.render('realTimeProducts', { products });
  } catch (error) {
    console.error('Error en realtimeproducts:', error);
    res.status(500).send('Error al cargar los productos');
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