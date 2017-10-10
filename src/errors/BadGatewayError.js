'use strict'

const APIError = require('./APIError')

/**
 * Bad Gateway error class
 *
 * Creates a 502 Bad Gateway error
 *
 * @class BadGatewayError
 * @extends Error
 */
class BadGatewayError extends APIError {
  constructor (text) {
    super('Bad Gateway', text)
    this.status = 502
  }
}

module.exports = BadGatewayError
