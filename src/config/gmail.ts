import "dotenv/config";
import { google } from "googleapis";
import { GOOGLE_REFRESH_TOKEN } from "./env.js";

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
    refresh_token: GOOGLE_REFRESH_TOKEN
});

const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client
});

export default gmail;