import { initMongoDB } from "./conection.js";
import { ProductModel } from "./schema.js";

initMongoDB().then(() => console.log("Connected to MongoDB")).catch((err) => console.log(err));

const consulta = async () => {
 const products = await ProductModel.find();
 console.log(products);
};

consulta();
