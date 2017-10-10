'use strict'

const APIError = require('./APIError')

/**
 * Internal Server Error error class
 *
 * Creates a 500 Internal Server Error error
 *
 * @class InternalServerError
 * @extends Error
 */
class InternalServerError extends APIError {
  constructor (text) {
    super('Internal Server Error', text)
    this.status = 500
  }
}

module.exports = InternalServerError
