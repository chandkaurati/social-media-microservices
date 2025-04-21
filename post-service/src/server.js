import dotenv from "dotenv";
dotenv.config({
  path: "./env",
});
import app from "./app.js";
import connectDB from "./db/index.js";
import logger from "./utils/logger.js";
import { connect } from "amqplib";
import connectToRabbitMq from "./utils/rabbitMq.js";

const PORT = process.env.PORT || 3001;


async function startServer () {
  try {
    await connectToRabbitMq();
    await connectDB();
    app.listen(PORT, () => {
      logger.info("app is listning on port ", PORT );
    });
  } catch (error) {
    logger.error(error);
    process.exit(1)
  }
}


startServer()

