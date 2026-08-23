import { Router } from "express";
import { allCategories, getCategory } from "../controllers/category.js";

const router = Router();

router.get("/categories", allCategories);
router.get("/category/:category", getCategory)

export default router;