import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Unathorized request",
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "invalid request",
      });
    }
    
    req.user = decoded

    next()
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "invalid token" || error.message,
    });
  }
};


export default authMiddleware
