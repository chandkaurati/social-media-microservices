import amqp from "amqplib";
import logger from "./logger.js";

let connection = null;
let channel = null;

const EXCHANGE_NAME = "SOCIALLY_EVENTS";

export async function connectToRabbitMq() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URI);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("connected to rabbit mq");
    return channel;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export async function Publishevent(routingKey, message) {

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


}

export async function ConsumeEvent(routingKey, callback) {
  try {
    if (!channel) {
      await connectToRabbitMq();
    }

    const q = await channel.assertQueue("", { exclusive: true });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

    console.log(q)
    channel.consume(q.queue, (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        callback(content);
        channel.ack(msg);
      }
    });

    logger.info("Subcibed to event ", routingKey);
  } catch (error) {
    logger.error(error);
    throw error;
  }
}
