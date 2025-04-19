import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "UnAthorized request",
      });
    }
    const decoded =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "UnAthorized request",
      });
    }
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token expired, please login again" });
    }
    console.log(error)
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default authMiddleware;
