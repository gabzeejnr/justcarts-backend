import { Router } from "express";
import { registerUser, otpVerification } from "../controllers/auth.js";

const router = Router();

router.post("/auth/register", registerUser);
router.post("/auth/otp_verification", otpVerification)

export default router;