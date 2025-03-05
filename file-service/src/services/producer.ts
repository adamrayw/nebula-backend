import { connectRabbitMQ } from '../config/rabbitmq';
import dotenv from 'dotenv';

dotenv.config();

const QUEUE_NAME = 'activity_queue';

export const sendToQueue = async (payload: string) => {
    try {

        const channel = await connectRabbitMQ();

        if (!channel) {
            throw new Error('Failed to create a channel');
        }

        // make sure the queue exists before we try to consume from it
        await channel.assertQueue(QUEUE_NAME, {
            durable: false,
        });

        console.log('✅ Ready to send messages to %s', QUEUE_NAME);

        // consume messages from the queue
        channel.sendToQueue(QUEUE_NAME, Buffer.from(payload));

        console.log('✅ Message sent to %s', QUEUE_NAME);
    } catch (error) {
        console.error('❌ Error consuming messages from queue: ', error);
    }
}

module.exports = {
    sendToQueue
}