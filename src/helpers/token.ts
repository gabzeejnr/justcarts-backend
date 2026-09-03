import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import type { Request, Response } from "express";

export function getTokenFromHeader(req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return "";
    const token = authHeader.split(" ")[1]
    if (typeof token !== "string") return String(token)
    return token
}

export function decodeToken(res: Response, token: any,) {
    let decoded: string | JwtPayload
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch {
        return res.status(401).json({ error: "Invalid or expired token. Please try again." })
    }
    if (
        typeof decoded === "string" ||
        typeof decoded.userId !== "string" ||
        typeof decoded.purpose !== "string"
    ) return res.status(401).json({ error: "Invalid registration token." });
}