import type { Task, TaskState, TaskMap } from '@/types/task';
import { isTaskActionable } from '@/domain/dependencies';

interface TaskItemProps {
    task: Task;
    taskMap: TaskMap;
    onStateChange: (taskId: number, newState: TaskState) => void;
}

const STATE_TRANSITIONS: Record<TaskState, TaskState[]> = {
    TODO: ['IN_PROGRESS', 'DONE'],
    IN_PROGRESS: ['TODO', 'DONE'],
    DONE: ['TODO', 'IN_PROGRESS'],
    BLOCKED: [],
    BACKLOG: ['TODO', 'IN_PROGRESS'],
};

export function TaskItem({ task, taskMap, onStateChange }: TaskItemProps) {
    const isActionable = isTaskActionable(task, taskMap);
    const isBlocked = task.state === 'BLOCKED';
    const possibleTransitions = STATE_TRANSITIONS[task.state] || [];

    const dependencyStatus = task.blockers.map(depId => {
        const dep = taskMap[depId];
        return dep ? { id: depId, title: dep.title, state: dep.state } : null;
    }).filter(Boolean);

    const stateClass = `state-${task.state.toLowerCase()}`;

    return (
        <div className={`task-item ${stateClass} ${isBlocked ? 'blocked' : ''}`}>
            <div className="task-header">
                <h3 className="task-title">{task.title}</h3>
                <span className={`task-state-badge ${stateClass}`}>
                    {task.state.replace('_', ' ')}
                </span>
            </div>

            <p className="task-description">{task.description}</p>

            {task.due_date && (
                <div className="task-meta">
                    <span className={`due-date ${new Date(task.due_date) < new Date() && task.state !== 'DONE' ? 'overdue' : ''}`}>
                        Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                </div>
            )}

            {task.blockers.length > 0 && (
                <div className="task-dependencies">
                    <strong>Blockers:</strong>
                    <ul className="dependency-list">
                        {dependencyStatus.map(dep => dep && (
                            <li key={dep.id} className={`dependency-item state-${dep.state.toLowerCase()}`}>
                                {dep.title} <span className="dependency-state">({dep.state.replace('_', ' ')})</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="task-actions">
                {isBlocked ? (
                    <div className="blocked-message">
                        Task is blocked - complete dependencies first
                    </div>
                ) : (
                    <>
                        <span className="action-label">Change state to:</span>
                        <div className="state-buttons">
                            {possibleTransitions.map(state => (
                                <button
                                    key={state}
                                    className={`state-button state-${state.toLowerCase()}`}
                                    onClick={() => onStateChange(task.id, state)}
                                    disabled={!isActionable}
                                >
                                    {state.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
