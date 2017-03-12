'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function ServerFactory(CoreIO) {
  var log = require('logtopus').getLogger('coreio');
  var _registeredServers = {};

  var Server = function () {
    function Server(conf) {
      _classCallCheck(this, Server);

      this.port = conf.port;
      this.host = conf.host || '0.0.0.0';

      if (_registeredServers[this.port]) {
        this.app = _registeredServers[conf.port];
      } else {
        this.app = (0, _express2.default)();
        _registeredServers[conf.port] = this.app;
      }

      this.connect({
        noServer: conf.noServer
      });
    }

    _createClass(Server, [{
      key: 'connect',
      value: function connect(options) {
        options = options || {};
        var app = this.app;
        app.use((0, _cors2.default)());
        app.use(_bodyParser2.default.json());
        app.use(function (req, res, next) {
          res.set('Access-Control-Allow-Origin', '*');
          res.set('Access-Control-Allow-Headers', 'content-type');
          next();
        });

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
    }, {
      key: 'registerStaticDir',
      value: function registerStaticDir(dir) {
        this.app.use(_express2.default.static(dir));
      }
    }]);

    return Server;
  }();

  return Server;
}