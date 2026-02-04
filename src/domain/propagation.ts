import type { Task, TaskState } from '@/types/task';
import { buildTaskMap, buildDependencyGraph, isTaskBlocked, getDownstreamTasks } from './dependencies';

export function propagateStateChange(
    taskId: number,
    newState: TaskState,
    tasks: Task[]
): Task[] {
    const graph = buildDependencyGraph(tasks);
    const visited = new Set<number>();

    const updatedTasks = [...tasks];
    const taskIndex = updatedTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return tasks;

    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], state: newState };

    const updatedTaskMap = buildTaskMap(updatedTasks);

    function propagate(currentTaskId: number) {
        if (visited.has(currentTaskId)) return;
        visited.add(currentTaskId);

        const downstreamTaskIds = getDownstreamTasks(currentTaskId, graph);

        for (const downstreamId of downstreamTaskIds) {
            const downstreamTask = updatedTaskMap[downstreamId];
            if (!downstreamTask) continue;

            const shouldBeBlocked = isTaskBlocked(downstreamTask, updatedTaskMap);

            if (shouldBeBlocked && downstreamTask.state !== 'BLOCKED') {
                const idx = updatedTasks.findIndex(t => t.id === downstreamId);
                if (idx !== -1) {
                    updatedTasks[idx] = { ...updatedTasks[idx], state: 'BLOCKED' };
                    updatedTaskMap[downstreamId] = updatedTasks[idx];
                }
                propagate(downstreamId);
            }

            else if (!shouldBeBlocked && downstreamTask.state === 'BLOCKED') {
                const idx = updatedTasks.findIndex(t => t.id === downstreamId);
                if (idx !== -1) {
                    updatedTasks[idx] = { ...updatedTasks[idx], state: 'TODO' };
                    updatedTaskMap[downstreamId] = updatedTasks[idx];
                }

                propagate(downstreamId);
            }
        }
    }

    propagate(taskId);

    return updatedTasks;
}

export function calculateTaskState(task: Task, taskMap: Record<number, Task>): TaskState {
    const shouldBeBlocked = isTaskBlocked(task, taskMap);

    if (shouldBeBlocked) {
        return 'BLOCKED';
    }

    if (task.state === 'BLOCKED') {
        return 'TODO';
    }
    return task.state;
}
