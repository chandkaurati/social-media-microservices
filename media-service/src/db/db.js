import mongoose from "mongoose";
import logger from "../utils/logger.js";
import app from "../app.js";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(`mongodb+srv://microserviceroot:rootpass@microservicecluster.z9l8p.mongodb.net/mediaService`);

    console.log(
      "MongoDB connected SuccessFully on :",
      connectionInstance.connection.host
    )

    app.on("error", (err) => {
      console.log("Express side error ", err);
    });


  } catch (error) {
    logger.error("Failed to connectDb", error);
    process.exit(1);
  }
};

export default connectDb;
