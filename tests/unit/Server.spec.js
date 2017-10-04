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

    beforeEach(() => {
      server = new CoreIO.Server({
        noServer: true
      })
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
})
