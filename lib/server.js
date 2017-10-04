'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ServerFactory;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _logtopus = require('logtopus');

var _logtopus2 = _interopRequireDefault(_logtopus);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _firetpl = require('firetpl');

var _firetpl2 = _interopRequireDefault(_firetpl);

var _Bucketchain = require('superchain/src/Bucketchain');

var _Bucketchain2 = _interopRequireDefault(_Bucketchain);

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ServerFactory(CoreIO) {
  let log = require('logtopus').getLogger('coreio');
  CoreIO.__registeredServers = new Map();

  class Server {
    constructor(conf) {
      this.port = conf.port;
      this.host = conf.host || '0.0.0.0';

      const portNumber = `${this.port}`;

      if (CoreIO.__registeredServers.has(portNumber)) {
        return CoreIO.__registeredServers.get(portNumber);
      } else {
        this.app = (0, _express2.default)();
        CoreIO.__registeredServers.set(portNumber, this);

        this.connect({
          noServer: conf.noServer
        });
      }
    }

    connect(options) {
      options = options || {};
      const app = this.app;
      app.use((0, _cors2.default)(this.getCorsOoptions()));
      app.use(_bodyParser2.default.json());
      app.use(_logtopus2.default.express({
        logLevel: CoreIO.logLevel
      }));

      app.engine('.fire', _firetpl2.default.__express);
      app.set('views', _path2.default.join(__dirname, '../views'));
      app.set('view engine', 'fire');

      this.bucketChain = new _Bucketchain2.default();
      this.bucketChain.bucket('prepareBucket');
      this.bucketChain.bucket('routerBucket');
      this.bucketChain.bucket('presendBucket');
      this.bucketChain.errorBucket('errBucket');

      app.use((req, res, next) => {
        this.dispatch(req, res).then(() => next()).catch(err => next(err));
      });

      if (!options.noServer) {
        log.sys('Listen on port', CoreIO.httpPort);
        app.listen(CoreIO.httpPort, CoreIO.httpHost);
      }

      /**
       * Fires an event when a server instance has been initialized
       *
       * @event server:init
       * @arg {obj} instance The fresh created CoreIO.Server instance
       */
      CoreIO.CoreEvents.emit('server:init', this);
    }

    /**
     * Dispatch a req, res pair into the middleware chain
     *
     * @method  dispatch
     * @param   {object} req Request object
     * @param   {object} res Response object
     * @returns {void}
     */
    dispatch(req, res) {
      return this.bucketChain.run(req, res);
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
        const keys = [];
        const reg = (0, _pathToRegexp2.default)(args[0], keys, {
          sensitive: true,
          end: false
        });

        const condition = (req, res) => {
          return reg.test(req.path);
        };

        for (let i = 1; i < args.length; i++) {
          this.bucketChain.prepareBucket.when(condition).add(args[i]);
        }
      } else {
        for (let i = 0; i < args.length; i++) {
          this.bucketChain.prepareBucket.add(args[i]);
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
        const keys = [];
        const reg = (0, _pathToRegexp2.default)(args[0], keys, {
          sensitive: true,
          end: false
        });

        const condition = (req, res) => {
          return reg.test(req.path);
        };

        for (let i = 1; i < args.length; i++) {
          this.bucketChain.presendBucket.when(condition).add(args[i]);
        }
      } else {
        for (let i = 0; i < args.length; i++) {
          this.bucketChain.presendBucket.add(args[i]);
        }
      }
    }

    /**
     * Registers a route
     * @param  {string|regexp} route Route string
     * @param  {function} ...funcs Callback or Async function which gets called when route got called
     * @return {object}       Rerturns this value
     */
    route(method, route, ...funcs) {
      const keys = [];
      const reg = (0, _pathToRegexp2.default)(route, keys, {
        sensitive: true
      });

      const condition = (req, res) => {
        if (req.method !== method) return false;
        return reg.test(req.path);
      };

      for (let i = 0; i < funcs.length; i++) {
        this.bucketChain.routerBucket.when(condition).add(funcs[i]);
      }
    }

    getCorsOoptions() {}

    registerStaticDir(dir) {
      this.app.use(_express2.default.static(dir));
    }

    runErrorBucket(thisContext, err, req, res) {
      this.errorBucket.runWith(thisContext, err, req, res);
    }
  }

  return Server;
}