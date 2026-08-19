import pool from "../config/db.ts";
import type { Request, Response } from "express";

export async function listCategories(req: Request, res: Response) {
    try {
        const dataData = await pool.query(
            "SELECT category FROM products"
        )
        const data = dataData.rows;
        let send = data.map(dat => dat.category)
        send = send.sort((a, b) => a.localeCompare(b));
        const unique = send.filter((i, index) => index === 0 || i !== send[index - 1])
        res.status(200).json(unique)
    } catch (err) {
        console.error("Couldn't get categories:", err);
        res.status(500).json({ error: "Internal server error" })
    }
}