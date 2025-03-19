import helmet from "helmet";
import router from "./api/v1/routes";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { checkDbConnection } from "./config/db";
import { initializeRedisClient } from "./config/redis";
import os from "os";
import cluster from "cluster";
const { connectRabbitMQ } = require('./config/rabbitmq');
const { startConsumer } = require('./services/consumer');

dotenv.config();

async function startWorker() {
    console.log(`Worker ${process.pid} started.`);

    const app = express();
    const port = process.env.FILE_PORT || 3000;

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.use(helmet());
    app.use("/api/", router);

    // Hubungkan ke Redis
    await initializeRedisClient();

    // Hubungkan ke database
    await checkDbConnection();

    // Jalankan RabbitMQ Consumer
    startConsumer();

    // Hubungkan ke RabbitMQ
    await connectRabbitMQ();
    
    // Mulai server
    app.listen(port, () => {
        console.log(`[server]: Worker ${process.pid} is running at http://localhost:${port}`);
    });
}

async function initializeExpressServer() {
    // if (cluster.isPrimary) {
    //     const numCPUs = os.cpus().length;

    //     console.log(`Master process PID: ${process.pid}`);
    //     console.log(`Forking ${numCPUs} workers...`);

    //     cluster.schedulingPolicy = cluster.SCHED_RR;

    //     // Fork workers
    //     for (let i = 0; i < numCPUs; i++) {
    //         cluster.fork();
    //     }

    //     cluster.on('exit', (worker) => {
    //         console.log(`Worker ${worker.process.pid} died. Forking a new worker...`);
    //         cluster.fork();
    //     });

    // } else {
        await startWorker();
    // }
}

// Pastikan error dihandle dengan baik
initializeExpressServer().catch((err) => {
    console.error("Error initializing server:", err);
});
