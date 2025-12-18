import { Channel, Connection } from "amqplib";

require('dotenv').config();
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

let channel: Channel;
let connection: Connection;

// Function to connect to RabbitMQ server

export const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        console.log('✅ Connected to RabbitMQ server');

        // Handle if connection is closed
        connection.on('close', () => {
            console.log('❌Connection to RabbitMQ server is closed');
            setTimeout(connectRabbitMQ, 5000);
        })

        return channel;
    } catch (error) {
        console.error('❌Error connecting to RabbitMQ server', error);
        setTimeout(connectRabbitMQ, 5000);
    }
}