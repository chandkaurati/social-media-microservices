import multer from "multer";
import logger from "../utils/logger.js";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("file");

const uploadImage = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      logger.error("Multer error while uploading", err);
      return res.status(400).json({
        message: `Multer error : ${err.message}`,
        statck: err.stack,
      });
    } else if (err) {
      logger.error("Unkown errror occuered while uplaoding file: ", err);
      return res.status(500).json({
        message: `unkown erorr occured while uploading : ${err}`,
        error: err,
      });
    }
    next();
  });
};

export default uploadImage;
