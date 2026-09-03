import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import type { Request, Response, NextFunction } from "express";

export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { accessToken } = req.cookies;
    if (typeof accessToken !== "string") return res.status(401).json({ error: "Authentication is required." });

    let decoded;
    try {
        decoded = jwt.verify(accessToken, JWT_SECRET)
    } catch {
        return res.status(401).json({ error: "Invalid or expird session." });
    }

    if (typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.userId !== "number" ||
        typeof decoded.purpose !== "string"
    ) {
        return res.status(401).json({ error: "Invalid session token." })
    }

    req.user ={
        userId: decoded.userId,
        purpose: decoded.purpose
    }

    next();
}