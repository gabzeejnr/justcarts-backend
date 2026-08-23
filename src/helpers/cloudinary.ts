import cloudinary from "../config/cloudinary.js";
import { changeDot } from "../utils/functions.js";

export async function uploadToCloudinary(url: string, imageUrl: string) {
    await cloudinary.uploader.upload(imageUrl, {
        folder: `justcarts/products/${changeDot(url)}`
    })
}