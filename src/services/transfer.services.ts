import { rabbitMQConfig } from '../config';
import { TTransferCitizen } from '../schemas/transferCitizen';
import amqplib from 'amqplib';

const amqpUrl = process.env.AMQP_URL || 'amqp://localhost:5672';
const exchange = rabbitMQConfig.transferExchange;

export const publishTransferUser = async (transferData: TTransferCitizen): Promise<void> => {
  const connection = await amqplib.connect(amqpUrl, 'heartbeat=60');
  const channel = await connection.createChannel();

  try {
    await channel.assertExchange(exchange, 'direct', { durable: true });
    const sent = channel.publish(exchange, rabbitMQConfig.routingKeys.transferUser, Buffer.from(JSON.stringify(transferData)),{ persistent: true });
    if (!sent) {
      console.warn(`Transfer for ${transferData.id} could not be sent to exchange ${exchange}`);
    }
  } catch (error) {
    console.log('Error when sending messages', error);
    throw error;
  } finally {
    await channel.close();
    await connection.close();
  };
};
