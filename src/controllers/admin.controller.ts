import pool from "../config/db.js";
import { createTables } from "../seed/seed.js";
import { products } from "../data/products.js";
import type { Request, Response } from "express";

export async function seed(req: Request, res: Response) {
    await createTables();
    const client = await pool.connect();
    try {
        for (const [index, product] of products.entries()) {
            await client.query("BEGIN");
            try {
                const { name, description, category, price, imageUrl } = product;

                const categoryArray = Array.isArray(category)
                    ? category
                    : [category];

                const check = await client.query(
                    "SELECT * FROM products WHERE name = $1", [name]
                )
                if (check.rows.length !== 0) {
                    console.error(`Product ${name} found in database`);
                    await client.query("ROLLBACK");
                    continue;
                }
                const { rows } = await client.query(
                    "INSERT INTO products (name, description, category, price) VALUES($1, $2, $3, $4) RETURNING id",
                    [name, description, categoryArray, price]
                );
                const productId = rows[0].id
                await client.query(
                    "INSERT INTO images (product_id, image) VALUES ($1, $2) RETURNING id", [productId, imageUrl]
                );

                await client.query("COMMIT")
                console.log(`${index + 1} out of ${products.length} items uploaded`)
            } catch (err) {
                await client.query("ROLLBACK")
                throw err;
            }
        }
        console.log("Data seeded successfully🚀🚀🚀")
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        client.release()
        console.log("Seeding done...");
        await pool.end();
    }
}