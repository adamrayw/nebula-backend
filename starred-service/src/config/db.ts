import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

dotenv.config()

const sequelize = new Sequelize({
    database: process.env.STARRED_DB_NAME,
    dialect: "postgres",
    username: process.env.STARRED_DB_USERNAME,
    password: process.env.STARRED_DB_PASSWORD,
    host: process.env.STARRED_DB_HOST,
    port: Number(process.env.STARRED_DB_PORT),
    models: [__dirname + "../models"],
    logging: console.log
})

const checkDbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully!");
    } catch (error) {
        console.error("Unable to connect to the database: ", error);
    }
}

export {
    checkDbConnection,
    sequelize
}