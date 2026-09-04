import "dotenv/config";
import { env } from "node:process";
import type { Response } from "express";

export function setTokenCookie(
    res: Response,
    tokenName: string,
    token: string,
    maxAge?: number
) {
    res.cookie(tokenName, token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "none",
        maxAge
    })
}

export function clearTokenCookie(
    res: Response,
    tokenName: string
) {
    res.clearCookie(tokenName, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "none"
    })
}