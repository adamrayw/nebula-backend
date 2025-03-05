import { connectRabbitMQ } from '../config/rabbitmq';
import dotenv from 'dotenv';


dotenv.config();

const QUEUE_NAME = 'activity_queue';

const startConsumer = async () => {
    try {

        const channel = await connectRabbitMQ();
        if (!channel) {
            throw new Error('Failed to create a channel');
        }

        // make sure the queue exists before we try to consume from it
        await channel.assertQueue(QUEUE_NAME, {
            durable: false,
        });

        console.log('✅ Waiting for messages in %s. To exit press CTRL+C', QUEUE_NAME);

        // consume messages from the queue
        channel.consume(QUEUE_NAME, (msg) => {
            if (msg) {
                const messageContent = msg.content.toString();
                console.log(`✅ Processing notification: ${messageContent}`);

                // acknowledge the message
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('❌ Error consuming messages from queue: ', error);
    }
}

module.exports = {
    startConsumer  
}