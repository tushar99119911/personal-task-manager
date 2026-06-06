import type { Task } from '../types/task';
import { TaskItem } from './TaskItem';
import { EmptyState } from './EmptyState';

interface TaskListProps {
  tasks: Task[];
  hasFilters: boolean;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  actionLoading?: boolean;
}

export function TaskList({
  tasks,
  hasFilters,
  onToggle,
  onEdit,
  onDelete,
  actionLoading,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState hasFilters={hasFilters} />;
  }

  return (
    <ul className="space-y-3" aria-label="Task list">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskItem
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            actionLoading={actionLoading}
          />
        </li>
      ))}
    </ul>
  );
}
