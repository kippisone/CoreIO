'use strict'

const APIError = require('./APIError')

/**
 * Not Found error class
 *
 * Creates a 404 Not Found error
 *
 * @class NotFoundError
 * @extends Error
 */
class NotFoundError extends APIError {
  constructor (text) {
    super('Not Found', text)
    this.status = 404
  }
}

module.exports = NotFoundError
