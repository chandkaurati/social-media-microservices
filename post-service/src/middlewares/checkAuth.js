import logger from "../utils/logger.js";

const checkAuth = async (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    logger.warn("un authenticated request");
    return res.status(400).json({
      success: false,
      message: "Authentication required! pelase login first",
    });
  }

  req.user = { userId };
  next();
};

export default checkAuth;
