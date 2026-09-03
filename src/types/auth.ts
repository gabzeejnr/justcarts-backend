import type { JwtPayload } from "jsonwebtoken"

export interface OtpToken {
    otp: string,
    otpToken: string | JwtPayload
}

export interface LoginRequest {
    email: string,
    password: string
}