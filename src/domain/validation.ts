import type { Task, TaskState, TaskMap } from '@/types/task';
import { isTaskActionable } from './dependencies';

export function canTransitionTo(
    task: Task,
    targetState: TaskState,
    taskMap: TaskMap
): { valid: boolean; reason?: string } {
    if (targetState === 'BLOCKED') {
        return {
            valid: false,
            reason: 'Cannot manually set a task to blocked state. Tasks are automatically blocked when dependencies are not met.',
        };
    }

    if (task.state === 'BLOCKED') {
        return {
            valid: false,
            reason: 'Cannot edit a blocked task. Complete its dependencies first.',
        };
    }
 
    if (!isTaskActionable(task, taskMap)) {
        return {
            valid: false,
            reason: 'Task has incomplete dependencies and cannot be modified.',
        };
    }

    return { valid: true };
}

export function validateTaskConsistency(tasks: Task[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const taskMap: TaskMap = {};

    tasks.forEach(task => {
        taskMap[task.id] = task;
    });

    tasks.forEach(task => {
        task.blockers.forEach(depId => {
            if (!taskMap[depId]) {
                errors.push(`Task ${task.id} depends on non-existent task ${depId}`);
            }
        });

        if (task.state === 'DONE') {
            const incompleteDeps = task.blockers.filter(depId => {
                const dep = taskMap[depId];
                return dep && dep.state !== 'DONE';
            });

            if (incompleteDeps.length > 0) {
                errors.push(
                    `Task ${task.id} is marked as done but has incomplete dependencies: ${incompleteDeps.join(', ')}`
                );
            }
        }
    });

    return {
        valid: errors.length === 0,
        errors,
    };
}
