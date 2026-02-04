import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Task, TaskState } from '@/types/task';
import { fetchTasks, updateTaskState as apiUpdateTaskState } from '@/api/tasks';
import { propagateStateChange } from '@/domain/propagation';
import { buildTaskMap } from '@/domain/dependencies';
import { canTransitionTo } from '@/domain/validation';

interface TaskContextType {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    updateTaskState: (taskId: number, newState: TaskState) => Promise<void>;
    refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const value = {
        tasks,
        loading,
        error,
        updateTaskState,
        refreshTasks,
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTaskContext() {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTaskContext must be used within a TaskProvider');
    }
    return context;
}
