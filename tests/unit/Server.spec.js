'use strict'

const inspect = require('inspect.js')
const sinon = require('sinon')
inspect.useSinon(sinon)

const CoreIO = require('../../')

const BadGateway = require('../../src/errors/BadGateway')
const InternalServerError = require('../../src/errors/InternalServerError')

describe('Server', () => {
  describe('use()', () => {
    let server

    beforeEach(() => {
      server = new CoreIO.Server({
        noServer: true
      })
    })

    afterEach(() => {
      server.removeAllRoutes(true)
    })

    it('register a middleware under a specific path', () => {
      const fn = sinon.spy((req, res, next) => { next() })
      const fn2 = sinon.spy((req, res, next) => { next() })

      server.use(fn)
      server.use(fn2)

      return server.dispatch({
        path: '/foo/bla'
      }, {}).then(() => {
        inspect(fn).wasCalledOnce()
        inspect(fn2).wasCalledOnce()
      })
    })

    it('registers multiple middlewares under a specific path', () => {
      const fn = sinon.spy((req, res, next) => { next() })
      const fn2 = sinon.spy((req, res, next) => { next() })
      const fn3 = sinon.spy((req, res, next) => { next() })
      const fn4 = sinon.spy((req, res, next) => { next() })

      server.use(fn, fn2, fn3, fn4)

      return server.dispatch({
        path: '/foo/bla'
      }, {}).then(() => {
        inspect(fn).wasCalledOnce()
        inspect(fn2).wasCalledOnce()
        inspect(fn3).wasCalledOnce()
        inspect(fn4).wasCalledOnce()
      })
    })
  })

  describe('use([path], fn)', () => {
    let server

    beforeEach(() => {
      server = new CoreIO.Server({
        noServer: true
      })
    })

    afterEach(() => {
      server.removeAllRoutes(true)
    })

    it('register a middleware under a specific path', () => {
      const fn = sinon.spy((req, res, next) => { next() })
      const fn2 = sinon.spy((req, res, next) => { next() })

      server.use('/foo', fn)
      server.use('/bar', fn)

      return server.dispatch({
        path: '/foo/bla'
      }, {}).then(() => {
        inspect(fn).wasCalledOnce()
        inspect(fn2).wasNotCalled()
      })
    })

    it('registers multiple middlewares under a specific path', () => {
      const fn = sinon.spy((req, res, next) => { next() })
      const fn2 = sinon.spy((req, res, next) => { next() })
      const fn3 = sinon.spy((req, res, next) => { next() })
      const fn4 = sinon.spy((req, res, next) => { next() })

      server.use('/foo', fn, fn2, fn3, fn4)

      return server.dispatch({
        path: '/foo/bla'
      }, {}).then(() => {
        inspect(fn).wasCalledOnce()
        inspect(fn2).wasCalledOnce()
        inspect(fn3).wasCalledOnce()
        inspect(fn4).wasCalledOnce()
      })
    })
  })

  describe('useAfter()', () => {
    let server

    beforeEach(() => {
      server = new CoreIO.Server({
        noServer: true
      })
    })

    afterEach(() => {
      server.removeAllRoutes(true)
    })

    it('register a middleware under a specific path', () => {
      const fn = sinon.spy((req, res, next) => { next() })
      const fn2 = sinon.spy((req, res, next) => { next() })
      const fn3 = sinon.spy((req, res, next) => { next() })

      server.use(fn)
      server.useAfter(fn3)
      server.use(fn2)

      return server.dispatch({
        path: '/foo/bla'
      }, {}).then(() => {
        inspect(fn).wasCalledOnce()
        inspect(fn2).wasCalledOnce()
        inspect(fn3).wasCalledOnce()
        inspect(fn).hasCallOrder(fn2, fn3)
      })
    })

    it('registers multiple middlewares under a specific path', () => {
      const fn = sinon.spy((req, res, next) => { next() })
      const fn2 = sinon.spy((req, res, next) => { next() })
      const fn3 = sinon.spy((req, res, next) => { next() })
      const fn4 = sinon.spy((req, res, next) => { next() })

      server.useAfter(fn, fn2, fn3, fn4)

      return server.dispatch({
        path: '/foo/bla'
      }, {}).then(() => {
        inspect(fn).wasCalledOnce()
        inspect(fn2).wasCalledOnce()
        inspect(fn3).wasCalledOnce()
        inspect(fn4).wasCalledOnce()
      })
    })
  })

  describe('useAfter([path], fn)', () => {
    let server

    beforeEach(() => {
      server = new CoreIO.Server({
        noServer: true
      })
    })

    afterEach(() => {
      server.removeAllRoutes(true)
    })

    it('register a middleware under a specific path', () => {
      const fn = sinon.spy((req, res, next) => { next() })
      const fn2 = sinon.spy((req, res, next) => { next() })
      const fn3 = sinon.spy((req, res, next) => { next() })

      server.use('/foo', fn)
      server.useAfter('/foo', fn3)
      server.useAfter('/bar', fn3)
      server.use('/bar', fn)
      server.use('/bar', fn2)

      return server.dispatch({
        path: '/foo/bla'
      }, {}).then(() => {
        inspect(fn).wasCalledOnce()
        inspect(fn2).wasNotCalled()
        inspect(fn3).wasCalledOnce()
        inspect(fn).hasCallOrder(fn3)
      })
    })

    it('registers multiple middlewares under a specific path', () => {
      const fn = sinon.spy((req, res, next) => { next() })
      const fn2 = sinon.spy((req, res, next) => { next() })
      const fn3 = sinon.spy((req, res, next) => { next() })
      const fn4 = sinon.spy((req, res, next) => { next() })

      server.use('/foo', fn, fn2, fn3, fn4)

      return server.dispatch({
        path: '/foo/bla'
      }, {}).then(() => {
        inspect(fn).wasCalledOnce()
        inspect(fn2).wasCalledOnce()
        inspect(fn3).wasCalledOnce()
        inspect(fn4).wasCalledOnce()
        inspect(fn).hasCallOrder(fn2, fn3, fn4)
      })
    })
  })

  describe('route()', () => {
    let server

    beforeEach(() => {
      server = new CoreIO.Server({
        noServer: true
      })
    })

    afterEach(() => {
      server.removeAllRoutes(true)
    })

    it('should register a route in an internal storage', () => {
      server.route('GET', '/foo/:name', (req, res, next, done) => { done() })

      inspect(server.__routes).isObject()
      inspect(server.__routes.size).isEql(1)
      inspect(server.__routes.get('GET /foo/:name')).hasProps({
        method: 'GET',
        route: '/foo/:name',
        keys: [{
          name: 'name',
          offset: 6,
          optional: false
        }]
      })
    })

    it('should add a route', () => {
      const fn = sinon.spy((req, res, next) => { next() })
      server.route('GET', '/foo/:name', fn)

      return server.dispatch({
        path: '/foo/bla',
        method: 'GET'
      }, {}).then(() => {
        inspect(fn).wasCalledOnce()
      })
    })

    it('should add multiple middlewares', () => {
      const fn = sinon.spy((req, res, next, done) => { next() })
      const fn2 = sinon.spy((req, res, next, done) => { next() })
      const fn3 = sinon.spy((req, res, next, done) => { done() })
      server.route('GET', '/foo/bla', fn, fn2, fn3)

      return server.dispatch({
        path: '/foo/bla',
        method: 'GET'
      }, {}).then(() => {
        inspect(fn).wasCalledOnce()
        inspect(fn2).wasCalledOnce()
        inspect(fn3).wasCalledOnce()
        inspect(fn).hasCallOrder(fn2, fn3)
      })
    })
  })

  describe('errorHandler', () => {
    let server

    beforeEach(() => {
      server = new CoreIO.Server({
        noServer: true
      })
    })

    afterEach(() => {
      server.removeAllRoutes(true)
    })

    it('calls an error handler', () => {
      const fn = sinon.spy((req, res, next) => { throw new Error('Fucking error!') })
      const fn2 = sinon.spy((err, req, res, next) => { next() })
      server.use(fn)
      server.errorHandler(fn2)

      return server.dispatch({
        path: '/foo/bla',
        method: 'GET'
      }, {
        status() {},
        send() {}
      }).then(() => {
        inspect(fn2).wasCalledOnce()
      })
    })

    it('never calls an error handler if no error was thrown', () => {
      const fn = sinon.spy((req, res, next) => { next() })
      const fn2 = sinon.spy((err, req, res, next) => { next() })
      server.use(fn)
      server.errorHandler(fn2)

      return server.dispatch({
        path: '/foo/bla',
        method: 'GET'
      }, {}).then(() => {
        inspect(fn).wasCalledOnce()
        inspect(fn2).wasNotCalled()
      })
    })

    const arr = [
      { ErrorClass: InternalServerError, status: 500, message: 'Beer is empty!', error: 'InternalServerError' },
      { ErrorClass: BadGateway, status: 502, message: 'Beer is empty!', error: 'BadGateway' }
    ]

    arr.forEach((test) => {
      it.only(`calls an final error handler if an ${test.ErrorClass.name} was thrown`, () => {
        const fn = sinon.spy((req, res, next) => { throw new test.ErrorClass('Beer is empty!') })
        const fn2 = sinon.spy((err, req, res, next) => { next() })
        const jsonStub = sinon.stub()
        const sendStub = sinon.stub()
        const statusStub = sinon.stub()
        const acceptsStub = sinon.stub()
        acceptsStub.returns(true)

        server.use(fn)
        server.errorHandler(fn2)

        return server.dispatch({
          path: '/foo/bla',
          method: 'GET',
          accepts: acceptsStub
        }, {
          status: statusStub,
          send: sendStub,
          json: jsonStub
        }).then(() => {
          inspect(fn2).wasCalledOnce()
          inspect(jsonStub).wasCalledOnce()
          inspect(sendStub).wasNotCalled()
          inspect(statusStub).wasCalledOnce()
          inspect(statusStub).wasCalledWith(test.status)
          inspect(jsonStub).wasCalledWith({
            status: test.status,
            error: test.error,
            message: test.message
          })
        })
      })
    })
  })
})
