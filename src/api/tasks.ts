import type { Task, UpdateTaskRequest } from '@/types/task';

const API_BASE_URL = 'http://localhost:8000';

export async function fetchTasks(): Promise<Task[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`);

        if (!response.ok) {
            throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }

        const data: Task[] = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`API Error: ${error.message}`);
        }
        throw new Error('Unknown error occurred while fetching tasks');
    }
}

export async function updateTaskState(taskId: number, state: string): Promise<Task> {
    try {
        const body: UpdateTaskRequest = { state: state as any };

        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: response.statusText }));
            throw new Error(errorData.detail || `Failed to update task: ${response.statusText}`);
        }

        const task: Task = await response.json();
        return task;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`API Error: ${error.message}`);
        }
        throw new Error('Unknown error occurred while updating task');
    }
}
