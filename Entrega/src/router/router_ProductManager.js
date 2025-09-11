import { Router } from "express";
import { managerproduct } from "../Controllers/controllersProducts.js";

const router = Router();

// ✅ Usa el método con paginación para la API
router.get("/", managerproduct.getAllWithPagination.bind(managerproduct));
router.get("/:id", managerproduct.getById.bind(managerproduct));
router.post("/", managerproduct.addProduct.bind(managerproduct));
router.put("/:id", managerproduct.updateProduct.bind(managerproduct));
router.delete("/:id", managerproduct.delete.bind(managerproduct));

export default router;