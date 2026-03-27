import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const removeLocalFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const uploadCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      folder: "admin-verification-documents",
    });

    console.log("File uploaded to Cloudinary:", response.secure_url);
    removeLocalFile(filePath);
    return response;
  } catch (error) {
    removeLocalFile(filePath);
    console.log("Cloudinary upload error:", error);
    return null;
  }
};

export default uploadCloudinary;
