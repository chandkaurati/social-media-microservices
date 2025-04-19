import Student from "../models/user.model.js";
import logger from "../utils/logger.js";
import { validateLogin, validateRegistration } from "../utils/validation.js"
import genrateTokens from "../utils/genrateTokens.js";

export const registerUser = async (req, res) => {
  logger.info("Registration Endpoint hitted...");
  try {
    const errors = validateRegistration(req.body);
    console.log(typeof errors.details);
    if (errors?.error) {
      logger.warn("Validation Error", errors?.details[0].message);
      return res.status(400).json({
        success: false,
        message: errors.error?.details[0].message || "All feilds are required",
        errors: errors.error,
      });
    }

    const { username, email, password } = req.body;

    const user = await Student.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("user already exists with this email or username");
      return res.status(400).json({
        success: false,
        message: "user is already exists with this email or username",
      });
    }

    const newUser = await Student.create({
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

    return res.status(200).json({
      success: true,
      message: "user created successFully",
      data: userObject,
      refreshtoken: refreshToken,
      accesstoken: accessToken,
    });
  } catch (error) {
    logger.error("Registration error occured", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const loginUser = async (req, res) => {
  logger.warn("Login route hitted");
  try {
    // const errors = validateLogin(req.body);
    // console.log(errors);
    // console.log(typeof errors.details);
    // if (errors) {
    //   logger.warn("Validation Error", errors.error?.details[0].message);
    //   return res.status(400).json({
    //     success: false,
    //     message: errors.error?.details[0].message || "All feilds are required",
    //     errors: errors.error,
    //   });
    // }
    
    
    const { email, password } = req.body;

    const student = await Student.findOne({ email });

    if (!student) {
      logger.warn("invalid user");
      return res.status(400).json({
        success: false,
        message: "user not found with this email",
      });
    }

    const isPasswordCorrect = await student.comparePassword(password);
    console.log(isPasswordCorrect);
    if (!isPasswordCorrect) {
      logger.warn("incorrect password");
      return res.status(400).json({
        success: false,
        message: "incorrect password",
      });
    }

    const { refreshToken, accessToken } = await genrateTokens(student);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
    });

    const studentObj = student.toObject();

    delete studentObj.password;

    return res.status(200).json({
      success: true,
      message: "logged in successFully",
      data: studentObj,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("login error occured", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getInfo = async (req, res) => {
  return res.status(201).json({
    success: true,
    data: [
      {
        name: "chand",
        email: "Chand@gmail.com",
        location: "India",
      },
      {
        name: "user1",
        email: "user1@gmail.com",
        location: "us",
      },
    ],
  });
};
