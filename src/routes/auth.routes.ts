import { Router } from "express";
import {
    loginUser, registerUser, sendOtp, otpVerification,
    authenticateMe
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/send_registration_code", sendOtp);
router.post("/otp_verification", otpVerification)
router.post("/login", loginUser);
router.get("/me", authenticate, authenticateMe);

export default router;