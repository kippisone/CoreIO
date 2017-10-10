'use strict'

const APIError = require('./APIError')

/**
 * Bad Request error class
 *
 * Creates a 400 Bad Request error
 *
 * @class BadRequestError
 * @extends Error
 */
class BadRequestError extends APIError {
  constructor (text) {
    super('Bad Request', text)
    this.status = 400
  }
}

module.exports = BadRequestError
