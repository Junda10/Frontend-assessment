import { useTaskContext } from '@/context/TaskContext';

export function useTasks() {
    return useTaskContext();
}
