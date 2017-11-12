const inspect = require('inspect.js')
const sinon = require('sinon')
inspect.useSinon(sinon)

const Route = require('../../src/utils/Route')

describe('Route', () => {
  describe('class', () => {
    it('creates a route instance', () => {
      const route = new Route('GET', '/foo/:name')
      inspect(route).isInstanceOf(Route)
    })

    it('creates a GET route', () => {
      const route = new Route('GET', '/foo/:name')
      inspect(route.route).isEql('/foo/:name')
      inspect(route.method).isEql('GET')
      inspect(route.reg).isRegExp()
      inspect(route.condition).isFunction()
    })
  })

  describe('processParams()', () => {
    it('should set route property', () => {
      const fakeReq = {
        method: 'GET',
        path: '/test'
      }
      const fakeRes = {}

      const route = new Route('GET', '/test')
      const condition = route.condition(fakeReq, fakeRes)
      inspect(condition).isTrue()

      inspect(fakeReq.route).isEql('/test')
    })
  })

  it('should not set route property', () => {
    const fakeReq = {
      method: 'GET',
      path: '/test/:id'
    }
    const fakeRes = {}

    const route = new Route('GET', '/test')
    const condition = route.condition(fakeReq, fakeRes)
    inspect(condition).isFalse()

    inspect(fakeReq.route).isUndefined()
  })

  it('should set params property', () => {
    const fakeReq = {
      method: 'GET',
      path: '/test/test-1'
    }
    const fakeRes = {}

    const route = new Route('GET', '/test/:name')
    const condition = route.condition(fakeReq, fakeRes)
    inspect(condition).isTrue()

    inspect(fakeReq.params).isEql({
      name: 'test-1'
    })
  })

  it('should set multiple params properties', () => {
    const fakeReq = {
      method: 'GET',
      path: '/test/unit/test-1'
    }
    const fakeRes = {}

    const route = new Route('GET', '/test/:type/:name')
    const condition = route.condition(fakeReq, fakeRes)
    inspect(condition).isTrue()

    inspect(fakeReq.params).isEql({
      name: 'test-1',
      type: 'unit'
    })
  })

  it('should set partial params properties', () => {
    const fakeReq = {
      method: 'GET',
      path: '/test/unit/test-1'
    }
    const fakeRes = {}

    const route = new Route('GET', '/test/:type/test-:id(\\d)')
    const condition = route.condition(fakeReq, fakeRes)
    inspect(condition).isTrue()

    inspect(fakeReq.params).isEql({
      id: '1',
      type: 'unit'
    })
  })

  it('should set regexp params', () => {
    const fakeReq = {
      method: 'GET',
      path: '/test/unit/test-1'
    }
    const fakeRes = {}

    const route = new Route('GET', /\/test\/(.+)\/(.+)/)
    const condition = route.condition(fakeReq, fakeRes)
    inspect(condition).isTrue()

    inspect(fakeReq.params).isEql({
      '1': 'test-1',
      '0': 'unit'
    })
  })

  it('should not set any params', () => {
    const fakeReq = {
      method: 'GET',
      path: '/foo/bla/blub'
    }
    const fakeRes = {}

    const route = new Route('GET', '/test/:type/:name')
    const condition = route.condition(fakeReq, fakeRes)
    inspect(condition).isFalse()

    inspect(fakeReq.params).isUndefined()
  })
})
