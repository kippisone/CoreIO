const path = require('path')

const logtopus = require('logtopus')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const firetpl = require('firetpl')
const Bucketchain = require('superchain/src/Bucketchain')
const pathToRegexp = require('path-to-regexp')

const Route = require('./utils/Route')
const APIError = require('./errors/APIError')
const InternalServerError = require('./errors/InternalServerError')
const NotFoundError = require('./errors/NotFoundError')

function ServerFactory (CoreIO) {
  let log = require('logtopus').getLogger('coreio')
  CoreIO.__registeredServers = new Map()

  class Server {
    constructor (conf) {
      conf = conf || {}
      this.port = conf.port || CoreIO.getConfig('server.port')
      this.host = conf.host || CoreIO.getConfig('server.host')
      this.errorLevel = conf.errorLevel || CoreIO.getConfig('error.level')
      this.prettyPrint = conf.prettyPrint || CoreIO.prettyPrint
      this.showParseTime = conf.showParseTime || CoreIO.showParseTime
      this.conf = conf

      const portNumber = `${this.port}`

      if (CoreIO.__registeredServers.has(portNumber)) {
        return CoreIO.__registeredServers.get(portNumber)
      } else {
        this.app = express()
        this.app.set('x-powered-by', false)
        this.__routes = new Map()
        CoreIO.__registeredServers.set(portNumber, this)

        this.connect({
          noServer: conf.noServer
        })
      }
    }

    connect (options) {
      options = options || {}
      const app = this.app
      app.use(cors(this.getCorsOoptions()))
      app.use(bodyParser.json())
      app.use(logtopus.express({
        logLevel: CoreIO.getConfig('log.level')
      }))

      app.engine('.fire', firetpl.__express)
      app.set('views', path.join(__dirname, '../views'))
      app.set('view engine', 'fire')

      this.bucketChain = new Bucketchain()
      if (this.conf.debug) {
        this.bucketChain.debug = true
      }

      this.prepareBucket = this.bucketChain.bucket('prepareBucket')
      this.routerBucket = this.bucketChain.bucket('routerBucket')
      this.presendBucket = this.bucketChain.bucket('presendBucket')
      this.errorBucket = this.bucketChain.errorBucket('errorBucket')

      this.setDefaultRoutes()

      app.use((req, res, next) => {
        this.dispatch(req, res)
          .then(() => {})
          .catch((err) => next(err))
      })

      if (!options.noServer) {
        log.sys('Listen on port', this.port, this.host)
        app.listen(this.port, this.host)
      }

      /**
       * Fires an event when a server instance has been initialized
       *
       * @event server:init
       * @arg {obj} instance The fresh created CoreIO.Server instance
       */
      CoreIO.CoreEvents.emit('server:init', this)
    }

    setDefaultRoutes () {
      this.errorBucket.final(function finalErrorHandler (err, req, res, next) {
        // call final err
        let apiError
        if (err instanceof APIError) {
          apiError = err
        } else {
          apiError = new InternalServerError(err.message)
          apiError
        }

        apiError.level = this.errorLevel
        res.status(apiError.status || 500)
        req.accepts('json') && typeof apiError.toJSON === 'function'
          ? res.json(apiError.toJSON())
          : res.send(apiError.toString())

        next()
      }.bind(this))

      this.presendBucket.final(function notFoundHandler (req, res, next) {
        throw new NotFoundError(`Page ${req.path} was not found`)
        // return Promise.reject(new NotFoundError(`Page ${req.path} was not found`))
      })

      if (this.showParseTime) {
        this.use(async function requestTime (req, res, next) {
          const time = Date.now()
          await next()
          const responseTime = Date.now() - time
          res.set('Response-Time', responseTime + 'ms')
        })
      }
    }

    /**
     * Dispatch a req, res pair into the middleware chain
     *
     * @method  dispatch
     * @param   {object} req Request object
     * @param   {object} res Response object
     * @returns {object} Returns a Promise
     */
    dispatch (req, res) {
      return this.bucketChain.run(req, res)
    }

    removeAllRoutes (removeMiddlewares) {
      if (removeMiddlewares === true) {
        this.bucketChain.clear()
        this.setDefaultRoutes()
      } else {
        this.bucketChain.clear('routerBucket')
      }

      this.__routes.clear()
    }

    /**
     * Sets a middleware
     *
     * @method use
     *
     * @param {any} ...middleware Set one or more middlewares
     *
     * @chainable
     * @returns {object} Returns this value
     */
    use (...args) {
      // this.app.use.apply(this.app, args)
      if (typeof args[0] === 'string') {
        const keys = []
        const reg = pathToRegexp(args[0], keys, {
          sensitive: true,
          end: false
        })

        const condition = (req, res) => {
          return reg.test(req.path)
        }

        for (let i = 1; i < args.length; i++) {
          this.prepareBucket.when(condition).add(args[i])
        }
      } else {
        for (let i = 0; i < args.length; i++) {
          this.prepareBucket.add(args[i])
        }
      }
    }

    /**
     * Sets a middleware after the routes chain
     *
     * @method useAfter
     *
     * @param {any} ...middleware Set one or more middlewares
     *
     * @chainable
     * @returns {object} Returns this value
     */
    useAfter (...args) {
      if (typeof args[0] === 'string') {
        const keys = []
        const reg = pathToRegexp(args[0], keys, {
          sensitive: true,
          end: false
        })

        const condition = (req, res) => {
          return reg.test(req.path)
        }

        for (let i = 1; i < args.length; i++) {
          this.presendBucket.when(condition).add(args[i])
        }
      } else {
        for (let i = 0; i < args.length; i++) {
          this.presendBucket.add(args[i])
        }
      }
    }

    /**
     * Registers a route
     * @param  {string|regexp} route Route string
     * @param  {function} ...funcs Callback or Async function which gets called when route got called
     * @return {object}       Rerturns this value
     */
    route (method, route, ...funcs) {
      if (!this.__routes.has(`${method} ${route}`)) {
        const routeItem = new Route(method, route)
        this.__routes.set(`${method} ${route}`, routeItem)
      }

      const routeObj = this.__routes.get(`${method} ${route}`)
      for (let i = 0; i < funcs.length; i++) {
        this.routerBucket.when(routeObj.condition).add(funcs[i])
      }
    }

    errorHandler (fn) {
      this.errorBucket.add(fn)
    }

    getCorsOoptions () {

    }

    registerStaticDir (dir) {
      this.app.use(express.static(dir))
    }

    runErrorBucket (thisContext, err, req, res) {
      this.errorBucket.runWith(thisContext, err, req, res)
    }

    getAllRoutes (returnMiddlewares) {
      const routes = []
      this.__routes.forEach((value, key) => {
        routes.push(value)
      })

      return routes
    }
  }

  return Server
}

module.exports = ServerFactory
