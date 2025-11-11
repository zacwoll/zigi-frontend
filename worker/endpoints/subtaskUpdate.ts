import { contentJson, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import {
  type AppContext,
  TaskStatusEnum,
  SubtaskModel,
} from "@shared/types";
import { type TransactionData, writeTransaction } from "../transaction";
import { isComplete } from "@shared/utils";

export class SubtaskUpdate extends OpenAPIRoute {
  schema = {
    tags: ["Tasks"],
    summary: "Update status of subtask",
    request: {
      params: z
        .object({
          task_id: z.string(),
		  subtask_id: z.string(),
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
        ...contentJson(SubtaskModel),
      },
    },
  };

	async handle(c: AppContext) {
    console.log(`handling request ${JSON.stringify(c.req, null, 2)}`);
	const data = await this.getValidatedData<typeof this.schema>();
	const { task_id, subtask_id } = data.params;
	const { status } = data.body;

	
	try {
    const db = c.env.prod_zigi_api;

    // If setting status to an incomplete status
    if (!isComplete(status)) {
      // Set status of subtask to in-progress or pending (any incomplete status)
      // Get the subtask to update
      const updatedSubtask = await db
        .prepare(
          `
		UPDATE subtasks
		SET status = ?
		WHERE id = ? AND task_id = ? AND completed_at IS NULL
		RETURNING *
		`,
        )
        .bind(status, subtask_id, task_id)
        .first();

      // console.log({updatedSubtask});

      // Subtask cannot be updated or found
      if (!updatedSubtask) {
        return new Response(
          JSON.stringify({ error: "Subtask cannot be updated" }),
          { status: 500 },
        );
      }

      const subtask = SubtaskModel.parse(updatedSubtask);
      console.log({subtask});

      return new Response(
        JSON.stringify(subtask),
        {status: 200}
      );
    }

    // Else status is a complete status
    // Set the completed_at time
    const completed_at = new Date().toISOString();
    // Get the subtask to update
    const updatedSubtask = await db
      .prepare(
        `
    UPDATE subtasks
    SET status = ?,
        completed_at = ?
    WHERE id = ? AND task_id = ? AND completed_at IS NULL
    RETURNING *,
      (SELECT user_id FROM tasks WHERE tasks.id = subtasks.task_id) AS user_id
    `,
      )
      .bind(status, completed_at, subtask_id, task_id)
      .first();

    // Subtask cannot be updated or found
    if (!updatedSubtask) {
      return new Response(
        JSON.stringify({ error: "Subtask cannot be updated" }),
        { status: 400 },
      );
    }

    // Extend Zod model to include user_id
    const SubtaskWithUserModel = SubtaskModel.extend({
      user_id: z.string(),
    });

    const updateSubtask = SubtaskWithUserModel.parse(updatedSubtask);

    // Execute transaction
    const data: TransactionData = {
      user_id: updateSubtask.user_id,
      amount: updateSubtask.success_points,
      reason: updateSubtask.title,
      related_task_id: task_id,
    };
    const updatedUser = await writeTransaction(c.env, data);
    console.log(updatedUser);
    // TODO: I have the new balance, I should return it

    // Success, return subtask
    return new Response(JSON.stringify(updateSubtask), { status: 200 });
  } catch (err) {
		console.error(err);
		throw err;
	}
	}
}