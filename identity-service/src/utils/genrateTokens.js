// import User from "../models/user.model";
// import logger from "./logger";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/refreshtoken.model.js";

const genrateTokens = async (user) => {
  try {
    const accessToken = jwt.sign(
      {
        _id: user._id,
        username: user.username,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5d" }
    );

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );

    const refreshToken = await RefreshToken.create({
      token,
      user: user._id,
    });

    return { refreshToken, accessToken };
  } catch (error) {}
};

export default genrateTokens;
