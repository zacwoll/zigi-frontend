import { contentJson, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { SubtaskModel, SubtaskUserEntryModel, TaskModel, type AppContext } from "@shared/types";

export class TaskCreate extends OpenAPIRoute {
  schema = {
    tags: ["Tasks"],
    summary: "Create a new Task",
    request: {
      body: contentJson(
        z.object({
          user_id: z.string().uuid(),
          title: z.string(),
          description: z.string().nullable().optional(),
          success_points: z.number().int(),
          failure_points: z.number().int(),
          expires_at: z.string().datetime().optional(),
          subtasks: z.array(SubtaskUserEntryModel).optional(),
        }),
      ),
    },
    responses: {
      "200": {
        description: "Returns the created task (and any subtasks)",
        ...contentJson(TaskModel),
      },
    },
  };

  async handle(c: AppContext) {
    // console.log(`Handling request: ${JSON.stringify(c.req, null, 2)}`);
    const data = await this.getValidatedData<typeof this.schema>();
    const {
      user_id,
      title,
      description,
      success_points,
      failure_points,
      subtasks = [],
      expires_at,
    } = data.body;

    const task_id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const status = "pending";

    const db = c.env.prod_zigi_api;

    // Insert Task
    const insertTask = await db
      .prepare(
        `INSERT INTO tasks (id, user_id, title, description, success_points, failure_points, status, created_at, expires_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *
       `,
      )
      .bind(
        task_id,
        user_id,
        title,
        description ?? null,
        success_points,
        failure_points,
        status,
        created_at,
        expires_at ?? null,
      )
      .first();

    if (!insertTask) {
      throw new Error(`Task was unable to be created.`);
    }
    // console.log({insertTask});

    const inserted_task = TaskModel.parse(insertTask);
    // console.log({inserted_task});
    const inserted_subtasks = [];

    // Insert Subtasks (if any)
    for (const subtask of subtasks) {
      const subtask_id = crypto.randomUUID();
      const insertSubtask = await db
        .prepare(
          `INSERT INTO subtasks (id, task_id, title, description, success_points, failure_points, status, expires_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING *
         `,
        )
        .bind(
          subtask_id,
          task_id,
          subtask.title,
          subtask.description ?? null,
          subtask.success_points,
          subtask.failure_points,
          status,
          subtask.expires_at ?? null,
        )
        .first();

      if (insertSubtask && insertSubtask.error) {
        throw new Error(`Failed to create subtask '${subtask.title}' for task ${task_id}: ${insertSubtask.error}`)
      }

      const inserted_subtask = SubtaskModel.parse(insertSubtask);
      inserted_subtasks.push(inserted_subtask);
    }

    return {
      task: {
        ...inserted_task,
        inserted_subtasks
      },
    };
  }
}