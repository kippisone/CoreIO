import path from 'path';

import logtopus from 'logtopus';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import firetpl from 'firetpl';
import Bucketchain  from 'superchain/Bucketchain';


export default function ServerFactory(CoreIO) {
  let log = require('logtopus').getLogger('coreio');
  CoreIO.__registeredServers = new Map();

  class Server {
    constructor(conf) {
      this.port = conf.port;
      this.host = conf.host || '0.0.0.0';

      const portNumber = `${this.port}`

      if (CoreIO.__registeredServers.has(portNumber)) {
        this.app = CoreIO.__registeredServers.get(portNumber);
      } else {
        this.app = express();
        CoreIO.__registeredServers.set(portNumber, this.app);

        this.connect({
          noServer: conf.noServer
        });
      }
    }

    connect(options) {
      options = options || {};
      const app = this.app;
      app.use(cors(this.getCorsOoptions()));
      app.use(bodyParser.json());
      app.use(logtopus.express({
        logLevel: CoreIO.logLevel
      }))

      app.engine('.fire', firetpl.__express);
      app.set('views', path.join(__dirname, '../views'));
      app.set('view engine', 'fire');

      this.bucketChain = new Bucketchain()
      this.bucketChain.bucket('middlewareBucket')
      this.bucketChain.bucket('routerBucket')
      this.bucketChain.bucket('prepareBucket')
      this.bucketChain.errorBucket('errBucket')

      app.use((req, res, next) => {
        this.bucketChain
          .run(req, res).then(() => next())
          .catch((err) => next(err))
      })

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
     * Sets a middleware
     *
     * This method makes an express `app.use()` call with all given arguments
     *
     * @method use
     *
     * @param {any} middleware... Set one or more middlewares
     *
     * @chainable
     * @returns {object} Returns this value
     */
    use(path, fn) {
      const args = Array.prototype.slice.call(arguments)
      // this.app.use.apply(this.app, args)
      if (typeof path === 'string') {
        const condition = (req, res) => {

        }

        this.bucketChain.middlewareBucket.add(condition, fn)
      }
    }

    /**
     * Registers a route
     * @param  {string|regexp} route Route string
     * @param  {function} ...funcs Callback or Async function which gets called when route got called
     * @return {object}       Rerturns this value
     */
    route (method, route, ...funcs) {
      const condition = (req, res) => {
        if (req.method === method) {

        }
      }

      this.routerBucket.add()
    }

    getCorsOoptions () {

    }

    registerStaticDir(dir) {
      this.app.use(express.static(dir));
    }

    runErrorBucket (thisContext, err, req, res) {
      this.errorBucket.runWith(thisContext, err, req, res)
    }
  }

  return Server;
}
