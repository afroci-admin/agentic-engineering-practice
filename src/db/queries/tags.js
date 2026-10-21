const { db } = require('../connection');

function findAll() {
  return db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
}

function findById(id) {
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
}

function findByTaskId(taskId) {
  return db.prepare(
    'SELECT t.* FROM tags t JOIN task_tags tt ON tt.tag_id = t.id WHERE tt.task_id = ?'
  ).all(taskId);
}

function insert(name) {
  const result = db.prepare('INSERT INTO tags (name) VALUES (?)').run(name);
  return findById(result.lastInsertRowid);
}

function attachToTask(taskId, tagId) {
  db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskId, tagId);
}

function detachFromTask(taskId, tagId) {
  return db.prepare(
    'DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?'
  ).run(taskId, tagId).changes;
}

module.exports = { findAll, findById, findByTaskId, insert, attachToTask, detachFromTask };
