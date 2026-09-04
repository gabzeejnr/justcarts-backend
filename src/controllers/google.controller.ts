import "dotenv/config";
import { google } from "googleapis";
import type { Request, Response } from "express";

export function googleAuth(req: Request, res: Response) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/gmail.send"
        ]
    });
    res.redirect(authUrl)
}

export async function googleCallback(req: Request, res: Response) {
    try {
        const code = req.query.code as string;
        if (!code) return res.status(400).json({ error: "Authorization code is missing." });

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        const { tokens } = await oauth2Client.getToken(code);

        console.log(tokens);

        return res.json({ message: "Google authorization successful." });
    } catch (err) {
        console.error("Google OAuth error:", err);

        return res.status(500).json({ error: "Google authorization failed." });
    }
}