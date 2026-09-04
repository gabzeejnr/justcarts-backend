import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
})

export default transporter;

// export const gmail = google.gmail({
//     version: "v1",
//     auth: oauth2Client
// })