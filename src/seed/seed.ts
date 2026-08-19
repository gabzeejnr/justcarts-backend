import pool from "../config/db.ts";
import { products } from "../data/products.ts";

async function seed() {
    try {
        for (const product of products) {
            const { name, description, category, price, imageUrl } = product;

            const productData = await pool.query(
                "INSERT INTO products (name, description, category, price) VALUES($1, $2, $3, $4) RETURNING id",
                [name, description, category, price]
            );
            const productId = productData.rows[0].id

            await pool.query(
                "INSERT INTO images (product_id, image_url) VALUES ($1, $2) RETURNING id", [productId, imageUrl]
            );

            console.log(`${products.indexOf(product) + 1} out of ${products.length} items uploaded`)
        }
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        console.log("Data seeded successfully🚀🚀🚀");
        await pool.end()
    }
}

seed();