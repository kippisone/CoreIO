'use strict'

const APIError = require('./APIError')

/**
 * Request Timeout error class
 *
 * Creates a 408 Request Timeout error
 *
 * @class RequestTimeoutError
 * @extends Error
 */
class RequestTimeoutError extends APIError {
  constructor (text) {
    super('Request Timeout', text)
    this.status = 408
  }
}

module.exports = RequestTimeoutError
