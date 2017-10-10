'use strict'

const APIError = require('./APIError')

/**
 * Gateway Timeout error class
 *
 * Creates a 502 Gateway Timeout error
 *
 * @class GatewayTimeoutError
 * @extends Error
 */
class GatewayTimeoutError extends APIError {
  constructor (text) {
    super('Gateway Timeout', text)
    this.status = 502
  }
}

module.exports = GatewayTimeoutError
