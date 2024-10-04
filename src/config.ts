import admin from 'firebase-admin';
import { FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID } from './utils/constants';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

export const rabbitMQConfig = {
  // URL de conexión a RabbitMQ
  amqpUrl: process.env.AMQP_URL || 'amqp://localhost:5672',

  // Exchanges
  transferExchange: process.env.TRANSFER_EXCHANGE || 'receive_transfer_exchange',
  confirmExchange: process.env.CONFIRM_EXCHANGE || 'confirm_transfer_exchange',

  // Routing Keys
  routingKeys: {
    transferDocuments: process.env.TRANSFER_DOCUMENTS_ROUTING_KEY || 'transfer.documents',
    transferUser: process.env.TRANSFER_USER_ROUTING_KEY || 'transfer.user',
    confirmDocuments: process.env.CONFIRM_DOCUMENTS_ROUTING_KEY || 'confirm.documents',
    confirmUser: process.env.CONFIRM_USER_ROUTING_KEY || 'confirm.user',
  },
};

export { db };
