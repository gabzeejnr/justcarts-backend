import express from "express";
import cors from "cors";
// import axios from "axios";
import pool from "./config/db.js";
import productRoutes from "./routes/product.routes.js";
import { snatch } from "./controllers/products.js";
import categoryRoutes from "./routes/category.routes.js"
import type { Request, Response } from "express";
// import type { DummyJson } from "./types/products.ts";

const app = express();
app.use(cors());
app.use(express.json())

const PORT = process.env.PORT || 5000;

console.log(`// ================================================================================================
// RUNNING ========================================================================================
// ================================================================================================`)

app.get("/", (req: Request, res: Response) => {
    res.send("Working??")
})


app.use("/api", productRoutes);

app.use("/api", categoryRoutes);

app.get("/api/categories/:category", async (req: Request, res: Response) => {
    try {
        const { category } = req.params;

        const { rows } = await pool.query(
            "SELECT * FROM products p INNER JOIN images i ON i.product_id = p.id WHERE $1 = ANY(category)", [category]
        );
        if (rows.length === 0) return res.status(404).json({ error: "Couldn't list categories" });

        res.status(200).json(rows)
    } catch (err) {
        console.error("Couldn't get category:", err);
        res.status(500).json({ error: "Internal server error" })
    }
})

app.get("/api/do_not_snatch", snatch)


app.listen(PORT, () => {
    console.log("Running on port", PORT)
    console.log(`// ================================================================================================
// ENDPOINT =======================================================================================
// ================================================================================================`)
})