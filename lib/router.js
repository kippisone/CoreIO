/**
 * @module Router
 *
 * @example {js}
 * const router = new CoreIO.Router({
 *   slug: '/foo',
 *   get: (ctx) => {
 *     return Promise.resolve('Foo');
 *   }
 * });
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = Router;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _logtopus = require('logtopus');

var _logtopus2 = _interopRequireDefault(_logtopus);

var _firetpl = require('firetpl');

var _firetpl2 = _interopRequireDefault(_firetpl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var app = (0, _express2.default)();
var isConnected = false;
var HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

function Router(CoreIO) {
  var log = require('logtopus').getLogger('coreio');

  var Router = function () {
    function Router(conf) {
      _classCallCheck(this, Router);

      log.setLevel(CoreIO.logLevel);

      conf = conf || {};
      if (!isConnected) {
        Router.connect({
          noServer: conf.noServer || false
        });
      }

      if (conf.slug) {
        this.registerRoutes(conf);
      }

      this.connect = function (_options) {
        return Router.connect(_options);
      };
    }

    _createClass(Router, [{
      key: 'registerStaticDir',
      value: function registerStaticDir(dir) {
        var app = this.connect();
        app.use(_express2.default.static(dir));
      }
    }, {
      key: 'registerRoutes',
      value: function registerRoutes(conf) {
        conf.allow = conf.allow || ['READ'];

        if (conf.model || conf.list) {
          conf = this.createConfig(conf);
        } else {
          conf = [conf];
        }

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = conf[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var c = _step.value;

            if (c.slug) {
              var r = this.route(c.slug);
              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = HTTP_METHODS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var method = _step2.value;

                  if (c[method]) {
                    log.sys(`Register route ${method.toUpperCase()} ${c.slug}`);
                    r[method](this.requestHandler(c[method]));
                  }
                }
              } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                  }
                } finally {
                  if (_didIteratorError2) {
                    throw _iteratorError2;
                  }
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }, {
      key: 'registerHTMLPage',
      value: function registerHTMLPage(slug, view, data) {
        var app = this.connect();
        app.get(slug, function (req, res) {
          res.render(view, data);
        });
      }
    }, {
      key: 'createConfig',
      value: function createConfig(conf) {
        var newConf = [];

        if (conf.model) {
          (function () {
            var Model = conf.model;
            if (conf.allow.indexOf('READ') !== -1) {
              newConf.push({
                slug: conf.slug.replace(/\/$/, '') + '/:id',
                get(req, res, next) {
                  var model = new Model();
                  return model.fetch(req.params.id).then(function () {
                    return model.get();
                  });
                }
              });
            }

            if (conf.allow.indexOf('CREATE') !== -1) {
              newConf.push({
                slug: conf.slug.replace(/\/$/, ''),
                post(req, res, next) {
                  var model = new Model();
                  model.set(req.body);
                  return model.save();
                }
              });
            }

            if (conf.allow.indexOf('UPDATE') !== -1) {
              newConf.push({
                slug: conf.slug.replace(/\/$/, '') + '/:id',
                put(req, res, next) {
                  var model = new Model();
                  var id = model.get('id');
                  model.replace(req.body);
                  model.set('id', id);
                  return model.save();
                }
              });

              newConf.push({
                slug: conf.slug.replace(/\/$/, '') + '/:id',
                patch(req, res, next) {
                  var model = new Model();
                  model.set(req.body);
                  return model.save();
                }
              });
            }

            if (conf.allow.indexOf('DELETE') !== -1) {
              newConf.push({
                slug: conf.slug.replace(/\/$/, '') + '/:id',
                delete(req, res, next) {
                  var model = new Model();
                  return model.delete(req.params.id);
                }
              });
            }
          })();
        }

        if (conf.list) {
          (function () {
            var List = conf.list;
            if (conf.allow.indexOf('READ') !== -1) {
              newConf.push({
                slug: conf.slug.replace(/\/$/, ''),
                get(req, res, next) {
                  var list = new List();
                  return list.fetch().then(function () {
                    return list.toArray();
                  });
                }
              });
            }
          })();
        }

        return newConf;
      }
    }, {
      key: 'requestHandler',
      value: function requestHandler(fn) {
        return function (req, res, next) {
          var p = typeof fn === 'object' ? fn : fn(req, res, next);
          if (!p) {
            return;
          }

          if (typeof p.then === 'function' && typeof p.catch === 'function') {
            p.then(function (data) {
              res.status(200);
              res.json(data);
            }).catch(function (err) {
              res.status(err.statusCode || 500);
              res.send(err.message);
            });
          }
        };
      }
    }, {
      key: 'route',
      value: function route(slug) {
        return app.route(slug);
      }
    }], [{
      key: 'connect',
      value: function connect(options) {
        if (isConnected) {
          return app;
        }

        options = options || {};
        isConnected = true;
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

        return app;
      }
    }]);

    return Router;
  }();

  return Router;
}