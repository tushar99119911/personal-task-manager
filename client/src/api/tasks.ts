import { API_BASE_URL } from '../utils/constants';
import type {
  ApiError,
  Task,
  TaskListResponse,
  TaskStatusFilter,
} from '../types/task';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'Something went wrong';
    try {
      const error = (await response.json()) as ApiError;
      message = error.error || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchTasks(
  status: TaskStatusFilter = 'all',
  search?: string
): Promise<TaskListResponse> {
  const params = new URLSearchParams();
  if (status !== 'all') {
    params.set('status', status);
  }
  if (search?.trim()) {
    params.set('search', search.trim());
  }

  const query = params.toString();
  const url = query ? `${API_BASE_URL}/tasks?${query}` : `${API_BASE_URL}/tasks`;
  const response = await fetch(url);
  return handleResponse<TaskListResponse>(response);
}

export async function createTask(data: {
  title: string;
  description?: string;
  dueDate?: string;
}): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Task>(response);
}

export async function updateTask(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    dueDate?: string | null;
    completed?: boolean;
  }
): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Task>(response);
}

export async function toggleTask(id: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}/toggle`, {
    method: 'PATCH',
  });
  return handleResponse<Task>(response);
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<void>(response);
}
