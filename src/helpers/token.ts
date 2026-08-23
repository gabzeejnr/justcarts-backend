import type { Request } from "express";

export function getTokenFromHeader(req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return "";
    const token = authHeader.split(" ")[1]
    if(typeof token !== "string") return String(token)
    return token
}