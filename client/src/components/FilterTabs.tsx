import type { TaskStatusFilter } from '../types/task';

interface FilterTabsProps {
  activeFilter: TaskStatusFilter;
  onChange: (filter: TaskStatusFilter) => void;
}

const FILTERS: { value: TaskStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

export function FilterTabs({ activeFilter, onChange }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter tasks">
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
