import express from "express";
import checkAuth from "../middlewares/checkAuth.js";
import { getAllMedia, uploadmedia } from "../controller/media.controller.js";
import uploadImage from "../middlewares/multer.middleware.js";


const router = express.Router();

router.use(checkAuth);

router.post("/upload", uploadImage,  uploadmedia);
router.get("/get-all", getAllMedia)
export default router;
