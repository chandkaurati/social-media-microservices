import amqp from "amqplib";
import logger from "./logger.js";

let connection = null;
let channel = null;

const EXCHANGE_NAME = "SOCIALLY_EVENTS";

const connectToRabbitMq = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URI);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", {durable: false});
    logger.info("connected to rabbit mq");
    return channel;
  } catch (error) {
    throw error;
  }
};

export const publishEvent = async (routingKey, message) => {
  if (!channel) channel = await connectToRabbitMq();
  try {
    channel.publish(
      EXCHANGE_NAME,
      routingKey,
      Buffer.from(JSON.stringify(message))
    );
    logger.info("event published", `${routingKey}, ${message}`);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default connectToRabbitMq;
