import path from 'path';

import logtopus from 'logtopus';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import firetpl from 'firetpl';


export default function ServerFactory(CoreIO) {
  let log = require('logtopus').getLogger('coreio');
  const _registeredServers = {};

  class Server {
    constructor(conf) {
      this.port = conf.port;
      this.host = conf.host || '0.0.0.0';

      if (_registeredServers[this.port]) {
        this.app = _registeredServers[this.port];
      } else {
        this.app = express();
        _registeredServers[this.port] = this.app;

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
      }));

      app.engine('.fire', firetpl.__express);
      app.set('views', path.join(__dirname, '../views'));
      app.set('view engine', 'fire');

      if (!options.noServer) {
        log.sys('Listen on port', CoreIO.httpPort);
        app.listen(CoreIO.httpPort, CoreIO.httpHost);
      }
    }

    getCorsOoptions() {

    }

    registerStaticDir(dir) {
      this.app.use(express.static(dir));
    }
  }

  return Server;
}
