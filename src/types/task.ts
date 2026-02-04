// Task state types
// Task state types
// API uses uppercase, but keeping lowercase for internal compatibility if needed, or we can migrate everyone to uppercase.
// Based on user input "BACKLOG", it seems API returns uppercase.
export type TaskState =  'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

// Task interface matching backend API
export interface Task {
    id: number;
    title: string;
    description: string;
    state: TaskState;
    blockers: number[]; // Array of task IDs that block this task
    dependents: number[]; // Array of task IDs that depend on this task
    due_date: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

// Map of task ID to Task for O(1) access
export type TaskMap = Record<number, Task>;

// Adjacency map: task ID -> array of task IDs that depend on it
export type DependencyGraph = Record<number, number[]>;

// API response types
// The API now returns Task[] directly, so this wrapper might not be needed for the main list,
// but let's keep it or remove it if not used.
// User said: "This is my /tasks response json" -> Array.
// So we don't need TasksResponse interface for the fetch potentially.

export interface UpdateTaskRequest {
    state: TaskState;
}

export interface ErrorResponse {
    detail: string;
}
