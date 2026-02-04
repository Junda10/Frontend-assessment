import type { Task, TaskState } from '@/types/task';
import { TaskItem } from './TaskItem';
import { buildTaskMap } from '@/domain/dependencies';

interface TaskListProps {
    tasks: Task[];
    onStateChange: (taskId: number, newState: TaskState) => void;
}

export function TaskList({ tasks, onStateChange }: TaskListProps) {
    const taskMap = buildTaskMap(tasks);

    if (!tasks || tasks.length === 0) {
        return (
            <div className="empty-state">
                <p>No tasks to display</p>
            </div>
        );
    }

    const groupedTasks = tasks.reduce((acc, task) => {
        if (!acc[task.state]) {
            acc[task.state] = [];
        }
        acc[task.state].push(task);
        return acc;
    }, {} as Record<TaskState, Task[]>);

    const stateOrder: TaskState[] = ['BLOCKED', 'IN_PROGRESS', 'TODO', 'BACKLOG', 'DONE'];

    return (
        <div className="task-list">
            {stateOrder.map(state => {
                const stateTasks = groupedTasks[state];
                if (!stateTasks || stateTasks.length === 0) return null;

                return (
                    <div key={state} className="task-group">
                        <h2 className="group-title">
                            {state.replace('_', ' ').toUpperCase()} ({stateTasks.length})
                        </h2>
                        <div className="task-grid">
                            {stateTasks.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    taskMap={taskMap}
                                    onStateChange={onStateChange}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
