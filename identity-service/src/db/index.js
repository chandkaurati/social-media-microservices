import mongoose from "mongoose";
import app from "../app.js";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/identiyService`
    );
    app.on("error", (err) => {
      logger.error("Express side error", err);
    });

    logger.info(
      "MongoDB connected SuccessFully on :",
      connectionInstance.connections.host
    );
  } catch (error) {
    logger.error("Failed to connect monogoDB", error);
    process.exit(1);
  }
};

export default connectDB;
