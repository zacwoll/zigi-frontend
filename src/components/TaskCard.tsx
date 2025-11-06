import type { Task } from "../types";
import { Check, X } from "lucide-react";
import { capitalize, isComplete } from "../utils";

interface TaskCardProps {
	task: Task;
	onComplete?: (task_id: string) => void;
	onFail ?: (task_id: string) => void;
}

export function TaskCard({ task, onComplete, onFail }: TaskCardProps) {
  // Task is in 'Recent Tasks' if complete
	const isRecentTask = isComplete(task.status);

let cardBg: string;
if (task.status === "completed") {
  cardBg = "bg-green-100 dark:bg-green-900";
} else if (task.status === "failed") {
  cardBg = "bg-red-100 dark:bg-red-900";
} else if (task.status === "expired") {
  cardBg = "bg-gray-100 dark:bg-gray-700";
} else {
  // active / in-progress tasks
  cardBg = "bg-white dark:bg-gray-800";
}

	let statusText = capitalize(task.status);
	if (task.status === "completed") {
		statusText += ` +${task.success_points}`;
	} else if (task.status === "failed" || task.status === "expired") {
		statusText += ` -${task.failure_points}`;
	}

  return (
    <div
      className={`flex flex-col border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 gap-3 hover:shadow-md transition-shadow ${cardBg}`}
    >
      {/* Header: Title + Points on the left, Buttons on the right */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Header: Title + Points */}
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            {task.title}
          </h3>

          {/* Show points to the right of the title for active tasks */}
          {!isRecentTask && (
            <div className="flex gap-2 items-center">
              <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs font-medium">
                +{task.success_points}
              </span>
              <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-medium">
                -{task.failure_points}
              </span>
            </div>
          )}
        </div>

        {/* Done/Fail buttons */}
        {!isRecentTask && (
          <>
            <div className="flex gap-2">
              <button
                onChange={() => onComplete?.(task.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition text-sm font-medium"
              >
                <Check className="w-4 h-4" />
                <span>Done</span>
              </button>

              <button
                onChange={() => onFail?.(task.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition text-sm font-medium"
              >
                <X className="w-4 h-4" />
                <span>Fail</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Description below */}
      {task.description && (
        <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
          {task.description}
        </p>
      )}

      {/* Subtasks */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {task.subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex flex-col border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {subtask.title}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onComplete?.(subtask.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 text-xs"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onFail?.(subtask.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {subtask.description && (
                <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                  {subtask.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Status */}
      {isRecentTask && (
      <div className="flex items-center justify-between mt-2">
          <span className="py-1 font-semibold text-sm md:text-base">
            {statusText}
          </span>
      </div>
      )}

      {/* Dates */}
      <div className="flex justify-between text-gray-500 text-xs">
        {/* Always show created at */}
        <span>Created: {new Date(task.created_at).toDateString()}</span>

        {/* Right-side date based on status */}
        {task.status === "expired" && task.expires_at ? (
          <span>Expired: {new Date(task.expires_at).toDateString()}</span>
        ) : task.status === "completed" && task.completed_at ? (
          <span>Completed: {new Date(task.completed_at).toDateString()}</span>
        ) : task.status === "failed" && task.completed_at ? (
          <span>Failed: {new Date(task.completed_at).toDateString()}</span>
        ) : task.expires_at ? (
          <span>Expires: {new Date(task.expires_at).toDateString()}</span>
        ) : null}
      </div>
    </div>
  );
}