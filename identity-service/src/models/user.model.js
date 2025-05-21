import mongoose from "mongoose";
import argon2 from "argon2";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpiry: {
      type: Date,
      default: Date.now() + 24 * 60 * 60 * 1000,
    },
  },
  { timestamps: true }
);

userSchema.index({ username: "text" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await argon2.hash(this.password);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
