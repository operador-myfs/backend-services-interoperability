import { rabbitMQConfig, db } from '../config';
import { ITransferTransaction } from '../types/transfer.types';
import { TTransferCitizen } from '../schemas/transferCitizen';
import { TRANSFER_COLLECTION } from '../utils/constants';
import amqplib from 'amqplib';

const amqpUrl = process.env.AMQP_URL || 'amqp://localhost:5672';


export const publishTransferDocuments = async (transactionId: string, transferData: TTransferCitizen): Promise<void> => {
  const connection = await amqplib.connect(amqpUrl, 'heartbeat=60');
  const channel = await connection.createChannel();
  const exchange = rabbitMQConfig.transferExchange;

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

export const publishTransferUser = async (transactionId: string, transferData: TTransferCitizen): Promise<void> => {
  const connection = await amqplib.connect(amqpUrl, 'heartbeat=60');
  const channel = await connection.createChannel();
  const exchange = rabbitMQConfig.transferExchange;
  
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


export const saveTransferTransaction = async (
  data: TTransferCitizen
): Promise<{ success: boolean; message: string; doc?: ITransferTransaction }> => {
  try {
    const documents: ITransferTransaction['documents'] = {};

    for (const key in data.Documents) {
      if (Object.prototype.hasOwnProperty.call(data.Documents, key)) {
        const document = data.Documents[key];
        documents[key] = {
          state: 'pending',
          url: document[0],
        };
      }
    }

    const docRef = db.collection(TRANSFER_COLLECTION).doc();
    const newDoc: ITransferTransaction = {
      transactionId: docRef.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      id: data.id,
      citizenEmail: data.citizenEmail,
      citizenName: data.citizenName,
      confirmationURL: data.confirmationURL,
      documents,
    };

    await docRef.set(newDoc);

    return {
      success: true,
      message: 'Document saved successfully',
      doc: newDoc,
    };
  } catch (error) {
    console.error('Error saving transfer transaction:', error);
    return {
      success: false,
      message: 'Error when saving document',
    };
  }
};