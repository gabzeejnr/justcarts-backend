import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pool from "./config/db.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { JWT_SECRET } from "./config/env.js";
import userAuth from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js"
import { snatch } from "./controllers/products.controller.js";
import { seed } from "./controllers/admin.controller.js";
import type { Request, Response } from "express";

const app = express();
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://justcarts.vercel.app"
    ],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const gabriel = await pool.query("SELECT * FROM users WHERE email = 'gabrieldodowei@gmail.com'");
console.log(gabriel)
console.log(await pool.query("SELECT * FROM codes"))
 

console.log(`// ================================================================================================
// RUNNING ========================================================================================
// ================================================================================================`)

app.get("/", (req: Request, res: Response) => {
    res.send("Root directory... Working??")
});

app.use("/api", userAuth);

app.get("/api/users", async (req: Request, res: Response) => {
    const { rows } = await pool.query("SELECT * FROM users");

    res.status(200).json(rows)
})

app.use("/api", productRoutes);

app.use("/api", categoryRoutes);

app.get("/api/query/:query", async (req: Request, res: Response) => {
    console.log("Is this running?")
    try {
        const { query } = req.params;
        console.log(query);
        const { rows } = await pool.query(
            "SELECT *, i.image FROM products p INNER JOIN images i ON i.product_id = p.id WHERE ANY(p.category) = $1", [[query]]
        );
        console.log(query);
        res.status(200).json(rows);
    } catch (err) {
        console.error("Error at:", err);
        res.status(500).json({ error: "Internal server error" });
    };
});

app.get("/admin/api/seed", seed)

app.get("/api/do_not_snatch", snatch);

app.listen(PORT, () => {
    console.log("Running on port", PORT)
    console.log(`// ================================================================================================
// ENDPOINT =======================================================================================
// ================================================================================================`)
});