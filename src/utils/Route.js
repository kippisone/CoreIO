import pathToRegexp from 'path-to-regexp'

export default class Route {
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
      console.log('OK', req.method, req.path)
      if (req.method !== this.method) return false
      return this.reg.test(req.path)
    }
  }
}
