import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { mkdtemp, rm } from 'fs/promises';
import path from 'path';
import os from 'os';

describe('Tasks API', () => {
  let app: typeof import('../src/index.js').default;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'tasks-test-'));
    process.env.DATA_FILE = path.join(tempDir, 'tasks.json');
    process.env.NODE_ENV = 'test';
    const module = await import('../src/index.js');
    app = module.default;
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
    delete process.env.DATA_FILE;
    delete process.env.NODE_ENV;
  });

  it('returns 400 when creating a task without a title', async () => {
    const response = await request(app).post('/api/tasks').send({ title: '   ' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Title is required');
  });

  it('supports full CRUD lifecycle', async () => {
    const createResponse = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Buy groceries',
        description: 'Milk and eggs',
        dueDate: '2026-06-15',
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.title).toBe('Buy groceries');
    const taskId = createResponse.body.id;

    const listResponse = await request(app).get('/api/tasks');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.tasks).toHaveLength(1);
    expect(listResponse.body.meta.active).toBe(1);

    const toggleResponse = await request(app).patch(`/api/tasks/${taskId}/toggle`);
    expect(toggleResponse.status).toBe(200);
    expect(toggleResponse.body.completed).toBe(true);

    const updateResponse = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ title: 'Buy groceries and bread' });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.title).toBe('Buy groceries and bread');

    const deleteResponse = await request(app).delete(`/api/tasks/${taskId}`);
    expect(deleteResponse.status).toBe(204);

    const emptyList = await request(app).get('/api/tasks');
    expect(emptyList.body.tasks).toHaveLength(0);
  });

  it('filters tasks by status and search query', async () => {
    await request(app).post('/api/tasks').send({ title: 'Write report' });
    const completed = await request(app).post('/api/tasks').send({ title: 'Pay bills' });
    await request(app).patch(`/api/tasks/${completed.body.id}/toggle`);

    const activeResponse = await request(app).get('/api/tasks?status=active');
    expect(activeResponse.body.tasks).toHaveLength(1);
    expect(activeResponse.body.tasks[0].title).toBe('Write report');

    const searchResponse = await request(app).get('/api/tasks?search=bill');
    expect(searchResponse.body.tasks).toHaveLength(1);
    expect(searchResponse.body.tasks[0].title).toBe('Pay bills');
  });
});
