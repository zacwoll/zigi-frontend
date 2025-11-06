import type { Task } from "../types";
import { TaskCard } from "./TaskCard";

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  emptyMessage?: string;
  onComplete?: (task_id: string) => void;
  onFail?: (task_id: string) => void;
  className?: string;
}

export function TaskColumn({
  title,
  tasks,
  emptyMessage,
  onComplete,
  className,
}: TaskColumnProps) {
  return (
    <section
      className={`flex flex-col flex-1 p-4 rounded-xl shadow-sm
		${className || ""}`}
    >
      <h2>{title}</h2>

      {tasks.length === 0 ? (
        <p className="italic text-gray-400">
          {emptyMessage ?? "No tasks here."}
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li key={t.id}>
              <TaskCard task={t} onComplete={onComplete} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}