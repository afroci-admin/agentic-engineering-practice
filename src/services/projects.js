const projectsQueries = require('../db/queries/projects');
const { httpError } = require('../utils/errors');

function listProjects() {
  return projectsQueries.findAll();
}

function getProject(id) {
  const project = projectsQueries.findById(id);
  if (!project) throw httpError(404, 'Project not found');
  return project;
}

function getProjectStats(projectId) {
  const stats = { total: 0, active: 0, completed: 0, archived: 0 };
  for (const row of projectsQueries.countTasksByStatus(projectId)) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }
  return stats;
}

function getProjectWithStats(id) {
  const project = getProject(id);
  return { ...project, stats: getProjectStats(id) };
}

function createProject({ name, description, owner_id }) {
  return projectsQueries.insert(name, description || null, owner_id || null);
}

function updateProject(id, data) {
  const existing = getProject(id);
  const name = data.name !== undefined ? data.name : existing.name;
  const description = data.description !== undefined ? data.description : existing.description;
  const ownerId = data.owner_id !== undefined ? data.owner_id : existing.owner_id;
  return projectsQueries.update(id, name, description, ownerId);
}

function deleteProject(id) {
  if (projectsQueries.remove(id) === 0) throw httpError(404, 'Project not found');
  return { deleted: true };
}

module.exports = {
  listProjects,
  getProjectWithStats,
  createProject,
  updateProject,
  deleteProject
};
