const APIError = require('../../../src/errors/APIError')
const BadGatewayError = require('../../../src/errors/BadGatewayError')
const BadRequestError = require('../../../src/errors/BadRequestError')
const ForbiddenError = require('../../../src/errors/ForbiddenError')
const GatewayTimeoutError = require('../../../src/errors/GatewayTimeoutError')
const InternalServerError = require('../../../src/errors/InternalServerError')
const NotAcceptableError = require('../../../src/errors/NotAcceptableError')
const NotFoundError = require('../../../src/errors/NotFoundError')
const NotImplementedError = require('../../../src/errors/NotImplementedError')
const RequestTimeoutError = require('../../../src/errors/RequestTimeoutError')
const ServiceUnavailableError = require('../../../src/errors/ServiceUnavailableError')
const UnauthorizedError = require('../../../src/errors/UnauthorizedError')

const testArr = [
  { ErrorClass: APIError, status: 500, message: 'API Error', error: 'Error message', name: 'APIError' },
  { ErrorClass: BadGatewayError, status: 502, message: 'Bad Gateway', error: 'Error message', name: 'BadGatewayError' },
  { ErrorClass: BadRequestError, status: 503, message: 'Bad Request', error: 'Error message', name: 'BadRequestError' },
  { ErrorClass: ForbiddenError, status: 403, message: 'Forbidden', error: 'Error message', name: 'ForbiddenError' },
  { ErrorClass: GatewayTimeoutError, status: 500, message: 'Gateway Timeout', error: 'Error message', name: 'GatewayTimeoutError' },
  { ErrorClass: InternalServerError, status: 500, message: 'Internal Server Error', error: 'Error message', name: 'InternalServerError' },
  { ErrorClass: NotAcceptableError, status: 406, message: 'Not Acceptable', error: 'Error message', name: 'NotAcceptableError' },
  { ErrorClass: NotFoundError, status: 404, message: 'Not Found', error: 'Error message', name: 'NotFoundError' },
  { ErrorClass: NotImplementedError, status: 501, message: 'Not Implemented', error: 'Error message', name: 'NotImplementedError' },
  { ErrorClass: RequestTimeoutError, status: 408, message: 'Request Timeout', error: 'Error message', name: 'RequestTimeoutError' },
  { ErrorClass: ServiceUnavailableError, status: 503, message: 'Service Unavailable', error: 'Error message', name: 'ServiceUnavailableError' },
  { ErrorClass: UnauthorizedError, status: 401, message: 'Unauthorized', error: 'Error message', name: 'UnauthorizedError' }
]

module.exports = testArr
