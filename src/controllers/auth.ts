import "dotenv/config";
import { JWT_SECRET } from "../config/env.js";
import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { checkStrength } from "../helpers/passwordValidation.js";
import { generateOtp } from "../helpers/codeGenerator.js";
// import { sendRegistrationCode } from "../helpers/mailSender.js";
import type { Request, Response } from "express";
import type { RegisterUser, OtpToken } from "../types/auth.js";
// import { getTokenFromHeader } from "../helpers/token.js";

export async function registerUser(req: Request, res: Response) {
    const client = await pool.connect()
    try {

        const { name, email, password, confirmPassword }: RegisterUser = req.body;
        const purpose = "registration";

        // USER VALIDATION... I PRAY THIS WORKS =
        if (!email || !name || !password) return res.status(400).json({ error: "Required fields are missing." });

        const checkPassword = checkStrength(password);
        if (checkPassword.error) return res.status(400).json(checkPassword.error);
        if (password !== confirmPassword) return res.status(400).json({ error: "Passwords do not match." });

        await client.query("BEGIN");

        const checkEmail = await client.query(
            "SELECT id FROM users WHERE email = $1", [email]
        );
        if (checkEmail.rows.length > 0) {
            await client.query("ROLLBACK");
            return res.status(409).json({ error: "Email already used. Please use another email." });
        }

        // DATA CREATION ========================
        const hashedPassword = await bcrypt.hash(password, 10);
        const { rows } = await client.query(
            "INSERT INTO users(email, name, password) VALUES($1, $2, $3) RETURNING id, email", [email, name, hashedPassword]
        );

        // OTP CODE =============================
        const code = generateOtp();
        await client.query(
            "INSERT INTO codes(user_id, code, purpose, created_at, expires_at) VALUES($1, $2, $3, NOW(), NOW() + '10m')", [rows[0].id, code, purpose]
        );
        await client.query("COMMIT");

        // TOKEN GENERATION =====================
        const regToken = jwt.sign(
            {
                userId: rows[0].id,
                purpose: purpose
            },
            JWT_SECRET,
            { expiresIn: "10m" }
        )

        return res.status(201).json({
            message: "User created successfully.",
            token: regToken,
            email: rows[0].email
        })
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Couldn't create user:", err);
        res.status(500).json({ error: "Internal server error. Try again." });
    } finally {
        client.release();
    }
}

// export async function sendOtp(req: Request, res: Response) {
//     const client = await pool.connect();
//     try {
//         const regToken = getTokenFromHeader(req);
//         let payload: { userId: number; purpose: string };
//         try {
//             payload = jwt.verify(regToken, JWT_SECRET)
//         } catch {
//             return res.status(401).json({ error: "Invalid or expired session. Please register again." });
//         }
//         const { userId, purpose } = payload;

//         const recent = await client.query(
//             "SELECT created_at FROM codes WHERE user_id = $1 AND purpose = $2 ORDER BY created_at DESC LIMIT 1", [userId, purpose]
//         )
//         if (recent.rows.length > 0) {
//             const secondsSince = (Date.now() - new Date(recent.rows[0].created_at).getTime()) / 1000;
//             if (secondsSince < 30) {
//                 return res.status(429).json({ error: "Please wait before requesting another code." });
//             }
//         }

//         const code = generateOtp();

//         await client.query("BEGIN");
//         await client.query("DELETE FROM codes WHERE user_id = $1 AND purpose = $2", [userId, purpose]);
//         await client.query(
//             "INSERT INTO codes(user_id, code, purpose, expires_at) VALUES($1, $2, $3, NOW() + '10m')",
//             [userId, code, purpose]
//         );
//         await client.query("COMMIT");

//         const userRes = await client.query("SELECT email FROM users WHERE id = $1", [userId]);
//         const email = userRes.rows[0]?.email;
//         if (!email) return res.status(404).json({ error: "User not found." });

//         try {
//             await sendRegistrationCode(email, code)
//         } catch (err) {
//             console.error("OTP email failed to send:", err);
//             return res.status(502).json({ error: "Couldn't send code. Please try again. " })
//         }

//         return res.status(200).json({ message: "Code sent successfully" })
//     } catch (err) {
//         await client.query("ROLLBACK");
//         console.error("Couldn't send OTP:", err);
//         res.status(500).json({ error: "Internal server error. Try again" })
//     } finally {
//         client.release();
//     }
// }

export async function otpVerification(req: Request, res: Response) {
    try {
        const { otp }: OtpToken = req.body;
        console.log(otp);
    } catch (err) {
        console.error("Error validating OTP at:", err);
        res.status(500).json({ error: "Internal server error" })
    }
}