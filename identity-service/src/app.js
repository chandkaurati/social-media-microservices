import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import helmet from "helmet";
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import logger from "./utils/logger.js";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import errorHandler from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import ApiError from "./utils/apiError.js";
const app = express();

export const redisClient = new Redis({
  host: "localhost",
  port: "6380",
});

app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn("Rate limit exceeded for IP :", req.ip);
      res.status(429).json({
        success: false,
        message: " Too many requests ",
      });
    });
});

// ip based ratelimiting for sensitive endpoint

const reateLimiterForIndivisualRoutes = rateLimit({
  max: 50,
  windowMs: 15 * 60 * 1000,
  // it tells us wether we want to r   ate limit info in the responce headers
  // also this allows client see how many reqest are left in current timewindow
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("sensitive endpoint rate limit exceeded for IP: ", req.ip);
    return res.status(429).json({
      success: false,
      message: "Too many requests",
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

//  apply rate limiter for indivisual routes

app.use("/api/auth/register", reateLimiterForIndivisualRoutes);

app.use("/api/auth", userRouter);

// error handling

app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

app.use(errorHandler);

process.on("unhandledRejection", (reason, promise) => {
  logger.error("UnhandledRejection at ", promise, reason);
  process.exit(1);
});

export default app;
