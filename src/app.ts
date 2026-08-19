import express from "express";
import cors from "cors";
// import axios from "axios";
// import pool from "./config/db.ts";
import productRoutes from "./routes/product.routes.ts";
import { snatch } from "./controllers/products.ts";
import categoryRoutes from "./routes/category.routes.ts"
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

/* app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const productData = await pool.query(
            "SELECT *, i.image_url FROM products p INNER JOIN images i ON p.id = i.product_id WHERE p.id = $1", [id]
        );
        if (productData.rows.length === 0) return res.status(404).json({ error: "Product not found" })
        const product = productData.rows[0];
        res.status(200).json(product)
    } catch (err) {
        console.error("Couldn't fetch product data:", err);
        res.status(500).json({ error: "Internal server error" })
    }
}); */

app.use("/api", categoryRoutes)

app.get("/api/do_not_snatch", snatch)


app.listen(PORT, () => {
    console.log("Running on port", PORT)
    console.log(`// ================================================================================================
// ENDPOINT =======================================================================================
// ================================================================================================`)
})