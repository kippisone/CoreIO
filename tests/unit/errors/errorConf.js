'use strict'

const BadGatewayError = require('../../../lib/errors/BadGatewayError')
const BadRequestError = require('../../../lib/errors/BadRequestError')
const ForbiddenError = require('../../../lib/errors/ForbiddenError')
const GatewayTimeoutError = require('../../../lib/errors/GatewayTimeoutError')
const InternalServerError = require('../../../lib/errors/InternalServerError')
const NotAcceptableError = require('../../../lib/errors/NotAcceptableError')
const NotFoundError = require('../../../lib/errors/NotFoundError')
const NotImplementedError = require('../../../lib/errors/NotImplementedError')
const RequestTimeoutError = require('../../../lib/errors/RequestTimeoutError')
const ServiceUnavailableError = require('../../../lib/errors/ServiceUnavailableError')
const UnauthorizedError = require('../../../lib/errors/UnauthorizedError')

const testArr = [
  { ErrorClass: BadGatewayError, status: 502, message: 'Bad Gateway', error: 'Error message', name: 'BadGatewayError' },
  { ErrorClass: BadRequestError, status: 400, message: 'Bad Request', error: 'Error message', name: 'BadRequestError' },
  { ErrorClass: ForbiddenError, status: 403, message: 'Forbidden', error: 'Error message', name: 'ForbiddenError' },
  { ErrorClass: GatewayTimeoutError, status: 502, message: 'Gateway Timeout', error: 'Error message', name: 'GatewayTimeoutError' },
  { ErrorClass: InternalServerError, status: 500, message: 'Internal Server Error', error: 'Error message', name: 'InternalServerError' },
  { ErrorClass: NotAcceptableError, status: 406, message: 'Not Acceptable', error: 'Error message', name: 'NotAcceptableError' },
  { ErrorClass: NotFoundError, status: 404, message: 'Not Found', error: 'Error message', name: 'NotFoundError' },
  { ErrorClass: NotImplementedError, status: 501, message: 'Not Implemented', error: 'Error message', name: 'NotImplementedError' },
  { ErrorClass: RequestTimeoutError, status: 408, message: 'Request Timeout', error: 'Error message', name: 'RequestTimeoutError' },
  { ErrorClass: ServiceUnavailableError, status: 503, message: 'Service Unavailable', error: 'Error message', name: 'ServiceUnavailableError' },
  { ErrorClass: UnauthorizedError, status: 401, message: 'Unauthorized', error: 'Error message', name: 'UnauthorizedError' }
]

module.exports = testArr
