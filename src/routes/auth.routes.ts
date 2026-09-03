import { Router } from "express";
import {
    loginUser, registerUser, sendOtp, otpVerification,
    authenticateMe
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/auth/register", registerUser);
router.post("/auth/send_registration_code", sendOtp);
router.post("/auth/otp_verification", otpVerification)
router.post("/auth/login", loginUser);
router.get("/auth/me", authenticate, authenticateMe);

export default router;