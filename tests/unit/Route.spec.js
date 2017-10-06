const inspect = require('inspect.js')
const sinon = require('sinon')
inspect.useSinon(sinon)

const Route = require('../../lib/utils/Route').default

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
})
