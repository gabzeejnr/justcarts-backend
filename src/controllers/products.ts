import pool from "../config/db.ts";
import axios from "axios";
import type { Request, Response } from "express";
import type { DummyJson } from "../types/products.ts";

export async function getAllProducts(req: Request, res: Response) {
    try {
        const productData = await pool.query(
            "SELECT *, i.image_url FROM products p INNER JOIN images i ON p.id = i.product_id"
        )
        const products = productData.rows;
        if (products.length === 0) return res.status(404).json({ error: "Couldn't get resources" });

        return res.status(200).json(products);
    } catch (error) {
        console.error("Couldn't fetch products at: ", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function snatch(req: Request, res: Response) {
    const limit = 30;
    let skip = 0;
    const allProducts: DummyJson[] = [];

    try {
        while (true) {
            const { data } = await axios.get(`https://dummyjson.com/products?limit=${limit}&skip=${skip}`);
            const products = data.products;

            for (const product of products) {
                const { title, description, category, price, rating,
                    warrantyInformation, shippingInformation,
                    availabilityStatus, returnPolicy,
                    minimumOrderQuantity, images }: DummyJson = product;

                const productResult = await pool.query(
                    `INSERT INTO products (name, description, category, price, rating, warranty_info, shipping_info, availability, return_policy, minimum_orderQuantity)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id`,
                    [title, description, category, price, rating, warrantyInformation, shippingInformation, availabilityStatus, returnPolicy, minimumOrderQuantity]
                );
                const productId = productResult.rows[0].id;

                for (const imageUrl of images) {
                    await pool.query(
                        "INSERT INTO images (product_id, image_url) VALUES($1, $2)",
                        [productId, imageUrl]
                    );
                }

                console.log(`Snatched ${skip + products.indexOf(product) + 1} out of ${data.total} from https://dummyjson.com/products`)
            }
            allProducts.push(...products);
            skip += limit;

            if (skip >= data.total) {
                break;
            }
        }

        res.status(200).json(allProducts)
    } catch (err) {
        console.error("There was an error:", err);
        res.status(500).json({ error: "Internal server error" })
    }
}