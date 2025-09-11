import { Router } from "express";
import { cartManager } from "../Controllers/controllersCart.js";

const router = Router();

router.post("/", cartManager.createCart.bind(cartManager));
router.get("/:cid", cartManager.getCartById.bind(cartManager));
router.post("/:cid/product/:pid", cartManager.addProductToCart.bind(cartManager));
router.delete("/:cid/products/:pid", cartManager.deleteProductFromCart.bind(cartManager));
router.put("/:cid", cartManager.updateCart.bind(cartManager));
router.put("/:cid/products/:pid", cartManager.updateProductQuantity.bind(cartManager));
router.delete("/:cid", cartManager.clearCart.bind(cartManager));

export default router;