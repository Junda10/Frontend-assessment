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

/**
 * Custom hook for managing tasks with dependency-aware state updates
 */
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

    // Load tasks on mount
    useEffect(() => {
        refreshTasks();
    }, [refreshTasks]);

    // Update task state with propagation
    const updateTaskState = useCallback(async (taskId: number, newState: TaskState) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
            setError('Task not found');
            return;
        }

        // Validate transition
        const taskMap = buildTaskMap(tasks);
        const validation = canTransitionTo(task, newState, taskMap);

        if (!validation.valid) {
            setError(validation.reason || 'Invalid state transition');
            return;
        }

        // Optimistic update with propagation
        const propagatedTasks = propagateStateChange(taskId, newState, tasks);
        const previousTasks = tasks;
        setTasks(propagatedTasks);
        setError(null);

        try {
            // Update backend
            await apiUpdateTaskState(taskId, newState);

            // Refresh to get authoritative state from backend
            await refreshTasks();
        } catch (err) {
            // Rollback on error
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
