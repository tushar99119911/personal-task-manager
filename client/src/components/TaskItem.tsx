import type { Task } from '../types/task';
import { formatDate, isOverdue } from '../utils/date';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  actionLoading?: boolean;
}

export function TaskItem({ task, onToggle, onEdit, onDelete, actionLoading }: TaskItemProps) {
  const overdue = isOverdue(task.dueDate, task.completed);

  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
        overdue ? 'border-l-4 border-l-red-500 border-slate-200' : 'border-slate-200'
      } ${task.completed ? 'opacity-80' : ''}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          disabled={actionLoading}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-base font-semibold text-slate-900 ${
                task.completed ? 'line-through text-slate-500' : ''
              }`}
            >
              {task.title}
            </h3>
            {overdue && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                Overdue
              </span>
            )}
          </div>

          {task.description && (
            <p className={`mt-1 text-sm text-slate-600 ${task.completed ? 'line-through' : ''}`}>
              {task.description}
            </p>
          )}

          {task.dueDate && (
            <p className={`mt-2 text-xs ${overdue ? 'font-medium text-red-600' : 'text-slate-500'}`}>
              Due: {formatDate(task.dueDate)}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onEdit(task)}
            disabled={actionLoading}
            aria-label={`Edit "${task.title}"`}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            disabled={actionLoading}
            aria-label={`Delete "${task.title}"`}
            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
