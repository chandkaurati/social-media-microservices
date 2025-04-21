import express from "express";
import cors from "cors";
import helmet from "helmet";
import Redis from "ioredis";
import errorHandler from "./middlewares/errorHandler.js";
import postRoutes from "./routes/post.routes.js";
import logger from "./utils/logger.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);
app.use(helmet());

const redisClient = new Redis({
  port: 6380,
  host: "localhost",
});

app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes
);

app.use(errorHandler);

process.on("unhandledRejection", (reason, promise) => {
  logger.error("UnhandledRejection at ", promise, reason);
});

export default app;
