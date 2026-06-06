export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListMeta {
  total: number;
  active: number;
  completed: number;
}

export interface TaskListResponse {
  tasks: Task[];
  meta: TaskListMeta;
}

export type TaskStatusFilter = 'all' | 'active' | 'completed';

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
}

export interface ApiError {
  error: string;
  statusCode: number;
}
