import { Response } from 'express';

interface IArgs {
  res: Response;
  status: number;
  error: boolean;
  message: string;
  body?: any;
}

function response({ res, status, error, message, body }: IArgs) {
  res.status(status).send({
    error,
    message,
    body,
  });
}

export default response;
