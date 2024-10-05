import { rabbitMQConfig } from '../config';
import amqplib from 'amqplib';

const amqpUrl = process.env.AMQP_URL || 'amqp://localhost:5672';
const exchange = rabbitMQConfig.confirmExchange;

export const publishConfirmTransferedDocuments = async (id: number): Promise<void> => {
  const connection = await amqplib.connect(amqpUrl, 'heartbeat=60');
  const channel = await connection.createChannel();

  try {
    await channel.assertExchange(exchange, 'direct', { durable: true });
    const message = { id };
    const sent = channel.publish(exchange, rabbitMQConfig.routingKeys.confirmDocuments, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    if (!sent) {
      console.warn(`Message for documents confirm transaction could not be sent to exchange ${exchange}`);
    }
  } catch (error) {
    console.log('Error when sending messages', error);
    throw error;
  } finally {
    await channel.close();
    await connection.close();
  }
};

export const publishConfirmTransferedUser = async (id: number): Promise<void> => {
  const connection = await amqplib.connect(amqpUrl, 'heartbeat=60');
  const channel = await connection.createChannel();

  try {
    await channel.assertExchange(exchange, 'direct', { durable: true });
    const message = { id };
    const sent = channel.publish(exchange, rabbitMQConfig.routingKeys.confirmUser, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    if (!sent) {
      console.warn(`Message for users confirm transaction could not be sent to exchange ${exchange}`);
    }
  } catch (error) {
    console.log('Error when sending messages', error);
    throw error;
  } finally {
    await channel.close();
    await connection.close();
  }
};
