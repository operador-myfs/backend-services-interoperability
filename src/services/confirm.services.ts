import { rabbitMQConfig } from '../config';
import { TTransferCitizen } from '../schemas/transferCitizen';
import amqplib from 'amqplib';

const amqpUrl = process.env.AMQP_URL || 'amqp://localhost:5672';
const exchange = rabbitMQConfig.confirmExchange;

export const publishConfirmTransferedDocuments = async (transactionId: string, transferData: TTransferCitizen): Promise<void> => {
  const connection = await amqplib.connect(amqpUrl, 'heartbeat=60');
  const channel = await connection.createChannel();

  try {
    await channel.assertExchange(exchange, 'direct', { durable: true });

    for (const key in transferData.Documents) {
      if (Object.prototype.hasOwnProperty.call(transferData.Documents, key)) {
        const doc = transferData.Documents[key];
        const message = {
          transactionId,
          id: transferData.id,
          url: doc[0],
          key,
        };
        const sent = channel.publish(exchange, rabbitMQConfig.routingKeys.transferDocuments, Buffer.from(JSON.stringify(message)),{ persistent: true });
        if (!sent) {
          console.warn(`Message for transaction ${transactionId} could not be sent to exchange ${exchange}`);
        }
      }
    }
  } catch (error) {
    console.log('Error when sending messages', error);
    throw error;
  } finally {
    await channel.close();
    await connection.close();
  };
};

export const publishConfirmTransferedUser = async (transactionId: string, transferData: TTransferCitizen): Promise<void> => {
    const connection = await amqplib.connect(amqpUrl, 'heartbeat=60');
    const channel = await connection.createChannel();
  
    try {
      await channel.assertExchange(exchange, 'direct', { durable: true });
      const sent = channel.publish(exchange, rabbitMQConfig.routingKeys.transferUser, Buffer.from(JSON.stringify(transferData)),{ persistent: true });
      if (!sent) {
        console.warn(`Message for transaction ${transactionId} could not be sent to exchange ${exchange}`);
      }
    } catch (error) {
      console.log('Error when sending messages', error);
      throw error;
    } finally {
      await channel.close();
      await connection.close();
    };
  };