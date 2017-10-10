'use strict'

const APIError = require('./APIError')

/**
 * Not Implemented error class
 *
 * Creates a 501 Not Implemented error
 *
 * @class NotImplementedError
 * @extends Error
 */
class NotImplementedError extends APIError {
  constructor (text) {
    super('Not Implemented', text)
    this.status = 501
  }
}

module.exports = NotImplementedError
