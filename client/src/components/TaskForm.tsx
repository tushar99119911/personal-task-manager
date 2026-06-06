import { useEffect, useState } from 'react';
import type { Task, TaskFormData } from '../types/task';

interface TaskFormProps {
  editingTask: Task | null;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancelEdit: () => void;
  loading?: boolean;
}

const emptyForm: TaskFormData = {
  title: '',
  description: '',
  dueDate: '',
};

export function TaskForm({ editingTask, onSubmit, onCancelEdit, loading }: TaskFormProps) {
  const [form, setForm] = useState<TaskFormData>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title,
        description: editingTask.description || '',
        dueDate: editingTask.dueDate || '',
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [editingTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    setError(null);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: form.dueDate,
      });
      if (!editingTask) {
        setForm(emptyForm);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        {editingTask ? 'Edit Task' : 'Add New Task'}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="What needs to be done?"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            disabled={loading}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Optional details..."
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="dueDate" className="mb-1 block text-sm font-medium text-slate-700">
            Due Date
          </label>
          <input
            id="dueDate"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : editingTask ? 'Save Changes' : 'Add Task'}
        </button>
        {editingTask && (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={loading}
            className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
