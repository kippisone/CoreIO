const pathToRegexp = require('path-to-regexp')

class Route {
  constructor (method, route) {
    this.method = method
    this.route = route
    this.keys = []
    this.reg = pathToRegexp(route, this.keys, {
      sensitive: true
    })

    this.condition = this.getConditionFunc()
  }

  getConditionFunc () {
    return (req, res) => {
      if (req.method !== this.method) return false
      if (!this.reg.test(req.path)) return false
      req.route = this.route
      req.params = this.processParams(req)
      return true
    }
  }

  processParams (req) {
    const params = this.reg.exec(req.path)
    const parsedParams = {}
    this.keys.forEach((key, index) => {
      parsedParams[key.name] = params[index + 1]
    })

    return parsedParams
  }
}

module.exports = Route
