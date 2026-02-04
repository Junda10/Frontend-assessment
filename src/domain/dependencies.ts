import type { Task, TaskMap, DependencyGraph } from '@/types/task';

export function buildDependencyGraph(tasks: Task[]): DependencyGraph {
    const graph: DependencyGraph = {};

    if (!tasks || !Array.isArray(tasks)) {
        return graph;
    }
    tasks.forEach(task => {
        graph[task.id] = [];
    });

    tasks.forEach(task => {
        task.blockers.forEach(depId => {
            if (graph[depId]) {
                graph[depId].push(task.id);
            }
        });
    });

    return graph;
}

export function buildTaskMap(tasks: Task[]): TaskMap {
    const map: TaskMap = {};

    if (!tasks || !Array.isArray(tasks)) {
        return map;
    }

    tasks.forEach(task => {
        map[task.id] = task;
    });
    return map;
}

export function isTaskBlocked(task: Task, taskMap: TaskMap): boolean {
    return task.blockers.some(depId => {
        const dependency = taskMap[depId];
        return dependency && dependency.state !== 'DONE';
    });
}

export function isTaskActionable(task: Task, taskMap: TaskMap): boolean {
    return task.blockers.every(depId => {
        const dependency = taskMap[depId];
        return dependency && dependency.state === 'DONE';
    });
}

export function getDownstreamTasks(taskId: number, graph: DependencyGraph): number[] {
    return graph[taskId] || [];
}

export function hasCycle(tasks: Task[]): boolean {
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
                return true;
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
