export async function updateTaskStatus(
  task_id: string,
  status: "completed" | "failed",
) {
  try {
    await fetch(`/api/tasks/${task_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    console.log(`${task_id} marked ${status}`);
  } catch (err) {
    console.error("Error updating task:", err);
  }
}

export async function updateSubtaskStatus(
  task_id: string,
  subtask_id: string,
  status: "completed" | "failed",
) {
  try {
    await fetch(`/api/tasks/${task_id}/${subtask_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    console.log(`${task_id}/${subtask_id} marked ${status}`);
  } catch (err) {
    console.error("Error updating subtask:", err);
  }
}
