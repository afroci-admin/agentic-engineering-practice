const usersQueries = require('../db/queries/users');
const notifications = require('./notifications');
const { validateEmail } = require('../utils/validation');
const { httpError, isUniqueViolation } = require('../utils/errors');

function listUsers() {
  return usersQueries.findAll();
}

function getUser(id) {
  const user = usersQueries.findById(id);
  if (!user) throw httpError(404, 'User not found');
  return user;
}

async function createUser({ name, email }) {
  if (!validateEmail(email)) throw httpError(400, 'Invalid email address');

  let user;
  try {
    user = usersQueries.insert(name, email);
  } catch (err) {
    if (isUniqueViolation(err)) throw httpError(409, 'email already exists');
    throw err;
  }

  await notifications.sendWelcomeEmail(user);
  return user;
}

function updateUser(id, data) {
  const existing = getUser(id);
  const name = data.name !== undefined ? data.name : existing.name;
  const email = data.email !== undefined ? data.email : existing.email;
  return usersQueries.update(id, name, email);
}

function deleteUser(id) {
  if (usersQueries.remove(id) === 0) throw httpError(404, 'User not found');
  return { deleted: true };
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
