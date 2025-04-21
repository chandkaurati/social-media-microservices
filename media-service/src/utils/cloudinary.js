import { v2 as cloudinary } from "cloudinary";
import logger from "./logger.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadMediaToCloudianry = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          logger.error(
            "error occured in upload in upload mediaoncloudinary",
            error
          );
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(file.buffer);
  });
};

export const deleteMediaFromCloudinary = async (publicId) => {
  if (!publicId) {
    return null;
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info("Media deleted successFully form cloudinary ", publicId);
    return result
  } catch (error) {
    logger.error("Error deleting media from cludinary", error);
    throw error;
  }
};
