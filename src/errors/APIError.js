'use strict'

/**
 * Generic API error class
 *
 * Generates a generic API error class
 *
 * @class APIError
 * @extends Error
 */
class APIError extends Error {
  constructor (message, error) {
    super(message)
    this.status = 500
    this.error = error
    this.level = 1
  }

  toJSON (level) {
    level = level || this.level

    const err = {
      status: this.status,
      type: this.constructor.name,
      message: this.message
    }

    if (level >= 2) {
      err.error = this.error
    }

    if (level >= 3) {
      err.stack = this.stack
    }

    return err
  }

  toString (level) {
    level = level || this.level
    
    let err = `${this.status} ${this.message}`

    if (level >= 2) {
      err += `\n\n${this.error}`
    }

    if (level >= 3) {
      err += `\n\n${this.stack}`
    }

    return err
  }
}

module.exports = APIError
