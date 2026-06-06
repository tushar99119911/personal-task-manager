import { randomUUID } from 'crypto';
import { taskRepository } from '../repositories/taskRepository.js';
import type {
  CreateTaskInput,
  Task,
  TaskListMeta,
  TaskListResponse,
  TaskStatusFilter,
  UpdateTaskInput,
} from '../types/task.js';

const TITLE_MAX_LENGTH = 200;
const DESCRIPTION_MAX_LENGTH = 1000;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class TaskServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'TaskServiceError';
  }
}

function validateTitle(title: unknown): string {
  if (typeof title !== 'string') {
    throw new TaskServiceError('Title is required', 400);
  }
  const trimmed = title.trim();
  if (!trimmed) {
    throw new TaskServiceError('Title is required', 400);
  }
  if (trimmed.length > TITLE_MAX_LENGTH) {
    throw new TaskServiceError(`Title must be at most ${TITLE_MAX_LENGTH} characters`, 400);
  }
  return trimmed;
}

function validateDescription(description: unknown): string | undefined {
  if (description === undefined || description === null || description === '') {
    return undefined;
  }
  if (typeof description !== 'string') {
    throw new TaskServiceError('Description must be a string', 400);
  }
  const trimmed = description.trim();
  if (trimmed.length > DESCRIPTION_MAX_LENGTH) {
    throw new TaskServiceError(
      `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`,
      400
    );
  }
  return trimmed || undefined;
}

function validateDueDate(dueDate: unknown): string | undefined {
  if (dueDate === undefined || dueDate === null || dueDate === '') {
    return undefined;
  }
  if (typeof dueDate !== 'string' || !DATE_REGEX.test(dueDate)) {
    throw new TaskServiceError('Due date must be in YYYY-MM-DD format', 400);
  }
  const parsed = new Date(`${dueDate}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new TaskServiceError('Due date is invalid', 400);
  }
  return dueDate;
}

function sortByCreatedAtDesc(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function buildMeta(tasks: Task[]): TaskListMeta {
  const completed = tasks.filter((t) => t.completed).length;
  return {
    total: tasks.length,
    active: tasks.length - completed,
    completed,
  };
}

function filterTasks(
  tasks: Task[],
  status: TaskStatusFilter,
  search?: string
): Task[] {
  let filtered = tasks;

  if (status === 'active') {
    filtered = filtered.filter((t) => !t.completed);
  } else if (status === 'completed') {
    filtered = filtered.filter((t) => t.completed);
  }

  if (search?.trim()) {
    const query = search.trim().toLowerCase();
    filtered = filtered.filter((t) => t.title.toLowerCase().includes(query));
  }

  return sortByCreatedAtDesc(filtered);
}

export async function getAllTasks(
  status: TaskStatusFilter = 'all',
  search?: string
): Promise<TaskListResponse> {
  const allTasks = await taskRepository.readAll();
  const tasks = filterTasks(allTasks, status, search);
  return {
    tasks,
    meta: buildMeta(allTasks),
  };
}

export async function getTaskById(id: string): Promise<Task> {
  const tasks = await taskRepository.readAll();
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    throw new TaskServiceError('Task not found', 404);
  }
  return task;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const title = validateTitle(input.title);
  const description = validateDescription(input.description);
  const dueDate = validateDueDate(input.dueDate);

  const now = new Date().toISOString();
  const task: Task = {
    id: randomUUID(),
    title,
    description,
    dueDate,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  const tasks = await taskRepository.readAll();
  tasks.push(task);
  await taskRepository.writeAll(tasks);
  return task;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const tasks = await taskRepository.readAll();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new TaskServiceError('Task not found', 404);
  }

  const existing = tasks[index];

  if (input.title !== undefined) {
    existing.title = validateTitle(input.title);
  }
  if (input.description !== undefined) {
    existing.description =
      input.description === null ? undefined : validateDescription(input.description);
  }
  if (input.dueDate !== undefined) {
    existing.dueDate =
      input.dueDate === null ? undefined : validateDueDate(input.dueDate);
  }
  if (input.completed !== undefined) {
    if (typeof input.completed !== 'boolean') {
      throw new TaskServiceError('Completed must be a boolean', 400);
    }
    existing.completed = input.completed;
  }

  existing.updatedAt = new Date().toISOString();
  tasks[index] = existing;
  await taskRepository.writeAll(tasks);
  return existing;
}

export async function toggleTask(id: string): Promise<Task> {
  const tasks = await taskRepository.readAll();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new TaskServiceError('Task not found', 404);
  }

  tasks[index].completed = !tasks[index].completed;
  tasks[index].updatedAt = new Date().toISOString();
  await taskRepository.writeAll(tasks);
  return tasks[index];
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await taskRepository.readAll();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new TaskServiceError('Task not found', 404);
  }
  tasks.splice(index, 1);
  await taskRepository.writeAll(tasks);
}
