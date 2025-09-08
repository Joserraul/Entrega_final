import { Router } from "express";

const router = Router();

router.get("/vista1", (req, res) => {
  res.render("vista1");
});


router.get("/realTimeProducts", (req, res) => {
  res.render("realTimeProducts");
});

export default router;
