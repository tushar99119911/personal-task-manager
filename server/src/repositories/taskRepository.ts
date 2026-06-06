import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Task } from '../types/task.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA_DIR = path.resolve(__dirname, '../../data');

function getDataFile(): string {
  return process.env.DATA_FILE
    ? path.resolve(process.env.DATA_FILE)
    : path.join(DEFAULT_DATA_DIR, 'tasks.json');
}

let writeLock: Promise<void> = Promise.resolve();

export class TaskRepository {
  private async ensureDataFile(): Promise<void> {
    const dataFile = getDataFile();
    await mkdir(path.dirname(dataFile), { recursive: true });
    try {
      await readFile(dataFile, 'utf-8');
    } catch {
      await writeFile(dataFile, '[]', 'utf-8');
    }
  }

  async readAll(): Promise<Task[]> {
    await this.ensureDataFile();
    const raw = await readFile(getDataFile(), 'utf-8');
    return JSON.parse(raw) as Task[];
  }

  async writeAll(tasks: Task[]): Promise<void> {
    await this.ensureDataFile();
    const dataFile = getDataFile();
    const operation = writeLock.then(async () => {
      await writeFile(dataFile, JSON.stringify(tasks, null, 2), 'utf-8');
    });
    writeLock = operation.catch(() => {});
    await operation;
  }
}

export const taskRepository = new TaskRepository();
