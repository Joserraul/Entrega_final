import { Router } from "express";

const router = Router();

router.get ("/homeMO", (req, res) => {
  res.render("homeMO");
});

router.get("/productMO", (req, res) => {
  res.render("productMO");
});

router.get("/cartMO", (req, res) => {
  res.render("cartMO");
});

export default router;
