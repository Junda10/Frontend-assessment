import type { Task, TaskMap, DependencyGraph } from '@/types/task';

/**
 * Build a dependency graph (adjacency map) from tasks
 * Maps each task ID to an array of task IDs that depend on it
 */
export function buildDependencyGraph(tasks: Task[]): DependencyGraph {
    const graph: DependencyGraph = {};

    // Guard against undefined/null
    if (!tasks || !Array.isArray(tasks)) {
        return graph;
    }

    // Initialize graph with empty arrays
    tasks.forEach(task => {
        graph[task.id] = [];
    });

    // Build adjacency list: for each task, add it to its dependencies' dependent lists
    tasks.forEach(task => {
        task.blockers.forEach(depId => {
            if (graph[depId]) {
                graph[depId].push(task.id);
            }
        });
    });

    return graph;
}

/**
 * Convert task array to map for O(1) access
 */
export function buildTaskMap(tasks: Task[]): TaskMap {
    const map: TaskMap = {};

    // Guard against undefined/null
    if (!tasks || !Array.isArray(tasks)) {
        return map;
    }

    tasks.forEach(task => {
        map[task.id] = task;
    });
    return map;
}

/**
 * Check if a task is blocked (any dependency is not done)
 */
export function isTaskBlocked(task: Task, taskMap: TaskMap): boolean {
    return task.blockers.some(depId => {
        const dependency = taskMap[depId];
        return dependency && dependency.state !== 'DONE';
    });
}

/**
 * Check if a task is actionable (all dependencies are done)
 */
export function isTaskActionable(task: Task, taskMap: TaskMap): boolean {
    return task.blockers.every(depId => {
        const dependency = taskMap[depId];
        return dependency && dependency.state === 'DONE';
    });
}

/**
 * Get all tasks that depend on the given task (downstream tasks)
 */
export function getDownstreamTasks(taskId: number, graph: DependencyGraph): number[] {
    return graph[taskId] || [];
}

/**
 * Detect if there's a cycle in the dependency graph using DFS
 */
export function hasCycle(tasks: Task[]): boolean {
    // Guard against undefined/null
    if (!tasks || !Array.isArray(tasks)) {
        return false;
    }

    const taskMap = buildTaskMap(tasks);
    const visited = new Set<number>();
    const recursionStack = new Set<number>();

    function dfs(taskId: number): boolean {
        visited.add(taskId);
        recursionStack.add(taskId);

        const task = taskMap[taskId];
        if (!task) return false;

        for (const depId of task.blockers) {
            if (!visited.has(depId)) {
                if (dfs(depId)) return true;
            } else if (recursionStack.has(depId)) {
                return true; // Cycle detected
            }
        }

        recursionStack.delete(taskId);
        return false;
    }

    for (const task of tasks) {
        if (!visited.has(task.id)) {
            if (dfs(task.id)) return true;
        }
    }

    return false;
}
