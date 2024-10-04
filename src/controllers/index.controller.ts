import { Request, Response } from 'express';
import response from '../utils/response';
import transferSchema from '../schemas/transferCitizen';
import { saveTransferTransaction  } from '../services/index.services';
import { publishTransferDocuments, publishTransferUser } from '../services/transfer.services';
import { publishConfirmTransferedDocuments, publishConfirmTransferedUser  } from '../services/confirm.services';

const healthcheck = async (_req: Request, res: Response) => {
  return response({
    res,
    status: 200,
    error: false,
    message: 'healthy',
  });
};

const transferCitizen = async (req: Request, res: Response) => {
  const result = transferSchema.validateTransfer(req.body);
  if (result.success === false) {
    return response({
      res,
      status: 400,
      error: true,
      message: JSON.parse(result.error.message),
    });
  }

  const { success, message, doc } = await saveTransferTransaction(result.data);
  if (!success) {
    return response({
      res,
      status: 500,
      error: true,
      message: message,
    });
  }

  try {
    await publishTransferDocuments(doc.transactionId, result.data);
    await publishTransferUser(doc.transactionId, result.data);

    return response({
      res,
      status: 200,
      error: false,
      message: 'Transferencia registrada con éxito',
    });
  } catch (error) {
    console.log(error);
    return response({
      res,
      status: 500,
      error: true,
      message: 'Error al registrar transferencia',
    });
  }
};

const confirmTransfer = async (req: Request, res: Response) => {
  const result = transferSchema.validateTransfer(req.body);
  if (result.success === false) {
    return response({
      res,
      status: 400,
      error: true,
      message: JSON.parse(result.error.message),
    });
  }

  const { success, message, doc } = await saveTransferTransaction(result.data);
  if (!success) {
    return response({
      res,
      status: 500,
      error: true,
      message: message,
    });
  }

  try {
    await publishConfirmTransferedDocuments(doc.transactionId, result.data);
    await publishConfirmTransferedUser(doc.transactionId, result.data);

    return response({
      res,
      status: 200,
      error: false,
      message: 'Confirmacion registrada con éxito',
    });
  } catch (error) {
    console.log(error);
    return response({
      res,
      status: 500,
      error: true,
      message: 'Error al registrar confirmacion',
    });
  }
};

const documentController = {
  healthcheck,
  transferCitizen,
  confirmTransfer,
};

export default documentController;
