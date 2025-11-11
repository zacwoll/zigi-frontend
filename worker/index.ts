import { fromHono } from "chanfana";
import { Hono } from "hono";
import { UserCreate } from "./endpoints/userCreate";
import { UserList } from "./endpoints/userList";
import { UserFetch } from "./endpoints/userFetch";
import { UserDelete } from "./endpoints/userDelete";
import { TaskCreate } from "./endpoints/taskCreate";
import { TaskList } from "./endpoints/taskList";
import { TaskListAll } from "./endpoints/taskListAll";
import { TaskDelete } from "./endpoints/taskDelete";
import { TaskUpdate } from "./endpoints/taskUpdate";
import { TransactionListAll } from "./endpoints/transactionListAll";
import { UserBalanceAdjustment } from "./endpoints/userBalanceAdjustment";
import { SubtaskUpdate } from "./endpoints/subtaskUpdate";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
});

// Register OpenAPI endpoints

// Create User Account endpoint
openapi.get("/api/users", UserList);
openapi.post("/api/users", UserCreate);
openapi.get("/api/users/:id", UserFetch);
openapi.delete("/api/users/:id", UserDelete);
openapi.post("/api/user/:id/adjustment", UserBalanceAdjustment);

// Task Endpoints
openapi.get("/api/tasks", TaskListAll);
openapi.get("/api/tasks/:id", TaskList);
openapi.post("/api/tasks", TaskCreate);
openapi.delete("/api/tasks/:task_id", TaskDelete);
openapi.patch("/api/tasks/:task_id", TaskUpdate);
openapi.patch("/api/tasks/:task_id/:subtask_id", SubtaskUpdate);

// Transaction Endpoint
openapi.get("/api/transactions", TransactionListAll);

// Cron function to expire tasks
async function expireTasks(env: Env) {
  try {
    // Set completed_at
    const completed_at = new Date().toISOString();
    const expireSubtasks = await env.prod_zigi_api
      .prepare(
        `
		  UPDATE subtasks
		  SET status = 'expired',
			completed_at = ?
		  WHERE expires_at IS NOT NULL
			AND expires_at < ?
			AND status NOT IN ('expired', 'completed', 'failed');
		`,
      )
      .bind(completed_at, completed_at)
      .run();
    // Now run the expiration transaction on the subtasks
    console.log("Expired subtasks updated", expireSubtasks);

    const expireTasks = await env.prod_zigi_api
      .prepare(
        `
		  UPDATE tasks
		  SET status = 'expired',
			completed_at = ?
		  WHERE expires_at IS NOT NULL
			AND expires_at < ?
			AND status NOT IN ('expired', 'completed', 'failed');
		`,
      )
      .bind(completed_at, completed_at)
      .run();
    // now run the expiration transaction on the tasks
    console.log("Expired tasks updated", expireTasks);
  } catch (err) {
    console.error("Failed to update expired tasks", err);
  }
}

export default {
  /** this part manages cronjobs */
  async scheduled(
    controller: ScheduledController,
    env: Env,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _ctx: ExecutionContext,
  ) {
    switch (controller.cron) {
      case "*/5 * * * *":
        // Every five minutes
        console.log("Expiring tasks...");
        await expireTasks(env);
        break;
    }
    // console.log("Cron processed");
  },
  fetch: app.fetch,
};
