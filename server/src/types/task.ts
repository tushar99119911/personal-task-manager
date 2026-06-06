export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  completed?: boolean;
}

export type TaskStatusFilter = 'all' | 'active' | 'completed';

export interface TaskListMeta {
  total: number;
  active: number;
  completed: number;
}

export interface TaskListResponse {
  tasks: Task[];
  meta: TaskListMeta;
}

export interface ApiError {
  error: string;
  statusCode: number;
}
