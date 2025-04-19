import dotenv from "dotenv";
dotenv.config({
  path: "./env",
});
import app from "./app.js";
import connectDB from "./db/index.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(PORT, () => {
   logger.info("app is listning on port ", PORT )
  });
});

