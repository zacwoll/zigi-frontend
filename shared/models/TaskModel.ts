import { z } from "zod";

export const TaskStatusEnum = z.enum([
  "pending",
  "in-progress",
  "completed",
  "failed",
  "expired",
]);

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


export const SubtaskUserEntryModel = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  success_points: z.number().int(),
  failure_points: z.number().int(),
  expires_at: z.string().datetime().optional(),
});

export type Task = z.infer<typeof TaskModel>;
export type Subtask = z.infer<typeof SubtaskModel>;