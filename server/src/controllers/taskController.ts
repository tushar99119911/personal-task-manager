import type { Request, Response, NextFunction } from 'express';
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  TaskServiceError,
  toggleTask,
  updateTask,
} from '../services/taskService.js';
import type { TaskStatusFilter } from '../types/task.js';

function parseStatus(value: unknown): TaskStatusFilter {
  if (value === 'active' || value === 'completed') {
    return value;
  }
  return 'all';
}

function parseId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export async function listTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const status = parseStatus(req.query.status);
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const result = await getAllTasks(status, search);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await getTaskById(parseId(req.params.id));
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function createTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export async function updateTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await updateTask(parseId(req.params.id), req.body);
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function toggleTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await toggleTask(parseId(req.params.id));
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function deleteTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteTask(parseId(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export function handleServiceError(error: unknown, _req: Request, res: Response, next: NextFunction) {
  if (error instanceof TaskServiceError) {
    res.status(error.statusCode).json({ error: error.message, statusCode: error.statusCode });
    return;
  }
  next(error);
}
