import Media from "../model/media.model.js";
import {uploadMediaToCloudianry} from "../utils/cloudinary.js";
import logger from "../utils/logger.js";

export const uploadmedia = async (req, res) => {
  logger.info("upload media route hitted");

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: " file is required! please provide a file ",
      });
    }

    const responce = await uploadMediaToCloudianry(file);
    const media = await Media.create({
      publicId : responce.public_id,
      originalName : file.originalname,
      mimeType : file.mimetype,
      url :  responce.secure_url,
      userId : req.user.userId
    });

    return res.status(200).json({
      success: true,
      data : media,
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllMedia = async (req, res) => {
  logger.info("get all media route hit");

  try {
    const media = await Media.find({})
    return res.status(200).json({
      success: true,
      data: media,
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
