import type { TaskListMeta } from '../types/task';

interface TaskStatsProps {
  meta: TaskListMeta;
}

export function TaskStats({ meta }: TaskStatsProps) {
  return (
    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
      <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
        {meta.active} active
      </span>
      <span className="rounded-full bg-green-50 px-3 py-1 font-medium text-green-700">
        {meta.completed} completed
      </span>
      <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
        {meta.total} total
      </span>
    </div>
  );
}
