import "dotenv/config";
import gmail from "../config/gmail.js";

export async function sendMail(
    to: string,
    subject: string,
    body: string
) {
    const message = [
        `From: ${process.env.GOOGLE_EMAIL}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        "Content-Type: text/plain; charset=utf-8",
        "",
        body
    ].join("\r\n");

    const encodedMessage = Buffer
        .from(message)
        .toString("base64url");

    const response = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: encodedMessage
        }
    });

    return response.data
}

export async function sendRegistrationCode(email: string, code: string) {
    try {
        await sendMail(
            email,
            "Your registration confirmation code",
            `Your confirmation code is ${code}.
        This code expires in 10 minutes.`
        )
    } catch (err) {
        throw err
    }
}