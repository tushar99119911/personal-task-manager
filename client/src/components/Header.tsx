import { TaskStats } from './TaskStats';
import type { TaskListMeta } from '../types/task';

interface HeaderProps {
  meta: TaskListMeta;
}

export function Header({ meta }: HeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Task Manager</h1>
        <p className="mt-1 text-sm text-slate-500">Organize your personal to-do list</p>
      </div>
      <TaskStats meta={meta} />
    </header>
  );
}
