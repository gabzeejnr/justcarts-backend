import "dotenv/config";
import { env } from "node:process";
import transporter from "../config/email.js";

export async function sendRegistrationCode(email: string, code: string) {
    await transporter.sendMail({
        from: env.EMAIL_USER,
        to: email,
        subject: "Your registration confirmation code",
        text: `Your confirmation code is ${code}.
    This code expires in 10 minutes.`
    })
    console.log("Email sent")
}