import z from 'zod';

const TransferCitizen = z.object({
  id: z.number(),
  citizenName: z.string(),
  citizenEmail: z.string(),
  Documents: z.record(z.array(z.string())),
  confirmationURL: z.string(),
});

export type TTransferCitizen = z.infer<typeof TransferCitizen>;

const validateTransfer = (object: any) => {
  return TransferCitizen.safeParse(object);
};

const transferSchema = {
  validateTransfer,
};

export default transferSchema;
