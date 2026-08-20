import "dotenv/config";
import { Pool } from "pg";
import { DB_PORT } from "./env.js";

const pool = new Pool({
    host: process.env.DB_HOST,
    port: DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PSWRD,
    database: process.env.DB
})

export default pool;