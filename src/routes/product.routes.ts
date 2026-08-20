import { Router } from "express";
import { getAllProducts, getProduct } from "../controllers/products.js";

const router = Router();

router.get("/products", getAllProducts);
router.get("/products/:id", getProduct);

export default router;