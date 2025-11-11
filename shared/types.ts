import type { Context } from "hono";
import { z } from "zod";

// Hono App Context
export type AppContext = Context<{ Bindings: Env }>;

// User Model
export const UserModel = z.object({
  id: z.string().uuid(),
  username: z.string(),
  balance: z.number().int(),
  created_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable(),
});

// Enum type for Task Status
export const TaskStatusEnum = z.enum([
  "pending",
  "in-progress",
  "completed",
  "failed",
  "expired",
]);

// Subtask Model
export const SubtaskModel = z.object({
  id: z.string().uuid(),
  task_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  success_points: z.number().int(),
  failure_points: z.number().int(),
  status: z.enum(["pending", "in-progress", "completed", "failed", "expired"]),
  completed_at: z.string().datetime().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

// Task Model
export const TaskModel = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  success_points: z.number().int(),
  failure_points: z.number().int(),
  status: z.enum(["pending", "in-progress", "completed", "failed", "expired"]),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
  subtasks: z.array(SubtaskModel).optional(),
});

// Subtask Entry Model
export const SubtaskUserEntryModel = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  success_points: z.number().int(),
  failure_points: z.number().int(),
  expires_at: z.string().datetime().optional(),
});

export type Task = z.infer<typeof TaskModel>;
export type Subtask = z.infer<typeof SubtaskModel>;

// Transaction Model
export const TransactionModel = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number().int(),
  reason: z.string().nullable().optional(),
  related_task_id: z.string().uuid().nullable().optional(),
  timestamp: z.string().datetime(),
});