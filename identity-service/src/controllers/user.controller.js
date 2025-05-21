import User from "../models/user.model.js";
import logger from "../utils/logger.js";
import { validateLogin, validateRegistration } from "../utils/validation.js";
import genrateTokens from "../utils/genrateTokens.js";
import ApiError from "../utils/apiError.js";
import STATUS_CODES from "../utils/statusCodes.js";
import ApiResponce from "../utils/apiResponce.js";
import asyncHandler from "../utils/asyncHandler.js";
import argon2 from "argon2";

export const registerUser = asyncHandler(async (req, res, next) => {
  logger.info("Registration Endpoint hitted...");

  const errors = validateRegistration(req.body);

  if (errors?.error) {
    logger.warn("Validation Error", errors.error?.details[0].message);
    throw new ApiError(
      STATUS_CODES.BAD_REQUEST,
      errors.error?.details[0].message,
      errors.error
    );
  }

  const { username, email, password } = req.body;
  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (user) {
    logger.warn("user already exists with this email or username");
    throw new ApiError(
      STATUS_CODES.CONFLICT,
      "user already exists with this email or username"
    );
  }

  const newUser = await User.create({
    username,
    email,
    password,
  });

  const { refreshToken, accessToken } = await genrateTokens(newUser);

  const userObject = newUser.toObject();

  delete userObject.password;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
  });

  return res.status(STATUS_CODES.CREATED).json(
    new ApiResponce(STATUS_CODES.CREATED, "User Registered successFully", {
      ...userObject,
      accessToken,
      refreshToken,
    })
  );
});

export const loginUser = asyncHandler(async (req, res) => {
  logger.warn("Login route hitted");
  const errors = validateLogin(req.body);

  console.log(errors);

  if (errors?.error) {
    logger.warn("Validation Error", errors.error?.details[0].message);
    throw new ApiError(
      STATUS_CODES.BAD_REQUEST,
      errors.error?.details[0].message,
      errors.error
    );
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    logger.warn("invalid user");
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, "invalid user");
  }

  const isPasswordCorrect = argon2.verify(user.password, password);

  if (!isPasswordCorrect) {
    logger.warn("incorrect password");
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, "incorrect password");
  }

  const { refreshToken, accessToken } = await genrateTokens(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
  });

  const userObj = user.toObject();

  delete userObj.password;

  return res.status(STATUS_CODES.OK).json(
    new ApiResponce(STATUS_CODES.OK, "Login successFully", {
      ...userObj,
      accessToken,
      refreshToken,
    })
  );
});

export const logoutUser = asyncHandler(async(req,res)=>{

})
