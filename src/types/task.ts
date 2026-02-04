
export type TaskState = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

export interface Task {
    id: number;
    title: string;
    description: string;
    state: TaskState;
    blockers: number[];
    dependents: number[];
    due_date: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export type TaskMap = Record<number, Task>;

export type DependencyGraph = Record<number, number[]>;

export interface UpdateTaskRequest {
    state: TaskState;
}


