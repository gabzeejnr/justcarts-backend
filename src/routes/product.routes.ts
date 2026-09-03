import { Router } from "express";
import { getAllProducts, getProduct } from "../controllers/products.controller.js";

const router = Router();

router.get("/products", getAllProducts);
router.get("/products/:id", getProduct);

export default router;