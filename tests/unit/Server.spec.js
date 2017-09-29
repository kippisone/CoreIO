'use strict'

const inspect = require('inspect.js')
const apiInspect = require('api-inspect')
const sinon = require('sinon')
inspect.useSinon(sinon)

const CoreIO = require('../../')

describe('Server', () => {
  describe('instance', () => {
    it('', () => {

    })
  })

  describe('use()', () => {
    let server
    let useStub
    let sandbox

    beforeEach(() => {
      server = new CoreIO.Server({
        noServer: true
      })

      sandbox = sinon.sandbox.create()
      useStub = sandbox.stub(server.app, 'use')
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('should add a middleware', () => {
      const middleware = sinon.stub()
      server.use(middleware)
      inspect(useStub).wasCalledOnce()
      inspect(useStub).wasCalledWith(middleware)
    })

    it('should add multiple middlewares', () => {
      const middleware = sinon.stub()
      const middleware2 = sinon.stub()
      const middleware3 = sinon.stub()
      server.use(middleware, middleware2, middleware3)
      inspect(useStub).wasCalledOnce()
      inspect(useStub).wasCalledWithExectly(middleware, middleware2, middleware3)
    })
  })

  describe('route()', () => {
    let server
    let useStub
    let sandbox

    beforeEach(() => {
      server = new CoreIO.Server({
        noServer: true
      })

      sandbox = sinon.sandbox.create()
      useStub = sandbox.stub(server.app, 'use')
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('should add a route', () => {
      const route = sinon.stub()
      server.route(middleware)
      inspect(useStub).wasCalledOnce()
      inspect(useStub).wasCalledWith(middleware)
    })

    it('should add multiple middlewares', () => {
      const middleware = sinon.stub()
      const middleware2 = sinon.stub()
      const middleware3 = sinon.stub()
      server.use(middleware, middleware2, middleware3)
      inspect(useStub).wasCalledOnce()
      inspect(useStub).wasCalledWithExectly(middleware, middleware2, middleware3)
    })
  })

  describe.skip('setErrorHandler', () => {
    let server

    beforeEach(() => {
      server = new CoreIO.Server({
        noServer: true
      })

      apiInspect.setApi(server.app)
    })

    it('should set a general error handler', () => {
      const errHandler = sinon.spy(function(err, req, res, next) {

      })
      server.setErrorHandler(errHandler)

      inspect(server.__errorHandler).isEqual(errHandler)
    })

    it('should call a general error handler', () => {
      const errHandler = sinon.stub()
      server.setErrorHandler(errHandler)

      inspect(server.__errorHandler).isEqual(errHandler)

      server.use((req, res, next) => {
        next("new Error('Test')")
      })

      return apiInspect.get('/foo').test((ctx) => {
        inspect(errHandler).wasCalledOnce()
        ctx.statusCode(500)
        ctx.contentType('application/json')
        ctx.responseTime(50)
      })
    })
  })
})
