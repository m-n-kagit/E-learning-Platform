import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const removeLocalFile = async (filePath) => {
  if (!filePath) return;
  const normalizedPath = path.normalize(filePath);

  try {
    await fs.promises.rm(normalizedPath, { force: true, maxRetries: 2, retryDelay: 50 });
  } catch (error) {
    if (error?.code !== "ENOENT") {
      console.error("Failed to delete temporary upload:", error);
    }
  }
};

const uploadCloudinary = async (filePath, options = {}) => {
  try {
    if (!filePath) return null;

    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: options.resource_type || "raw",
      folder: options.folder || "admin-verification-documents",
      public_id: options.public_id,
    });

    console.log("File uploaded to Cloudinary:", response.secure_url);
    await removeLocalFile(filePath);
    return response;
  } catch (error) {
    await removeLocalFile(filePath);
    console.log("Cloudinary upload error:", error);
    return null;
  }
};

export default uploadCloudinary;
