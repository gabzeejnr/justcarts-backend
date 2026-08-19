import { Router } from "express";
import { getAllProducts } from "../controllers/products.ts";

const router = Router();

router.get("/products", getAllProducts)

export default router;