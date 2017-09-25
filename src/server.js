import path from 'path';

import logtopus from 'logtopus';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import firetpl from 'firetpl';
import Superchain from 'superchain';


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

      const thisContext = {}
      this.middlewareBucket = new Superchain()
      this.routerBucket = new Superchain()
      this.prepareBucket = new Superchain()
      this.errorBucket = new Superchain()

      app.use((req, res, next) => {
        this.middlewareBucket
          .runWith(thisContext, req, res).then(() => next())
          .catch((err) => this.runErrorBucket(thisContext, err, req, res))
      })

      app.use((req, res, next) => {
        this.routerBucket
          .runWith(thisContext, req, res).then(() => next())
          .catch((err) => this.runErrorBucket(thisContext, err, req, res))
      })

      app.use((req, res, next) => {
        this.prepareBucket
          .runWith(thisContext, req, res).then(() => next())
          .catch((err) => this.runErrorBucket(thisContext, err, req, res))
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
    use() {
      const args = Array.prototype.slice.call(arguments)
      this.app.use.apply(this.app, args)
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
