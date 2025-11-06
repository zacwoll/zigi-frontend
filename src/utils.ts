import type { TaskStatus } from "./types";

// Capitalize the first letter of a string
export function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
// Function to check if a status is considered "recent"
export function isComplete(status: TaskStatus): boolean {

	// Task is complete
	if (
		status === "completed" ||
		status === "failed" ||
		status === "expired"
	) {
		return true;
	}

	// Task is incomplete
	if (
		status === "pending" ||
		status === "in-progress"
	) {
		return false;
	}

	console.warn(`Unknown task status: ${status}`);
	return false;
}