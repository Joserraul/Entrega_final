

// Middleware para manejar errores

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Tenemos un problema con el server mi lindo 😅' });
};
