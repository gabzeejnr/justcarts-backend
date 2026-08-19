import { Router } from "express";
import { listCategories } from "../controllers/category.ts";

const router = Router();

router.get("/category", listCategories);

export default router;