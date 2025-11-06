import React, { useEffect, useState } from "react";
import { type Task } from "../types";
import { TaskColumn } from "./TaskColumn";
import { isComplete } from "../utils";

// Tasks Component
export const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks once on mount
  useEffect(() => {
    setLoading(true);
    fetch("/api/tasks")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);       
        return res.json();
      })
      .then((data) => {
        console.log("Fetched tasks:", JSON.stringify(data, null, 2));
        setTasks(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Mark Task as complete
  const markComplete = (task_id: string) => {
    console.log(`${task_id} marked complete`);
  };

  const markFailed = (task_id: string) => {
    console.log(`${task_id} marked complete`);    
  }

  // Compute visible lists:

  // Active tasks are tasks that are incomplete
  const activeTasks = tasks.filter((t) => !isComplete(t.status));

  // Recent tasks are tasks that have been completed in RECENT_MS
  const recentTasks = tasks.filter((t) => {
    // Not Complete Tasks are filtered out
    if (!isComplete(t.status)) return false;
    // A task is complete when it has a completed_at timestamp
    if (!t.completed_at) return false;

    // Get the last RECENT_MS Tasks for this list.
    // RECENT_MS : Last 24 hrs of Tasks
    const RECENT_MS = 24 * 60 * 60 * 1000; // 86,400,000 ms
    const now = Date.now();
    const completedAt = new Date(t.completed_at).getTime();
    return now - completedAt < RECENT_MS;
  });

  if (loading) return <div className="tasks-loading">Loading tasks…</div>;
  if (error) return <div className="tasks-error">Error: {error}</div>;

return (
  <div
    id="tasks-container"
    className="flex flex-col md:flex-row grow gap-4 h-full max-w-[75%] w-full min-h-[80vh] bg-white shadow-xl rounded-2xl border border-slate-200 p-6 md:p-10"
  >
    <TaskColumn
      title="Active Tasks"
      tasks={activeTasks}
      emptyMessage="No active tasks"
      onComplete={markComplete}
      onFail={markFailed}
      className="flex-1 md:flex-[2_1_0%] flex flex-col bg-pink-50/60"
    />

    <TaskColumn
      title="Recent Tasks"
      tasks={recentTasks}
      emptyMessage="No recent tasks"
      className="flex-1 md:flex-[1_1_0%] bg-pink-50/60"
    />
  </div>
);
};
