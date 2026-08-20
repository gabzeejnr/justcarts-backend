import pool from "../config/db.js";
import { products } from "../data/products.js";

async function createTables() {

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(
            `CREATE TABLE products (
                id SERIAL PRIMARY KEY,
        		snatch_id INTEGER,
                source VARCHAR(50) NOT NULL DEFAULT 'gabzeejnr',
                name VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                price NUMERIC(12, 2),
		        currency TEXT DEFAULT 'USD',
                rating NUMERIC NOT NULL DEFAULT 0,
                warranty_info VARCHAR(100),
                shipping_info VARCHAR(100),
                availability TEXT,
                return_policy TEXT,
                minimum_orderQuantity NUMERIC
            )`
        )
        /* if (!productsTable) {
            console.error("Couldn't create products table");
            return;
        } */
        console.log("Products table created");

        await client.query(
            `CREATE TABLE images (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL REFERENCES products (id),
                image_url TEXT
            )`
        )

        await client.query("COMMIT")
        console.log("Images table created")
    } catch (err) {
        await client.query("ROLLBACK")
        console.error("Couldn't create TABLES");
        throw err;
    } finally {
        client.release();
    }
}

async function seed() {
    await createTables();
    const client = await pool.connect();
    try {
        for (const [index, product] of products.entries()) {
            await client.query("BEGIN");
            try {
                const { name, description, category, price, imageUrl } = product;

                const check = await client.query(
                    "SELECT * FROM products WHERE name = $1", [name]
                )
                if (check.rows.length !== 0) {
                    console.error(`Product ${name} found in database`);
                    await client.query("ROLLBACK");
                    continue;
                }
                const {rows} = await pool.query(
                    "INSERT INTO products (name, description, category, price) VALUES($1, $2, $3, $4) RETURNING id",
                    [name, description, category, price]
                );
                const productId = rows[0].id

                await pool.query(
                    "INSERT INTO images (product_id, image_url) VALUES ($1, $2) RETURNING id", [productId, imageUrl]
                );

                await client.query("COMMIT")
                console.log(`${index + 1} out of ${products.length} items uploaded`)
            } catch (err) {
                await client.query("ROLLBACK")
                throw err;
            }
        };
        console.log("Data seeded successfully🚀🚀🚀")
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        client.release()
        console.log("Seeding done...");
        await pool.end();
    }
}

seed();