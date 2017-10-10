'use strict'

const APIError = require('./APIError')

/**
 * Forbidden error class
 *
 * Creates a 403 Forbidden error
 *
 * @class ForbiddenError
 * @extends Error
 */
class ForbiddenError extends APIError {
  constructor (text) {
    super('Forbidden', text)
    this.status = 403
  }
}

module.exports = ForbiddenError
