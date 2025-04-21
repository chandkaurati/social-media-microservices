import express from  "express"
import helmet from "helmet"
import mediaRoutes from "./routes/media.route.js"
import errorHandler from "./middlewares/errorHandler.js"
import logger from "./utils/logger.js"
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(helmet())


app.use("/api/media/", mediaRoutes)

app.use(errorHandler)

process.on("unhandledRejection", ( reason, promise )=>{
    logger.error("unhandledRejection At", promise, reason)
})

// process.on("unhandledRejection", (reason, promise) => {
//     logger.error("UnhandledRejection at ", promise, reason);
//   });

export default app