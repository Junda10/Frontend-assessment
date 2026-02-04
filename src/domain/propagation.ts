import type { Task, TaskState } from '@/types/task';
import { buildTaskMap, buildDependencyGraph, isTaskBlocked, getDownstreamTasks } from './dependencies';

/**
 * Propagate state changes recursively through the dependency graph
 * Uses DFS with a visited set to prevent infinite loops
 * Time complexity: O(n + e) where n = tasks, e = dependencies
 */
export function propagateStateChange(
    taskId: number,
    newState: TaskState,
    tasks: Task[]
): Task[] {
    const graph = buildDependencyGraph(tasks);
    const visited = new Set<number>();

    // Update the initial task
    const updatedTasks = [...tasks];
    const taskIndex = updatedTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return tasks;

    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], state: newState };

    // Rebuild maps with updated task
    const updatedTaskMap = buildTaskMap(updatedTasks);

    /**
     * DFS to propagate changes to downstream tasks
     */
    function propagate(currentTaskId: number) {
        if (visited.has(currentTaskId)) return;
        visited.add(currentTaskId);

        const downstreamTaskIds = getDownstreamTasks(currentTaskId, graph);

        for (const downstreamId of downstreamTaskIds) {
            const downstreamTask = updatedTaskMap[downstreamId];
            if (!downstreamTask) continue;

            const shouldBeBlocked = isTaskBlocked(downstreamTask, updatedTaskMap);

            // Automatic blocking: if task should be blocked but isn't
            if (shouldBeBlocked && downstreamTask.state !== 'BLOCKED') {
                const idx = updatedTasks.findIndex(t => t.id === downstreamId);
                if (idx !== -1) {
                    updatedTasks[idx] = { ...updatedTasks[idx], state: 'BLOCKED' };
                    updatedTaskMap[downstreamId] = updatedTasks[idx];
                }
                // Continue propagating to this task's dependents
                propagate(downstreamId);
            }
            // Automatic unblocking: if task is blocked but all dependencies are done
            else if (!shouldBeBlocked && downstreamTask.state === 'BLOCKED') {
                const idx = updatedTasks.findIndex(t => t.id === downstreamId);
                if (idx !== -1) {
                    updatedTasks[idx] = { ...updatedTasks[idx], state: 'TODO' };
                    updatedTaskMap[downstreamId] = updatedTasks[idx];
                }
                // Continue propagating to this task's dependents
                propagate(downstreamId);
            }
        }
    }

    // Start propagation from the changed task
    propagate(taskId);

    return updatedTasks;
}

/**
 * Calculate the correct state for a task based on its dependencies
 */
export function calculateTaskState(task: Task, taskMap: Record<number, Task>): TaskState {
    const shouldBeBlocked = isTaskBlocked(task, taskMap);

    if (shouldBeBlocked) {
        return 'BLOCKED';
    }

    // If not blocked and currently blocked, return to todo
    if (task.state === 'BLOCKED') {
        return 'TODO';
    }

    // Otherwise keep current state
    return task.state;
}
