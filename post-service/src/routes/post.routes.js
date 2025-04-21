import express from "express";
import checkAuth from "../middlewares/checkAuth.js";
import { createPost, deletePost, getAllPosts, getData, getPost, } from "../controllers/post.controller.js";

const router = express.Router();

router.use(checkAuth);

router.post("/create-new", createPost);
router.get("/get-all", getAllPosts)
router.get("/get-post", getPost)
router.get("/getdata", getData)
router.post("/delete", deletePost)

export default router;
