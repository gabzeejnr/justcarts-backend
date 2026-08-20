import pool from "../config/db.js"

/* interface Pool {
    rows: rows[]
} */

interface rows {
    category: string
}

async function test() {
    const { rows } = await pool.query(
        "SELECT DISTINCT unnest(category) category FROM products"
    )
    // console.log(rows.map(row => row.category))
    return ({categories: rows.map(row => row.category),
        length: rows.length
    });

}
console.log(await test())