'use strict'

const APIError = require('./APIError')

/**
 * Service Unavailable error class
 *
 * Creates a 503 Service Unavailable error
 *
 * @class ServiceUnavailableError
 * @extends Error
 */
class ServiceUnavailableError extends APIError {
  constructor (text) {
    super('Service Unavailable', text)
    this.status = 503
  }
}

module.exports = ServiceUnavailableError
