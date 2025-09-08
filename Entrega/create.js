import { initMongoDB } from "./conection.js";
import { ProductModel } from "./schema.js";

const createProduct = async (product) => {
  try {
    return await ProductModel.create(product);
  } catch (error) {
    throw new Error(error);
  }
};

const newProduct = {
  title: "Product 1",
  description: "Description of Product 1",
  price: 100,
  stock: 50
};

const newProduct2 = {
  title: "Probando el codigo",
  description: "vamos a ver donde se crea",
  price: 1,
  stock: 100
};

const test = async () => {
  try {
    initMongoDB()
      .then(() => console.log("Connected to MongoDB"))
      .catch((err) => console.log(err));

    await createProduct(newProduct2);
    console.log("Product created");
  } catch (error) {
    console.log(error);
  }
};

test();