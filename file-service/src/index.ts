import helmet from "helmet";
import router from "./api/v1/routes";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { checkDbConnection } from "./config/db";
import { initializeRedisClient } from "./middlewares/redis";
const { connectRabbitMQ } = require('./config/rabbitmq');
const { startConsumer } = require('./services/consumer');
const { sendToQueue } = require('./services/producer');

dotenv.config()

async function initializeExpressServer() {

    const app = express()
    const port = process.env.FILE_PORT || 3000;

    app.use(cors())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    app.use(helmet())
    app.use("/api/", router)

    // connect to redis
    await initializeRedisClient()

    const startServer = async () => {
        await connectRabbitMQ();
        // const payload = JSON.stringify({ 
        //     pattern: 'activity_queue',
        //     data: 'Cihuy' 
        // });

        // await sendToQueue(payload);

        app.listen(port, () => {
            console.log(`[server]: Server is running at http://localhost:${port}`);
        })
    }

    startServer()
}

initializeExpressServer().then().catch((e) => console.log(e))
checkDbConnection()