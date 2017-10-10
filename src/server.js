import path from 'path'

import logtopus from 'logtopus'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import firetpl from 'firetpl'
import Bucketchain  from 'superchain/src/Bucketchain'
import pathToRegexp from 'path-to-regexp'

import Route from './utils/Route'

export default function ServerFactory(CoreIO) {
  let log = require('logtopus').getLogger('coreio');
  CoreIO.__registeredServers = new Map();

  class Server {
    constructor(conf) {
      this.port = conf.port;
      this.host = conf.host || '0.0.0.0';
      this.errorLevel = conf.errorLevel || 1

      const portNumber = `${this.port}`

      if (CoreIO.__registeredServers.has(portNumber)) {
        return CoreIO.__registeredServers.get(portNumber)
      } else {
        this.app = express();
        CoreIO.__registeredServers.set(portNumber, this)

        this.connect({
          noServer: conf.noServer
        });

        this.__routes = new Map()
      }
    }

    connect(options) {
      options = options || {}
      const app = this.app
      app.use(cors(this.getCorsOoptions()))
      app.use(bodyParser.json())
      app.use(logtopus.express({
        logLevel: CoreIO.logLevel
      }))

      app.engine('.fire', firetpl.__express)
      app.set('views', path.join(__dirname, '../views'))
      app.set('view engine', 'fire')

      this.bucketChain = new Bucketchain()
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
        log.sys('Listen on port', CoreIO.httpPort)
        app.listen(CoreIO.httpPort, CoreIO.httpHost)
      }

      /**
       * Fires an event when a server instance has been initialized
       *
       * @event server:init
       * @arg {obj} instance The fresh created CoreIO.Server instance
       */
      CoreIO.CoreEvents.emit('server:init', this);
    }

    setDefaultRoutes () {
      this.errorBucket.final(function finalErrorHandler (err, req, res, next) {
        // call final err
        err.level = this.errorLevel
        res.status(err.status || 500)
        req.accepts('json') && typeof err.toJSON === 'function'
          ? res.json(err.toJSON())
          : res.send(err.toString())

        next()
      }.bind(this))
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
      if (removeMiddlewares === true){
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
    use(...args) {
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
    useAfter(...args) {
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

    registerStaticDir(dir) {
      this.app.use(express.static(dir));
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

  return Server;
}
