'use strict'

const Utils = require('./utils')
const Socket = require('./socket')
const Service = require('./service')
const Server = require('./server')
const Router = require('./router')
const Config = require('./core/Config')

const APIError = require('./errors/APIError')
const BadGatewayError = require('./errors/BadGatewayError')
const BadRequestError = require('./errors/BadRequestError')
const ForbiddenError = require('./errors/ForbiddenError')
const GatewayTimeoutError = require('./errors/GatewayTimeoutError')
const InternalServerError = require('./errors/InternalServerError')
const NotAcceptableError = require('./errors/NotAcceptableError')
const NotFoundError = require('./errors/NotFoundError')
const NotImplementedError = require('./errors/NotImplementedError')
const RequestTimeoutError = require('./errors/RequestTimeoutError')
const ServiceUnavailableError = require('./errors/ServiceUnavailableError')
const UnauthorizedError = require('./errors/UnauthorizedError')

const CoreIO = {
}

const config = new Config({
  server: {
    port: 6446,
    host: '0.0.0.0'
  },
  log: {
    level: process.env.NODE_ENV === 'test' ? 'error' : 'sys'

  },
  error: {
    level: 1
  },
  socket: {
    port: 9889,
    host: '0.0.0.0'
  }
})

CoreIO.__config = config.__config
CoreIO.conf = {}

Utils(CoreIO)
CoreIO.Event = require('./event')(CoreIO)
CoreIO.List = require('./list')(CoreIO)
CoreIO.Model = require('./model')(CoreIO)
CoreIO.ReadyState = require('./readystate')(CoreIO)
CoreIO.Service = require('./service')(CoreIO)
CoreIO.SyncList = require('./synclist')(CoreIO)
CoreIO.SyncModel = require('./syncmodel')(CoreIO)

CoreIO.Config = Config
CoreIO.Service = Service(CoreIO)
CoreIO.Server = Server(CoreIO)
CoreIO.Socket = Socket(CoreIO)
CoreIO.Router = Router(CoreIO)

CoreIO.APIError = APIError
CoreIO.BadGatewayError = BadGatewayError
CoreIO.BadRequestError = BadRequestError
CoreIO.ForbiddenError = ForbiddenError
CoreIO.GatewayTimeoutError = GatewayTimeoutError
CoreIO.InternalServerError = InternalServerError
CoreIO.NotAcceptableError = NotAcceptableError
CoreIO.NotFoundError = NotFoundError
CoreIO.NotImplementedError = NotImplementedError
CoreIO.RequestTimeoutError = RequestTimeoutError
CoreIO.ServiceUnavailableError = ServiceUnavailableError
CoreIO.UnauthorizedError = UnauthorizedError

CoreIO.CoreEvents = new CoreIO.Event()

/**
 * Creates a model class
 *
 * @method createModel
 * @version v1.0.0
 *
 * @param  {string} name Model name
 * @param  {object} opts Model options
 * @returns {object} Returns a model class
 */
CoreIO.createModel = function (name, opts) {
  return CoreIO.Model.inherit(name, opts)
}

/**
 * Creates a list class
 *
 * @method createList
 * @version v1.0.0
 *
 * @param  {string} name List name
 * @param  {object} opts List options
 * @returns {object} Returns a list class
 */
CoreIO.createList = function (name, opts) {
  return CoreIO.List.inherit(name, opts)
}

/**
 * Creates a syncmodel class
 *
 * @method createSyncModel
 * @version v1.0.0
 *
 * @param  {string} name SyncModel name
 * @param  {object} opts SyncModel options
 * @returns {object} Returns a syncmodel class
 */
CoreIO.createSyncModel = function (name, opts) {
  return CoreIO.SyncModel.inherit(name, opts)
}

/**
 * Creates a synclist class
 *
 * @method createSyncList
 * @version v1.0.0
 *
 * @param  {string} name SyncList name
 * @param  {object} opts SyncList options
 * @returns {object} Returns a model class
 */
CoreIO.createSyncList = function (name, opts) {
  return CoreIO.SyncList.inherit(name, opts)
}

/**
 * Creates a service class
 *
 * @method createService
 * @version v1.0.0
 *
 * @param  {string} name Service name
 * @param  {object} opts Service options
 * @returns {object} Returns a service class
 */
CoreIO.createService = function (name, opts) {
  return CoreIO.Service.inherit(name, opts)
}

CoreIO.createRouter = function (slug) {
  let router = require('express').Router()
  return router
}

/**
 * Register a API route
 *
 * @method api
 *
 * @param  {string} slug Router
 * @param  {object} conf Route configuration
 *
 * @return {object} Returns a router instance
 */
CoreIO.api = function (slug, conf) {
  conf.slug = slug
  let router = new CoreIO.Router({
    noServer: conf.noServer || false
  })

  router.registerRoutes(conf)

  return router
}

CoreIO.getHttpServer = function (host, port) {
  if (!host) {
    host = CoreIO.getConfig('server.host')
  }

  if (!port) {
    port = CoreIO.getConfig('server.port')
  }

  if (!CoreIO.__httpServers) {
    CoreIO.__httpServers = {}
  }

  if (CoreIO.__httpServers[host + ':' + port]) {
    return CoreIO.__httpServers[host + ':' + port]
  }

  let http = require('http')
  let server = http.createServer()
  server.listen(port, host)
  return server
}

CoreIO.getConfig = function (name, defaultValue) {
  return CoreIO.__config.getConfig(name, defaultValue)
}

CoreIO.setConfig = function (name, value) {
  return CoreIO.__config.setConfig(name, value)
}

/**
 * Register a HTML skeleton page
 *
 * data:
 * ```js
 * {
 *   title: 'page title',  // Pag title
 *   scripts: ['main.js'], // JS files
 *   styles: ['main.css']  // CSS files
 * }
 * ```
 * @param  {route} route HTML page route
 * @param  {object} data  page data
 * @param  {object} conf  Router configuration
 * @return {object}       Returns a Router instance
 */
CoreIO.htmlPage = function (route, data, conf) {
  conf = conf || {}
  let router = new CoreIO.Router({
    noServer: conf.noServer || false
  })

  router.registerHTMLPage(route, 'html', Object.assign({
    title: 'CoreIO html page',
    scripts: [],
    styles: []
  }, data))
  return router
}

/**
 * Register a static dir
 * @param  {string} dir  Dirname
 * @param  {object} conf Router configuration
 * @return {object}      Returns a Router object
 */
CoreIO.staticDir = function (dir) {
  const server = new CoreIO.Server({
    port: CoreIO.getConfig('server.port'),
    host: CoreIO.getConfig('server.host')
  })

  server.registerStaticDir(dir)
  return server
}

module.exports = CoreIO
