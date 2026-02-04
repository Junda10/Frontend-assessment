import type { Task, TaskState, TaskMap } from '@/types/task';
import { isTaskActionable } from './dependencies';

/**
 * Validate if a task can transition to a target state
 */
export function canTransitionTo(
    task: Task,
    targetState: TaskState,
    taskMap: TaskMap
): { valid: boolean; reason?: string } {
    // Cannot manually set a task to blocked
    if (targetState === 'BLOCKED') {
        return {
            valid: false,
            reason: 'Cannot manually set a task to blocked state. Tasks are automatically blocked when dependencies are not met.',
        };
    }

    // Cannot edit blocked tasks
    if (task.state === 'BLOCKED') {
        return {
            valid: false,
            reason: 'Cannot edit a blocked task. Complete its dependencies first.',
        };
    }

    // Task must be actionable (all dependencies done) to change state
    if (!isTaskActionable(task, taskMap)) {
        return {
            valid: false,
            reason: 'Task has incomplete dependencies and cannot be modified.',
        };
    }

    // All checks passed
    return { valid: true };
}

/**
 * Validate a list of tasks for consistency
 */
export function validateTaskConsistency(tasks: Task[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const taskMap: TaskMap = {};

    tasks.forEach(task => {
        taskMap[task.id] = task;
    });

    tasks.forEach(task => {
        // Check if dependencies exist
        task.blockers.forEach(depId => {
            if (!taskMap[depId]) {
                errors.push(`Task ${task.id} depends on non-existent task ${depId}`);
            }
        });

        // Check if done tasks have all dependencies done
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
