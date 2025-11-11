import { z } from "zod";

export const TransactionModel = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number().int(),
  reason: z.string().nullable().optional(),
  related_task_id: z.string().uuid().nullable().optional(),
  timestamp: z.string().datetime(),
});