import { z } from "zod";

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

// Define the schema for your API response
const TasksResponseSchema = z.object({
  success: z.literal(true),
  tasks: z.array(TaskModel),
});

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Only handle the /api/tasks route
    if (path === "/api/tasks" && method === "GET") {
      try {
        // Fetch tasks from your real API
        const res = await fetch("https://zigi-api.zacwoll.workers.dev/tasks");
        if (!res.ok) {
          return new Response(`Error fetching tasks: ${res.status}`, {
            status: res.status,
          });
        }
        const data = await res.json();

        // Validate the response using Zod
        const parsed = TasksResponseSchema.safeParse(data);

        if (!parsed.success) {
          console.log("Validation of data failed");
          return new Response(`API returned an error`, { status: 500 });
        }

        if (!parsed.data.success) {
          console.log("API returned an error")
          return new Response(`API returned an error`, { status: 500 });
        }

        const { tasks } = parsed.data;
        return Response.json(tasks);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return new Response(`Failed to fetch tasks: ${message}`, {
          status: 500,
        });
      }
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
