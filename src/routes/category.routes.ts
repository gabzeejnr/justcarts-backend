import { Router } from "express";
import { allCategories } from "../controllers/category.js";

const router = Router();

router.get("/categories", allCategories);

export default router;