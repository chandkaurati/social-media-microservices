import dotenv from "dotenv";
import express from "express";
import Redis from "ioredis";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import logger from "./utils/logger.js";
import proxy from "express-http-proxy";
import authMiddleware from "./middleares/auth.middleware.js";
import logFile from "./middleares/log.file.js";
dotenv.config({
  path: "./env",
});

const app = express();
const PORT = process.env.PORT || 3000;
const redisClient = new Redis({
  host: "localhost",
  port: "6380",
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);
app.use(helmet());

const ratelimit = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  // it tells us wether we want to rate limit info in the responce headers
  // also this allows client see how many reqest are left in current timewindow
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("sensitive endpoint rate limit exceeded for IP: ", req.ip);
    return res.status(429).json({
      success: false,
      message: "Too many requests please try sometime later",
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use(ratelimit);
app.use((req, res, next) => {
  logger.info(`Recived ${req.method} request to ${req.url}`);
  logger.info(` Reqest body ${req.body}`);
  next();
});

const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace("/v1/auth", "/api/auth"); // Rewrite path
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error("Proxy error : ", err.message);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  },
};

// setting up proxy for identity service
app.use(
  "/v1/auth", // Match the incoming request path
  proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Identity service: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

// setting up proxy for post service

app.use(
  "/v1/posts",
  authMiddleware,
  proxy(process.env.POST_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
      return req.originalUrl.replace("/v1/posts", "/api/posts");
    },
    proxyErrorHandler: (err, res, next) => {
      logger.error("Proxy Error: ");
      logger.error(err);
      return res.status(500).json({
        success: false,
        message: "Internal server error : ",
        error: err,
      });
    },
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user._id;
      return proxyReqOpts;
    },
  })
  // proxy(process.env.POST_SERVICE_URL, {
  //   proxyReqPathResolver: (req) => {
  //     return req.originalUrl.replace("/v1/posts", "/api/posts"); // Rewrite path
  //   },
  //   proxyErrorHandler: (err, res, next) => {
  //     logger.error("Proxy error : ", err.message);
  //     res.status(500).json({
  //       message: "Internal server error",
  //       error: err.message,
  //     });
  //   },
  //   proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
  //     proxyReqOpts.headers["Content-Type"] = "application/json";
  //     return proxyReqOpts;
  //   },
  //   proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
  //     proxyReqOpts.headers["Content-Type"] = "application/json";
  //     proxyReqOpts.headers["x-user-id"] = srcReq?.user._id;
  //   },
  //   userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
  //     logger.info(
  //       `Response received from Identity service: ${proxyRes.statusCode}`
  //     );
  //     return proxyResData;
  //   },
  // })
);

// setting up proxy for media service
app.use(
  "/v1/media",
  authMiddleware,
  // logFile,
  proxy(process.env.MEDIA_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
      return req.originalUrl.replace("/v1/media", "/api/media");
    },
    proxyErrorHandler: (err, res, next) => {
      logger.error("Proxy Error: ");
      logger.error(err);
      return res.status(500).json({
        success: false,
        message: "Internal server error : ",
        error: err,
      });
    },
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      if(!proxyReqOpts.headers["content-type"].startsWith("multipart/form-data")){
        proxyReqOpts.headers["content-type"] = "application/json";
      }
      proxyReqOpts.headers["x-user-id"] = srcReq.user._id;
      return proxyReqOpts;
    },
    parseReqBody : false
  })
);

app.listen(PORT, () => {
  logger.info(`API Getway is running on port ${PORT}`);
  logger.info(
    `Identity service is running on  ${process.env.IDENTITY_SERVICE_URL}`
  );
  logger.info(`Redis is running on  ${process.env.REDIS_URL}`);
});
