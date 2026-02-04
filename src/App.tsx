import { useState, useEffect } from 'react';
import type { TaskState } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';
import { TaskProvider } from '@/context/TaskContext';
import { TaskList } from '@/components/TaskList';
import { StateFilter } from '@/components/StateFilter';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import './styles/app.css';

function AppContent() {
    const { tasks, loading, error, updateTaskState, refreshTasks } = useTasks();
    const [filter, setFilter] = useState<TaskState | 'all'>('all');
    const [displayError, setDisplayError] = useState<string | null>(null);

    useEffect(() => {
        if (error) {
            setDisplayError(error);
        }
    }, [error]);

    const filteredTasks = filter === 'all'
        ? tasks
        : tasks?.filter(task => task.state.toLowerCase() === filter.toLowerCase()) ?? [];

    return (
        <div className="app">
            <header className="app-header">
                <h1>Smart To-Do List</h1>
                <p className="subtitle">Dependency-aware task management</p>
            </header>

            <ErrorDisplay
                error={displayError}
                onDismiss={() => setDisplayError(null)}
            />

            <main className="app-main">
                <div className="controls">
                    <StateFilter currentFilter={filter} onFilterChange={setFilter} />
                    <button className="refresh-button" onClick={refreshTasks}>
                        🔄 Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading tasks...</p>
                    </div>
                ) : (
                    <TaskList tasks={filteredTasks} onStateChange={updateTaskState} />
                )}
            </main>

            <footer className="app-footer">
                <p>
                    Total tasks: {tasks?.length ?? 0} |
                    Showing: {filteredTasks?.length ?? 0}
                </p>
            </footer>
        </div>
    );
}

function App() {
    return (
        <TaskProvider>
            <AppContent />
        </TaskProvider>
    );
}

export default App;
