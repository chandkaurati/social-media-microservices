import dotenv from "dotenv";
import app from "./app.js";
import logger from "./utils/logger.js";
import connectDb from "./db/db.js";
import { connectToRabbitMq, ConsumeEvent } from "./utils/rabbitmq.js";
import { handlePostDelete } from "./eventHandlers/medial.event.handlers.js";
dotenv.config();

const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    await connectDb();
    await connectToRabbitMq();

    // consume all the events

    await ConsumeEvent("post.deleted", handlePostDelete )

    app.listen(PORT, () => {
      logger.info("App is listning on port", PORT);
    });
  } catch (error) {
    logger.error(error)
    process.exit(1)
  }
}

startServer()