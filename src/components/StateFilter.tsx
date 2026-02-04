import type { TaskState } from '@/types/task';

interface StateFilterProps {
    currentFilter: TaskState | 'all';
    onFilterChange: (filter: TaskState | 'all') => void;
}

const FILTERS: Array<{ value: TaskState | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'BACKLOG', label: 'Backlog' },
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Done' },
    { value: 'BLOCKED', label: 'Blocked' },
];

export function StateFilter({ currentFilter, onFilterChange }: StateFilterProps) {
    return (
        <div className="state-filter">
            <span className="filter-label">Filter by state:</span>
            <div className="filter-buttons">
                {FILTERS.map(filter => (
                    <button
                        key={filter.value}
                        className={`filter-button ${currentFilter === filter.value ? 'active' : ''} ${filter.value !== 'all' ? `state-${filter.value}` : ''}`}
                        onClick={() => onFilterChange(filter.value)}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
