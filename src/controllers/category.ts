import pool from "../config/db.js";
import type { Request, Response } from "express";

export async function allCategories(req: Request, res: Response) {
    try {
        const { rows } = await pool.query(
            "SELECT DISTINCT unnest(category) category FROM products ORDER BY category ASC"
        )
        res.status(200).json({
            data: rows.map(row => row.category),
            length: rows.length
        })
    } catch (err) {
        console.error("Couldn't get categories:", err);
        res.status(500).json({ error: "Internal server error" })
    }
}

/* export async function getCategory(req: Request, res: Response) {
    // const id = req.params.id
    try {
        const { rows } = await pool.query(
            "SELECT DISTINCT category FROM products ORDER BY category ASC"
        )
        if (rows.length === 0) return res.status(404).json({ error: "Couldn't list categories" });

        res.status(200).json(rows.map(row => row.category))
    } catch (err) {
        console.error("Couldn't get category:", err);
        res.status(500).json({ error: "Internal server error" })
    }
} */