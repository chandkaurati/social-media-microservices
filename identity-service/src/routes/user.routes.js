import express from "express";
import {
  getInfo,
  loginUser,
  registerUser,
} from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.get("/getinfo", getInfo);

router.post("/login", loginUser);

router.post("/users", authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "",
    data: [{}, {}],
  });
});

export default router;
