import "dotenv/config";
import { JWT_SECRET } from "../config/env.js";
import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { checkStrength } from "../helpers/passwordValidation.js";
import { generateOtp } from "../helpers/codeGenerator.js";
import { sendRegistrationCode } from "../helpers/mailSender.js";
import { clearTokenCookie, setTokenCookie } from "../helpers/cookies.js";
import type { Request, Response } from "express";
import type { LoginRequest, OtpToken } from "../types/auth.js";
import type { User } from "../types/user.js";

export async function registerUser(req: Request, res: Response) {
    const client = await pool.connect();
    try {
        const { name, email, password, confirmPassword }: User = req.body;
        const purpose = "registration";

        // USER VALIDATION... I PRAY THIS WORKS =
        if (!email || !name || !password) return res.status(400).json({ error: "Required fields are missing." });

        const checkPassword = checkStrength(password);
        if (checkPassword?.error) return res.status(400).json(checkPassword.error);
        if (password !== confirmPassword) return res.status(400).json({ error: "Passwords do not match." });

        await client.query("BEGIN");

        const checkEmail = await client.query(
            "SELECT id FROM users WHERE email = $1", [email]
        );
        if (checkEmail.rows.length > 0) {
            await client.query("ROLLBACK");
            return res.status(409).json({ error: "Email already used. Please login or use another email." });
        }

        // DATA CREATION ========================
        const hashedPassword = await bcrypt.hash(password, 10);
        const { rows } = await client.query(
            "INSERT INTO users(email, name, password) VALUES($1, $2, $3) RETURNING id, email", [email, name, hashedPassword]
        );

        await client.query("COMMIT")
        // TOKEN GENERATION =====================
        const token = jwt.sign(
            {
                userId: rows[0]?.id,
                purpose: purpose
            },
            JWT_SECRET,
            { expiresIn: "10m" }
        )

        setTokenCookie(res, "registrationToken", token, (10 * 60 * 1000))

        return res.status(201).json({
            message: "User created successfully.",
            email: rows[0]?.email
        })
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Couldn't create user:", err);
        res.status(500).json({ error: "Internal server error. Try again." });
    } finally {
        client.release();
    }
}

export async function sendOtp(req: Request, res: Response) {
    const client = await pool.connect();
    try {
        const { registrationToken, continueRegistration } = req.cookies;

        let sessionToken: string;
        let expectedPurpose: "registration" | "continue-registration";
        let sessionCookie: "registrationToken" | "continueRegistration";

        if (typeof registrationToken === "string") {
            sessionToken = registrationToken
            expectedPurpose = "registration";
            sessionCookie = "registrationToken";
        } else if (typeof continueRegistration === "string") {
            sessionToken = continueRegistration;
            expectedPurpose = "continue-registration";
            sessionCookie = "continueRegistration";
        } else {
            console.log("Registration cookie:", req.cookies.registrationToken);
            return res.status(401).json({
                error: "No active registration session."
            });
        };

        const code = generateOtp();

        let decoded
        try {
            decoded = jwt.verify(sessionToken, JWT_SECRET);
        } catch {
            return res.status(401).json({
                error: "Invalid or expired session. Please register again."
            })
        }

        if (
            typeof decoded !== "object" ||
            decoded === null ||
            typeof decoded.userId !== "number" ||
            typeof decoded.purpose !== "string"
        ) return res.status(401).json({ error: "Invalid session token." });

        const { userId, purpose } = decoded;
        if (purpose !== expectedPurpose) return res.status(403).json({ error: "Invalid registration session." });

        const recent = await client.query(
            "SELECT created_at FROM codes WHERE user_id = $1 AND purpose = $2 ORDER BY created_at DESC LIMIT 1", [userId, purpose]
        );
        if (recent.rows.length > 0) {
            const secondsSince = (Date.now() - new Date(recent.rows[0].created_at).getTime()) / 1000;
            if (secondsSince < 30) {
                return res.status(429).json({ error: `Please wait for ${30 - secondsSince} before requesting another code.` });
            }
        }

        await client.query("BEGIN");
        await client.query("DELETE FROM codes WHERE user_id = $1 AND purpose = $2", [userId, purpose]);
        await client.query(
            "INSERT INTO codes(user_id, code, purpose, created_at, expires_at) VALUES($1, $2, $3, NOW(), NOW() + '10m')",
            [userId, code, purpose]
        );
        await client.query("COMMIT");

        const userRes = await client.query("SELECT email FROM users WHERE id = $1", [userId]);
        const email = userRes.rows[0]?.email;
        if (!email) return res.status(404).json({ error: "User not found." });

        try {
            await sendRegistrationCode(email, code)
        } catch (err) {
            console.error("OTP email failed to send:", err);
            return res.status(502).json({ error: "Couldn't send code. Please try again. " })
        }

        const token = jwt.sign(
            {
                userId: userId,
                purpose: purpose
            },
            JWT_SECRET,
            { expiresIn: "10m" }
        );

        setTokenCookie(res, "otpToken", token, (10 * 60 * 1000))
        clearTokenCookie(res, sessionCookie);

        return res.status(200).json({ message: "Code sent successfully" })
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Couldn't send OTP:", err);
        res.status(500).json({ error: "Internal server error. Try again" })
    } finally {
        client.release();
    }
}

