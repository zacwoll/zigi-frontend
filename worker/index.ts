export default {
  fetch(request) {
    const url = new URL(request.url);
    const test_now = new Date().toISOString();

    if (url.pathname === "/api/tasks") {
      // Example tasks array
      const tasks = [
        {
          id: "task-1",
          user_id: "user-1",
          title: "Morning Routine",
          description: "Start the day productively",
          success_points: 10,
          failure_points: 5,
          status: "in-progress",
          created_at: "2025-11-03T08:00:00Z",
          completed_at: null,
          expires_at: "2025-11-03T12:00:00Z",
          subtasks: [
            {
              id: "sub-1",
              task_id: "task-1",
              title: "Brush teeth",
              description: "Brush thoroughly for 2 minutes",
              success_points: 2,
              failure_points: -1,
              status: "completed",
              completed_at: "2025-11-03T08:05:00Z",
              expires_at: null,
            },
            {
              id: "sub-2",
              task_id: "task-1",
              title: "Make coffee",
              description: "Prepare a cup of coffee",
              success_points: 3,
              failure_points: -1,
              status: "in-progress",
              completed_at: null,
              expires_at: null,
            },
            {
              id: "sub-3",
              task_id: "task-1",
              title: "Meditate",
              description: "10 minutes of mindfulness",
              success_points: 5,
              failure_points: -3,
              status: "pending",
              completed_at: null,
              expires_at: "2025-11-03T09:00:00Z",
            },
          ],
        },
        {
          id: "task-2",
          user_id: "user-1",
          title: "Finish report",
          description: "Complete the quarterly report",
          success_points: 15,
          failure_points: 10,
          status: "completed",
          created_at: "2025-11-02T09:00:00Z",
          completed_at: test_now,
          expires_at: "2025-11-03T17:00:00Z",
          subtasks: [], // no subtasks
        },
        {
          id: "task-3",
          user_id: "user-1",
          title: "Submit tax forms",
          description: "Send in before the deadline",
          success_points: 20,
          failure_points: 15,
          status: "failed",
          created_at: "2025-10-31T10:00:00Z",
          completed_at: test_now,
          expires_at: "2025-11-01T17:00:00Z",
          subtasks: [], // no subtasks
        },
        {
          id: "task-4",
          user_id: "user-1",
          title: "Organize desk",
          description: "Clean and sort office supplies",
          success_points: 5,
          failure_points: 2,
          status: "expired",
          created_at: "2025-10-30T08:00:00Z",
          completed_at: test_now,
          expires_at: "2025-10-31T12:00:00Z",
          subtasks: [], // no subtasks
        },
      ];

      return Response.json(tasks); // <-- return an array
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
