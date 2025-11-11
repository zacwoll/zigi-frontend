import { z } from "zod";

// User Model
export const UserModel = z.object({
  id: z.string().uuid(),
  username: z.string(),
  balance: z.number().int(),
  created_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable(),
});