export async function otpVerification(req: Request, res: Response) {
    const client = await pool.connect();
    try {
        const { otp }: OtpToken = req.body;
        const { otpToken } = req.cookies;
        let decoded
        try {
            decoded = jwt.verify(otpToken, JWT_SECRET);
        } catch {
            return res.status(401).json({ error: "Invalid or expired token. Please try again." })
        }
        if (
            typeof decoded !== "object" ||
            decoded === null ||
            typeof decoded.userId !== "number" ||
            typeof decoded.purpose !== "string"
        ) return res.status(401).json({ error: "Invalid registration token." });

        const { userId, purpose } = decoded;
        if (purpose !== "continue-registration" && purpose !== "registration") return res.status(403).json({ error: "Invalid session token." })

        await client.query("BEGIN");
        const hasUser = await client.query(
            "SELECT * FROM users WHERE id = $1", [userId]
        );
        if (hasUser.rows.length <= 0) return res.status(404).json({ error: "User not found" });
        const { rows } = await client.query(
            "SELECT * FROM codes WHERE user_id = $1 AND code = $2 AND expires_at > NOW() AND purpose = $3 AND used = false", [userId, otp, purpose]
        )
        if (rows.length <= 0) return res.status(409).json({ error: "Inavlid OTP. Try again." });

        await client.query(
            "UPDATE codes SET used = true WHERE user_id = $1 AND code = $2 AND expires_at > NOW()", [userId, otp]
        );
        await client.query(
            `UPDATE users SET status = 'verified' WHERE id = $1`, [userId]
        );

        await client.query("COMMIT");

        const token = jwt.sign(
            { userId: userId },
            JWT_SECRET,
            { expiresIn: "10m" }
        );

        clearTokenCookie(res, otpToken);
        setTokenCookie(res, "loginToken", token, (10 * 60 * 1000))

        res.status(200).json({ message: "OTP verified successfully" })

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Error validating OTP at:", err);
        res.status(500).json({ error: "Internal server error" })
    } finally {
        client.release();
    }
}

export async function loginUser(req: Request, res: Response) {
    try {
        const { email, password }: LoginRequest = req.body;
        const purpose = "access";
        if (!email || !password) return res.status(400).json({ error: "Required fields are missing." });

        const { rows } = await pool.query(
            "SELECT * FROM users WHERE email = $1", [email]
        );
        if (rows.length <= 0) return res.status(401).json({ error: "Incorrect password. Please try again." });
        const user = rows[0];

        const userPassword = user.password;
        const isPassword = await bcrypt.compare(password, userPassword);
        if (!isPassword) return res.status(401).json({ error: "Incorrect password" });

        const status = user.status;
        if (status === "unverified") {
            const token = jwt.sign(
                {
                    userId: user.id,
                    purpose: "continue-registration"
                },
                JWT_SECRET,
                { expiresIn: "10m" }
            );

            setTokenCookie(res, "continueRegistration", token, (10 * 60 * 1000));

            return res.status(401).json({
                error: "Account verification required.",
                code: "ACCOUNT_UNVERIFIED",
                email: user.email
            })
        }

        const userName = user.name;

        const token = jwt.sign(
            {
                userId: user.id,
                purpose: purpose
            },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        clearTokenCookie(res, "loginToken");
        setTokenCookie(res, "accessToken", token, (24 * 60 * 60 * 1000))

        return res.status(200).json({
            message: `Welcome back ${userName}`,
            name: userName
        });
    } catch (err) {
        console.error("Couldn't login user:", err);
        res.status(500).json({ error: "Internal server error." })
    }
}

export async function authenticateMe(req: Request, res: Response) {

    class User {
        id: number;
        name: string;
        email: string
        constructor(id: number, name: string, email: string) {
            this.id = id;
            this.name = name;
            this.email = email
        };
    };

    try {
        const userId = req.user!.userId;
        const { rows } = await pool.query(
            "SELECT * from users WHERE id = $1", [userId]
        );
        if (rows.length <= 0) return res.status(404).json({ error: "User not found." });
        const user = rows[0];
        const currentUser = new User(
            user.id,
            user.name,
            user.email
        );
        return res.status(200).json({ currentUser });
    } catch (err) {
        console.error("Error verifying user:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
}