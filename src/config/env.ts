import "dotenv/config";
import { env } from "node:process"

function requireEnv(env: any): string {
    if (!env) throw new Error("env not found");
    return env;
}

const DB_PORT = Number(requireEnv(env.DB_HOST));
const CLOUDINARY_API_KEY = requireEnv(env.CLOUDINARY_API_KEY);
const CLOUDINARY_API_SECRET = requireEnv(env.CLOUDINARY_API_SECRET);
const CLOUDINARY_CLOUD_NAME = requireEnv(env.CLOUDINARY_CLOUD_NAME);

export {
    DB_PORT, CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
}