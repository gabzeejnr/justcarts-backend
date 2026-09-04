import "dotenv/config";
import { Router } from "express";
import { sendMail } from "../helpers/mailSender.js";
import type { Request, Response } from "express";

const router = Router();

router.get("/test-email", async (req: Request, res: Response) => {
    try {
        await sendMail(
            "evelyndodowei4@gmail.com",
            "JustCarts Gmail API Test",
            "The Gmail API is working!"
        );

        return res.status(200).json({
            message: "Email sent successfully."
        });
    } catch (err) {
        console.error("Email error:", err);

        return res.status(500).json({
            error: "Failed to send email."
        });
    };
});

export default router;