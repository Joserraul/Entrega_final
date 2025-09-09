import { Router } from "express";
import { managerproduct } from "../Controllers/controllersProducts.js";

const router = Router();

router.get("/", managerproduct.getAll);
router.get("/:id", managerproduct.getById);
router.post("/", managerproduct.addProduct);
router.put("/:id", managerproduct.updateProduct);
router.delete("/:id", managerproduct.delete);

export default router;