import { contentJson, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import {
  TaskModel,
  type AppContext,
  TaskStatusEnum,
  SubtaskModel,
} from "@shared/types";
import { type TransactionData, writeTransaction } from "../transaction";
import { isComplete } from "@shared/utils";

export class TaskUpdate extends OpenAPIRoute {
  schema = {
    tags: ["Tasks"],
    summary: "Update status of task",
    request: {
      params: z
        .object({
          task_id: z.string(),
        }),
      body: contentJson(
        z.object({
          status: TaskStatusEnum,
        }),
      ),
    },
    responses: {
      "200": {
        description: "Returns the updated model of the task",
        ...contentJson(TaskModel),
      },
    },
  };

  async handle(c: AppContext) {
    console.log(`handling request ${JSON.stringify(c.req, null, 2)}`)
    const data = await this.getValidatedData<typeof this.schema>();
    const task_id = data.params.task_id;
    const { status } = data.body;

    const db = c.env.prod_zigi_api;

    // Set the completed_at time
    const completed_at = new Date().toISOString();
    
    try {
      // Check if the task is found
      const task_exists = await db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .bind(task_id)
        .first();

      if (!task_exists) throw new Error("Task not found");
      // console.log({task_exists});

      const parent_task = TaskModel.parse(task_exists);
      const user_id = parent_task.user_id;

      // find all the attached subtasks to mark them as well
      const getSubtasks = await db.prepare(`
        SELECT * FROM subtasks
        WHERE task_id = ?
      `,)
        .bind(task_id)
        .all();

      const subtasks = SubtaskModel.array().parse(getSubtasks.results);
      console.log({ subtasks });

      // Finish all subtasks if main task is completed
      if (status === "completed") {
        // set all the currently in-progress subtasks to completed
        for (const subtask of subtasks) {
          if (
            subtask.status === "in-progress" ||
            subtask.status === "pending"
          ) {
            // set all in-progress subtasks to complete
            await db
              .prepare(
                `
                UPDATE subtasks
                SET status = ?,
                  completed_at = ?
                WHERE id = ?
              `,
              )
              .bind(status, subtask.id)
              .run();

            // execute transaction
            const data: TransactionData = {
              user_id,
              amount: subtask.success_points,
              reason: subtask.title,
              related_task_id: task_id,
            };
            const applied = await writeTransaction(c.env, data);
            console.log(applied);
          }
        }
        console.log("all sub tasks completed");

        // Set the task to completed
        const tryCompleteTask = await db
          .prepare(
            `
          UPDATE tasks
          SET status = ?,
            completed_at = ?
          WHERE id = ?
          RETURNING *
        `,
          )
          .bind(status, completed_at, task_id)
          .first();

        const completedTask = TaskModel.parse(tryCompleteTask);

        // execute deposit transaction
        const data: TransactionData = {
          user_id,
          amount: parent_task.success_points,
          reason: parent_task.title,
          related_task_id: task_id,
        };
        const applied = await writeTransaction(c.env, data);
        console.log(applied);

        return {
          success: true,
          completedTask,
          balance: applied.balance
        };
      } else if (status === "failed" || status === "expired") {
        console.log("handling failed");
        // set all the currently in-progress subtasks to failed or expired
        for (const subtask of subtasks) {
          // if subtask is incomplete, it's status can be mutated
          if (!isComplete(subtask.status)) {
            // set all in-progress tasks to failed
            const updatedSubtask = await db
              .prepare(
                `
                UPDATE subtasks
                SET status = ?,
                  completed_at = ?
                WHERE id = ?
                RETURNING *
                `,
              )
              .bind(status, completed_at, subtask.id)
              .first();

            const db_record = SubtaskModel.parse(updatedSubtask);
            console.log(db_record);

            if (!db_record) {
              console.error("Subtask cannot be updated");
            } else {
              // execute failure transaction
              const data: TransactionData = {
                user_id,
                amount: subtask.failure_points,
                reason: subtask.title,
                related_task_id: task_id,
              };
              const applied = await writeTransaction(c.env, data);
              console.log(applied);
            }
          }
        }

        // Set the task to failed or expired
        const tryCompleteTask = await db
          .prepare(
            `
          UPDATE tasks
          SET status = ?,
            completed_at = ?
          WHERE id = ?
          RETURNING *
        `,
          )
          .bind(status, completed_at, task_id)
          .first();

        const completedTask = TaskModel.parse(tryCompleteTask);

        if (!completedTask) {
          return new Response(
            JSON.stringify({ error: "Task cannot be updated" }),
            { status: 400 },
          );
        }

        // execute failure transaction
        const data: TransactionData = {
          user_id,
          amount: parent_task.failure_points,
          reason: parent_task.title,
          related_task_id: task_id,
        };
        const applied = await writeTransaction(c.env, data);
        console.log(applied);

        return {
          success: true,
          completedTask,
          balance: applied.balance
        };
      } else {
        // other option is changing pending->in-progress,
        // possible future option is pending/in-progress->cancelled or some other state change
        // Set the task to in-progress or otherwise
        const setTask = await db
          .prepare(
            `
          UPDATE tasks
          SET status = ?
          WHERE id = ?
          RETURNING *
        `,
          )
          .bind(status, task_id)
          .first();

        for (const subtask of subtasks) {
          const completedSubtask = await db
            .prepare(
              `
            UPDATE subtasks
            SET status = ?
            WHERE id = ?
          `,
            )
            .bind(status, subtask.id)
            .run();
          console.log(completedSubtask);
        }

        const task = TaskModel.parse(setTask);

        return {
          success: true,
          task,
        };
      }

    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}