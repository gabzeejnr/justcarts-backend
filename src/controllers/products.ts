import pool from "../config/db.js";
import axios from "axios";
import type { Request, Response } from "express";
import type { DummyJson } from "../types/products.ts";
import { changeDot } from "../utils/functions.js";

export async function getAllProducts(req: Request, res: Response) {
    try {
        const { rows } = await pool.query(
            "SELECT *, i.image_url FROM products p INNER JOIN images i ON p.id = i.product_id"
        )
        if (rows.length === 0) return res.status(404).json({ error: "Couldn't get resources" });

        return res.status(200).json(rows);
    } catch (error) {
        console.error("Couldn't fetch products at: ", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getProduct(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            "SELECT *, i.image_url FROM products p INNER JOIN images i ON p.id = i.product_id WHERE p.id = $1", [id]
        );
        if (rows.length === 0) return res.status(404).json({ error: "Product not found" })
        const product = rows[0];
        res.status(200).json(product)
    } catch (err) {
        console.error("Couldn't fetch product data:", err);
        res.status(500).json({ error: "Internal server error" })
    }
}

export async function snatch(req: Request, res: Response) {
    const limit = 30;
    let skip = 0;
    const MAX_ITERATIONS = 200;
    let iterations = 0;

    const failures: { snatchId: number | string; reason: string }[] = [];
    let skippedCount = 0;
    let insertedCount = 0;

    try {
        while (true) {
            const url = `https://dummyjson.com/products?limit=${limit}&skip=${skip}`
            const { data } = await axios.get(url);
            if (typeof data.total !== "number" || !Array.isArray(data.products)) {
                throw new Error(`Unexpected response shape from DummyJSON: ${JSON.stringify(data).slice(0, 200)}`);
            }
            const products = data.products;

            for (const [index, product] of products.entries()) {
                const { id, title, description, category,
                    price, rating, warrantyInformation,
                    shippingInformation, availabilityStatus,
                    returnPolicy,
                    minimumOrderQuantity, images
                }: DummyJson = product;

                const client = await pool.connect();

                try {
                    await client.query("BEGIN");

                    const typeId = Number(id);
                    if (Number.isNaN(typeId)) {
                        throw new Error(`Invalid id "${id}" — expected a numeric value`);
                    }

                    const { rows } = await client.query(
                        `INSERT INTO products (source, snatch_id, name, description, category, price, rating, warranty_info, shipping_info, availability, return_policy, minimum_orderQuantity)
                        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                        ON CONFLICT (source, snatch_id) DO NOTHING 
                        RETURNING id`,
                        [changeDot(url), typeId, title, description, category, price, rating, warrantyInformation, shippingInformation, availabilityStatus, returnPolicy, minimumOrderQuantity]
                    );
                    if (rows.length === 0) {
                        console.log(`Skipped ${skip + index + 1} (already exists)`);
                        await client.query("COMMIT");
                        skippedCount++;
                        continue;
                    }
                    const productId = rows[0].id;

                    if (Array.isArray(images) && images.length > 0) {
                        await Promise.all(
                            images.map((imageUrl: string) => (
                                client.query(
                                    "INSERT INTO images (product_id, image_url) VALUES ($1, $2)",
                                    [productId, imageUrl]
                                )
                            ))
                        )
                    }

                    await client.query("COMMIT");
                    insertedCount++;
                    console.log(`Snatched ${skip + index + 1} out of ${data.total} from https://dummyjson.com/products`)
                } catch (err) {
                    await client.query("ROLLBACK");
                    const reason = err instanceof Error ? err.message : String(err);
                    console.error(`Failed on product id=${id}: ${reason}`);
                    failures.push({ snatchId: id, reason });
                } finally {
                    client.release();
                }
            }
            skip += limit;
            iterations++;

            if (skip >= data.total) break;
            if (iterations >= MAX_ITERATIONS) {
                throw new Error(`Aborting after ${MAX_ITERATIONS} iterations`);
            }
        }

        res.status(200).json({
            inserted: `${insertedCount} images`,
            skipped: skippedCount > 0 ? `${skippedCount} images` : skippedCount,
            failed: failures.length,
            failures
        })
    } catch (err) {
        console.error("There was an error:", err);
        res.status(500).json({ error: "Internal server error" })
    }
}