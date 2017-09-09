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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ServerFactory(CoreIO) {
  let log = require('logtopus').getLogger('coreio');
  const _registeredServers = new Map();

  class Server {
    constructor(conf) {
      this.port = conf.port;
      this.host = conf.host || '0.0.0.0';

      const portNumber = `${this.port}`;

      if (_registeredServers.has(portNumber)) {
        this.app = _registeredServers.get(portNumber);
      } else {
        this.app = (0, _express2.default)();
        _registeredServers.set(portNumber, this.app);

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

      if (!options.noServer) {
        log.sys('Listen on port', CoreIO.httpPort);
        app.listen(CoreIO.httpPort, CoreIO.httpHost);
      }
    }

    getCorsOoptions() {}

    registerStaticDir(dir) {
      this.app.use(_express2.default.static(dir));
    }
  }

  return Server;
}