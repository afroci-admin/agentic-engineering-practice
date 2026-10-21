process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const { db } = require('../src/db/connection');
const { createSchema } = require('../src/db/schema');

beforeAll(() => {
  createSchema(db);
});

beforeEach(() => {
  db.exec('DELETE FROM task_tags; DELETE FROM comments; DELETE FROM tasks; DELETE FROM projects; DELETE FROM users; DELETE FROM tags;');
  db.prepare('INSERT INTO users (id, name, email) VALUES (1, ?, ?)').run('Test User', 'test@example.com');
  db.prepare("INSERT INTO tasks (id, title) VALUES (1, 'Task A')").run();
});

describe('GET /tasks/:id/comments', () => {
  test('returns the comments on a task with the author name', async () => {
    db.prepare("INSERT INTO comments (task_id, user_id, body) VALUES (1, 1, 'First')").run();
    const res = await request(app).get('/tasks/1/comments');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ body: 'First', user_name: 'Test User' });
  });

  test('returns an empty list for a task with no comments', async () => {
    const res = await request(app).get('/tasks/1/comments');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns 404 for a nonexistent task', async () => {
    const res = await request(app).get('/tasks/999/comments');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Task not found' });
  });
});

describe('POST /tasks/:id/comments', () => {
  test('adds a comment to a task', async () => {
    const res = await request(app)
      .post('/tasks/1/comments')
      .send({ user_id: 1, body: 'Looks good' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ task_id: 1, user_id: 1, body: 'Looks good', user_name: 'Test User' });
  });

  test('rejects a comment without a body', async () => {
    const res = await request(app).post('/tasks/1/comments').send({ user_id: 1 });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'body is required' });
  });

  test('rejects a comment without a user_id', async () => {
    const res = await request(app).post('/tasks/1/comments').send({ body: 'Hi' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'user_id is required' });
  });

  test('rejects a comment from an unknown user', async () => {
    const res = await request(app).post('/tasks/1/comments').send({ user_id: 999, body: 'Hi' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'user not found' });
  });

  test('returns 404 for a nonexistent task even when the body is invalid', async () => {
    const res = await request(app).post('/tasks/999/comments').send({});
    expect(res.status).toBe(404);
  });
});
