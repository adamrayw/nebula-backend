import helmet from "helmet";
import router from "./api/v1/routes";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { checkDbConnection } from "./config/db";
import { initializeRedisClient } from "./config/redis";
dotenv.config()

async function initializeExpressServer() {

    const app = express()
    const port = process.env.STARRED_PORT || 3000;

    app.use(cors())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    app.use(helmet())
    app.use("/api/", router)

    // connect to redis
    await initializeRedisClient()

    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    })
}

initializeExpressServer().then().catch((e) => console.log(e))
checkDbConnection()