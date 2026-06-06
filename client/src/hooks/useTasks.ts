import { useCallback, useEffect, useState } from 'react';
import * as taskApi from '../api/tasks';
import type { Task, TaskListMeta, TaskStatusFilter } from '../types/task';

interface UseTasksOptions {
  status: TaskStatusFilter;
  search: string;
}

export function useTasks({ status, search }: UseTasksOptions) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<TaskListMeta>({ total: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskApi.fetchTasks(status, search);
      setTasks(response.tasks);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = async (data: { title: string; description?: string; dueDate?: string }) => {
    await taskApi.createTask(data);
    await loadTasks();
  };

  const editTask = async (
    id: string,
    data: { title: string; description?: string; dueDate?: string }
  ) => {
    await taskApi.updateTask(id, {
      title: data.title,
      description: data.description || null,
      dueDate: data.dueDate || null,
    });
    await loadTasks();
  };

  const toggleComplete = async (id: string) => {
    await taskApi.toggleTask(id);
    await loadTasks();
  };

  const removeTask = async (id: string) => {
    await taskApi.deleteTask(id);
    await loadTasks();
  };

  return {
    tasks,
    meta,
    loading,
    error,
    reload: loadTasks,
    addTask,
    editTask,
    toggleComplete,
    removeTask,
  };
}
