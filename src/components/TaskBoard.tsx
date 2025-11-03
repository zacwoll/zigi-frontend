import React, { useEffect, useState } from "react";
import { type Task } from "../types";
import { TaskColumn } from "./TaskColumn";

/*
  24 hours in milliseconds:
  24 * 60 = 1440
  1440 * 60 = 86400
  86400 * 1000 = 86400000
*/
// Last 24 hrs of Tasks
const RECENT_MS = 24 * 60 * 60 * 1000; // 86,400,000 ms

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
      .then((data: Task[]) => {
        // console.log("Fetched tasks:", data);
        setTasks(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // // Helpers to persist updates to the backend (best-effort)
  // const persist = async (taskId: string) => {
    //   // best-effort; ignore network failures for UX responsiveness
    //   try {
      //     await fetch(`/api/tasks/${taskId}`, {
        //       method: "PATCH",
        //       headers: { "Content-Type": "application/json" },
        //       body: JSON.stringify(patch),
        //     });
        //   } catch {
          //     // ignore - we still update local state optimistically
          //   }
          // };
          
  // TODO: Implement MarkComplete
  // Mark Task as complete
  const markComplete = (task_id: string) => {
    console.log(`${task_id} marked complete`);
	// // Target the included tag and mark it as completed
  //   const updated: Task = {
  //     ...task,
  //     status: "completed",
  //   };
	// // Update the UI to reflect the completed status
  //   setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
	// // Persist the change in the database
  //   persist(task.id, { status: "completed" });
  };

//   const undoTask = (task: Task) => {
//     // Put back to active (undo completion or failure)
//     const updated: Task = { ...task, status: "active", timestamp: undefined };
//     setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
//     persist(task.id, { status: "active", timestamp: null });
//   };

  // Compute visible lists:
  const now = Date.now();
  const activeTasks = tasks.filter((t) => t.status === "in-progress");

  const recentTasks = tasks.filter((t) => {
    if (t.status !== "completed" &&
		t.status !== "failed" &&
		t.status !== "expired") return false;
    if (!t.completed_at) return false;
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
      className="flex-1 md:flex-[2_1_0%] flex flex-col bg-pink-50/60"
    />

    <TaskColumn
      title="Recent Tasks"
      tasks={recentTasks}
      emptyMessage="No recent tasks"
      // onUndo={undoTask} // optional callback for recent tasks
      className="flex-1 md:flex-[1_1_0%] bg-pink-50/60"
    />
  </div>
);
};
