export const productValidator = (req, res, next) => {
  console.log(req.body);

  const product = req.body;
  if (!product || !product.title || !product.description || !product.price) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  return next();
};
