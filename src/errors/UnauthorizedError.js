'use strict'

const APIError = require('./APIError')

/**
 * Unauthorized error class
 *
 * Creates a 401 Unauthorized error
 *
 * @class UnauthorizedError
 * @extends Error
 */
class UnauthorizedError extends APIError {
  constructor (text) {
    super('Unauthorized', text)
    this.status = 401
  }
}

module.exports = UnauthorizedError
