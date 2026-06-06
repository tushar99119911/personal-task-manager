import { useState } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { TaskForm } from './components/TaskForm';
import { FilterTabs } from './components/FilterTabs';
import { TaskList } from './components/TaskList';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBanner } from './components/ErrorBanner';
import { ConfirmDialog } from './components/ConfirmDialog';
import { useTasks } from './hooks/useTasks';
import type { Task, TaskFormData, TaskStatusFilter } from './types/task';

export default function App() {
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [search, setSearch] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { tasks, meta, loading, error, reload, addTask, editTask, toggleComplete, removeTask } =
    useTasks({ status: statusFilter, search });

  const handleFormSubmit = async (data: TaskFormData) => {
    setActionLoading(true);
    try {
      if (editingTask) {
        await editTask(editingTask.id, {
          title: data.title,
          description: data.description || undefined,
          dueDate: data.dueDate || undefined,
        });
        setEditingTask(null);
      } else {
        await addTask({
          title: data.title,
          description: data.description || undefined,
          dueDate: data.dueDate || undefined,
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    setActionLoading(true);
    try {
      await toggleComplete(id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    setActionLoading(true);
    try {
      await removeTask(taskToDelete.id);
      if (editingTask?.id === taskToDelete.id) {
        setEditingTask(null);
      }
      setTaskToDelete(null);
    } finally {
      setActionLoading(false);
    }
  };

  const hasFilters = statusFilter !== 'all' || search.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Header meta={meta} />

        {error && <ErrorBanner message={error} onRetry={reload} />}

        <div className="mb-6 space-y-4">
          <SearchBar value={search} onChange={setSearch} />
          <TaskForm
            editingTask={editingTask}
            onSubmit={handleFormSubmit}
            onCancelEdit={() => setEditingTask(null)}
            loading={actionLoading}
          />
        </div>

        <div className="mb-4">
          <FilterTabs activeFilter={statusFilter} onChange={setStatusFilter} />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <TaskList
            tasks={tasks}
            hasFilters={hasFilters}
            onToggle={handleToggle}
            onEdit={setEditingTask}
            onDelete={setTaskToDelete}
            actionLoading={actionLoading}
          />
        )}

        <ConfirmDialog
          isOpen={!!taskToDelete}
          title="Delete task?"
          message={
            taskToDelete
              ? `Are you sure you want to delete "${taskToDelete.title}"? This cannot be undone.`
              : ''
          }
          onConfirm={handleDeleteConfirm}
          onCancel={() => setTaskToDelete(null)}
          loading={actionLoading}
        />
      </main>
    </div>
  );
}
