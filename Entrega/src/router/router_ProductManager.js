import { Router } from "express";
import { ProductManager } from "../Controllers/controllersProducts.js";

const router = Router();

router.get("/", ProductManager.getAll);
router.get("/:id", ProductManager.getById);
router.post("/", ProductManager.addProduct);
router.put("/:id", ProductManager.updateProduct);
router.delete("/:id", ProductManager.delete);

export default router;