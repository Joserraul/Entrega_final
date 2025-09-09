import express from 'express';
import productRouter from './src/router/router_ProductManager.js';
// import cartRouter from './src/router/router_Cart.js';
import router_views from './src/router/router_views.js';
import handlebars from 'express-handlebars';
import { __dirname } from './utils.js';
import { errorHandler } from './src/Middleware/error_Handdlerbars.js';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';
import { initMongoDB } from "./conection.js";
import { managerproduct } from './src/Controllers/controllersProducts.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server);

// Ya tienes la instancia lista: managerproduct

app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use('/api/products', productRouter);

app.set('views', './src/views');
app.set('view engine', 'handlebars');

app.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await managerproduct.getAll();
    res.render('realTimeProducts', { products });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar los productos');
  }
});

io.on('connection', (socket) => {
  console.log('Crack se conectó');

  socket.on('requestProducts', async () => {
    try {
      const products = await managerproduct.getAll();
      socket.emit('productsUpdated', products);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('addProduct', async (productData) => {
    try {
      await managerproduct.addProduct(productData);
      const products = await managerproduct.getAll();
      io.emit('productsUpdated', products);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('deleteProduct', async (productId) => {
    try {
      await managerproduct.delete(productId);
      const products = await managerproduct.getAll();
      io.emit('productsUpdated', products);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Crack cliente se desconectó');
  });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

app.engine('handlebars', handlebars.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'src/views/layouts'),
  partialsDir: path.join(__dirname, 'src/views/partials')
}));

app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'handlebars');

// Si quieres usar el router de carts, descomenta la siguiente línea:
// app.use('/api/carts', cartRouter);

app.use('/api/products', productRouter);
app.use('/', router_views);

app.use((req, res) => {
  res.status(404).json({ error: 'Bro y la ruta? 😅' });
});

app.use(errorHandler);

initMongoDB()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

server.listen(8080, () => console.log(`Aqui estamos corriendo en el puerto 8080`));