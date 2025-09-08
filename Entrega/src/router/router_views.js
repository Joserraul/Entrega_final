import { Router } from "express";

const router = Router();

router.get ("/homeMO", (req, res) => {
  res.render("homeMO");
});

router.get("/productMO", (req, res) => {
  res.render("productMO");
});

export default router;
