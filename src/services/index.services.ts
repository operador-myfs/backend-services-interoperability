import amqplib from 'amqplib';
import { db } from '../config';
import { ITransferTransaction } from '../types/transfer.types';
import { TTransferCitizen } from '../schemas/transferCitizen';
import { TRANSFER_COLLECTION } from '../utils/constants';

const amqpUrl = process.env.AMQP_URL || 'amqp://localhost:5672';

export const transferQueueSender = async (transactionId: string, transferData: TTransferCitizen): Promise<void> => {
  const connection = await amqplib.connect(amqpUrl, 'heartbeat=60');
  const channel = await connection.createChannel();

  try {
    const queue = 'transfer_citizen_documents';

    await channel.assertQueue(queue, { durable: true });

    for (const key in transferData.urlDocuments) {
      if (Object.prototype.hasOwnProperty.call(transferData.urlDocuments, key)) {
        const doc = transferData.urlDocuments[key];
        const message = {
          transactionId,
          id: transferData.citizenEmail.trim().toLowerCase(),
          url: doc[0],
          key,
        };
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await channel.close();
    await connection.close();
  }
};

export const saveTransferTransaction = async (
  data: TTransferCitizen
): Promise<{ success: boolean; message: string; doc?: ITransferTransaction }> => {
  try {
    const documents: ITransferTransaction['documents'] = {};

    for (const key in data.urlDocuments) {
      if (Object.prototype.hasOwnProperty.call(data.urlDocuments, key)) {
        const document = data.urlDocuments[key];
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
      message: 'document saved successfully',
      doc: newDoc,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Error when saving document',
    };
  }
};
