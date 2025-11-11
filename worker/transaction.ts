import { UserModel } from "@shared/types";

export interface TransactionData {
  user_id: string;
  amount: number;
  reason?: string;
  related_task_id?: string;
}

// Write to transactions table
export async function writeTransaction(env: Env, data: TransactionData) {
	const { user_id, amount, reason, related_task_id } = data;
  const transaction_id = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const writeTransaction = await env.prod_zigi_api
    .prepare(
      `
		INSERT INTO transactions (id, user_id, amount, reason, related_task_id, timestamp)
		VALUES (?, ?, ?, ?, ?, ?)
	`,
    )
    .bind(
		transaction_id,
		user_id,
		amount,
		reason ?? null,
		related_task_id ?? null,
		timestamp
	)
    .run();

	// This is mostly to check if writeTransaction returns success: true
	if (!writeTransaction) throw new Error(`Failed to write Transaction ${transaction_id}`);
	// console.log({writeTransaction});

	const applyTransaction = await env.prod_zigi_api.prepare(`
		UPDATE users
		SET balance = balance + ?
		WHERE id = ?
		RETURNING *
    `,
    )
	.bind(amount, user_id)
	.first();

	// console.log({applyTransaction});
	const user = UserModel.parse(applyTransaction);
	const new_balance = user.balance;

	console.log(`Transaction applied to ${user_id}:${user.username}, new balance is ${new_balance}`);

	return user;
}
