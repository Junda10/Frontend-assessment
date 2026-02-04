import { useState, useEffect, useCallback } from 'react';
import type { Task, TaskState } from '@/types/task';
import { fetchTasks, updateTaskState as apiUpdateTaskState } from '@/api/tasks';
import { propagateStateChange } from '@/domain/propagation';
import { buildTaskMap } from '@/domain/dependencies';
import { canTransitionTo } from '@/domain/validation';

interface UseTasksReturn {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    updateTaskState: (taskId: number, newState: TaskState) => Promise<void>;
    refreshTasks: () => Promise<void>;
}

export function useTasks(): UseTasksReturn {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch tasks from API
    const refreshTasks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedTasks = await fetchTasks();
            setTasks(fetchedTasks);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
            setError(errorMessage);
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshTasks();
    }, [refreshTasks]);

    const updateTaskState = useCallback(async (taskId: number, newState: TaskState) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            setError('Task not found');
            return;
        }

        const taskMap = buildTaskMap(tasks);
        const validation = canTransitionTo(task, newState, taskMap);

        if (!validation.valid) {
            setError(validation.reason || 'Invalid state transition');
            return;
        }

        const propagatedTasks = propagateStateChange(taskId, newState, tasks);
        const previousTasks = tasks;
        setTasks(propagatedTasks);
        setError(null);

        try {
            await apiUpdateTaskState(taskId, newState);
            await refreshTasks();
        } catch (err) {
            setTasks(previousTasks);
            const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
            setError(errorMessage);
            console.error('Error updating task:', err);
        }
    }, [tasks, refreshTasks]);

    return {
        tasks,
        loading,
        error,
        updateTaskState,
        refreshTasks,
    };
}
