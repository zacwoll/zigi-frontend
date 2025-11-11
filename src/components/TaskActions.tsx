import { createContext, useContext } from "react";

type TaskActions = {
  markTaskComplete: (taskId: string) => Promise<void>;
  markTaskFailed: (taskId: string) => Promise<void>;
  markSubtaskComplete: (taskId: string, subtaskId: string) => Promise<void>;
  markSubtaskFailed: (taskId: string, subtaskId: string) => Promise<void>;
};

export const TaskActionsContext = createContext<TaskActions | null>(null);
export const useTaskActions = () => {
  const context = useContext(TaskActionsContext);
  if (!context)
    throw new Error("useTaskActions must be used within TaskActionsProvider");
  return context;
};
