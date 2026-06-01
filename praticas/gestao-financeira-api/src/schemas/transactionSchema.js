import { z } from "zod";

export const createTransactionSchema = z.object({
  description: z.string().min(1),
  value: z.number().positive(),
  date: z.coerce.date(),
  categoryId: z.string().min(1),
});

export const updateTransactionSchema = createTransactionSchema.partial();