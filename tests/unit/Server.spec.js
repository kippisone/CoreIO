'use strict'

const inspect = require('inspect.js')
const sinon = require('sinon')
inspect.useSinon(sinon)

const CoreIO = require('../../')
const erroClassArr = require('./errors/errorConf');

describe('Server', () => {
  const fakeReq = {
    accepts() {},
    path: '/foo/bla',
    method: 'GET'
  }

  const fakeRes = {
    status() {},
    send() {}
  }

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

      return server.dispatch(fakeReq, fakeRes).then(() => {
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

      return server.dispatch(fakeReq, fakeRes).then(() => {
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

      return server.dispatch(fakeReq, fakeRes).then(() => {
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

      return server.dispatch(fakeReq, fakeRes).then(() => {
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
      const fn3 = sinon.spy((req, res, next, exit) => { exit() })

      server.use(fn)
      server.useAfter(fn3)
      server.use(fn2)

      return server.dispatch(fakeReq, fakeRes).then(() => {
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
      const fn4 = sinon.spy((req, res, next, exit) => { exit() })

      server.useAfter(fn, fn2, fn3, fn4)

      return server.dispatch(fakeReq, fakeRes).then(() => {
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
        noServer: true,
        debug: true
      })
    })

    afterEach(() => {
      server.removeAllRoutes(true)
    })

    it('register a middleware under a specific path', () => {
      const fn = sinon.spy((req, res, next) => { next() })
      const fn2 = sinon.spy((req, res, next) => { next() })
      const fn3 = sinon.spy((req, res, next, exit) => { exit() })

      server.use('/foo', fn)
      server.useAfter('/foo', fn3)
      server.useAfter('/bar', fn3)
      server.use('/bar', fn)
      server.use('/bar', fn2)

      return server.dispatch(fakeReq, fakeRes).then(() => {
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
      const fn4 = sinon.spy((req, res, next, exit) => { exit() })

      server.use('/foo', fn, fn2, fn3, fn4)

      return server.dispatch(fakeReq, fakeRes).then(() => {
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

      return server.dispatch(fakeReq, fakeRes).then(() => {
        inspect(fn).wasCalledOnce()
      })
    })

    it('should add multiple middlewares', () => {
      const fn = sinon.spy((req, res, next, done) => { next() })
      const fn2 = sinon.spy((req, res, next, done) => { next() })
      const fn3 = sinon.spy((req, res, next, done) => { done() })
      server.route('GET', '/foo/bla', fn, fn2, fn3)

      return server.dispatch(fakeReq, fakeRes).then(() => {
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

      server.errorLevel = 1
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
        method: 'GET',
        accepts: () => true
      }, {
        status() {},
        send() {}
      }).then(() => {
        inspect(fn2).wasCalledOnce()
      })
    })

    it.skip('never calls an error handler if no error was thrown', () => {
      const fn = sinon.spy((req, res, next) => { next() })
      const fn2 = sinon.spy((err, req, res, next) => { console.log(err); next() })
      server.use(fn)
      server.errorHandler(fn2)

      return server.dispatch(fakeReq, fakeRes).then(() => {
        inspect(fn).wasCalledOnce()
        inspect(fn2).wasNotCalled()
      })
    })


    erroClassArr.forEach((test) => {
      it(`calls an final error handler if an ${test.ErrorClass.name} was thrown`, () => {
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
            message: test.message,
            type: test.name
          })
        })
      })

      it(`return an extended error for ${test.ErrorClass.name} if level is set to 2`, () => {
        const fn = sinon.spy((req, res, next) => { throw new test.ErrorClass(test.error) })
        const fn2 = sinon.spy((err, req, res, next) => { next() })
        const jsonStub = sinon.stub()
        const sendStub = sinon.stub()
        const statusStub = sinon.stub()
        const acceptsStub = sinon.stub()
        acceptsStub.returns(true)

        server.use(fn)
        server.errorHandler(fn2)
        server.errorLevel = 2

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
            message: test.message,
            type: test.name,
            error: test.error
          })
        })
      })

      it(`return an extended error with stack trace for ${test.ErrorClass.name} if level is set to 3`, () => {
        const fn = sinon.spy((req, res, next) => { throw new test.ErrorClass(test.error) })
        const fn2 = sinon.spy((err, req, res, next) => { next() })
        const jsonStub = sinon.stub()
        const sendStub = sinon.stub()
        const statusStub = sinon.stub()
        const acceptsStub = sinon.stub()
        acceptsStub.returns(true)

        server.use(fn)
        server.errorHandler(fn2)
        server.errorLevel = 3

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
            message: test.message,
            type: test.name,
            error: test.error,
            stack: sinon.match.string
          })
        })
      })

      it(`calls an final error handler if an ${test.ErrorClass.name} was thrown (text/plain)`, () => {
        const fn = sinon.spy((req, res, next) => { throw new test.ErrorClass('Beer is empty!') })
        const fn2 = sinon.spy((err, req, res, next) => { next() })
        const jsonStub = sinon.stub()
        const sendStub = sinon.stub()
        const statusStub = sinon.stub()
        const acceptsStub = sinon.stub()
        acceptsStub.returns(false)

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
          inspect(sendStub).wasCalledOnce()
          inspect(jsonStub).wasNotCalled()
          inspect(statusStub).wasCalledOnce()
          inspect(statusStub).wasCalledWith(test.status)
          inspect(sendStub).wasCalledWith(
            `${test.status} ${test.message}`
          )
        })
      })

      it(`return an extended error for ${test.ErrorClass.name} if level is set to 2 (text/plain)`, () => {
        const fn = sinon.spy((req, res, next) => { throw new test.ErrorClass(test.error) })
        const fn2 = sinon.spy((err, req, res, next) => { next() })
        const jsonStub = sinon.stub()
        const sendStub = sinon.stub()
        const statusStub = sinon.stub()
        const acceptsStub = sinon.stub()
        acceptsStub.returns(false)

        server.use(fn)
        server.errorHandler(fn2)
        server.errorLevel = 2

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
          inspect(sendStub).wasCalledOnce()
          inspect(jsonStub).wasNotCalled()
          inspect(statusStub).wasCalledOnce()
          inspect(statusStub).wasCalledWith(test.status)
          inspect(sendStub).wasCalledWithMatch(
            `${test.status} ${test.message}\n\n${test.error}`
          )
        })
      })

      it(`return an extended error with stack trace for ${test.ErrorClass.name} if level is set to 3 (text/plain)`, () => {
        const fn = sinon.spy((req, res, next) => { throw new test.ErrorClass(test.error) })
        const fn2 = sinon.spy((err, req, res, next) => { next() })
        const jsonStub = sinon.stub()
        const sendStub = sinon.stub()
        const statusStub = sinon.stub()
        const acceptsStub = sinon.stub()
        acceptsStub.returns(false)

        server.use(fn)
        server.errorHandler(fn2)
        server.errorLevel = 3

        const err = new test.ErrorClass(test.error)
        err.level = 3
        inspect.print(err.toString())
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
          inspect(sendStub).wasCalledOnce()
          inspect(jsonStub).wasNotCalled()
          inspect(statusStub).wasCalledOnce()
          inspect(statusStub).wasCalledWith(test.status)
          inspect(sendStub).wasCalledWithMatch(
            `${test.status} ${test.message}\n\n${test.error}\n\nError: ${test.message}`
          )
        })
      })
    })
  })
})
