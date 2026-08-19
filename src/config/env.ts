import "dotenv/config";
import { env } from "node:process"

function requireEnv(env: any): string {
    if (!env) throw new Error("env not found");
    return env;
}

const DB_PORT = Number(requireEnv(env.DB_HOST));

export { DB_PORT }