/**
 * Builds an Error carrying an HTTP status code, for the error handler to turn into a response.
 * @param {number} status - HTTP status code to attach to the error.
 * @param {string} message - Error message.
 * @returns {Error} An Error with its `status` property set.
 */
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Checks whether a database error is a UNIQUE constraint violation.
 * @param {Error} err - Error thrown by the database.
 * @returns {boolean} True if the error message mentions a UNIQUE constraint.
 */
function isUniqueViolation(err) {
  return Boolean(err.message && err.message.includes('UNIQUE'));
}

module.exports = { httpError, isUniqueViolation };
