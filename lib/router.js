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

var _logtopus = require('logtopus');

var _logtopus2 = _interopRequireDefault(_logtopus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var app = express();
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

      var server = new CoreIO.Server({
        port: CoreIO.getConf('httpPort'),
        host: CoreIO.getConf('httpHost'),
        noServer: conf.noServer
      });

      this.server = server;
      this.app = server.app;
    }

    _createClass(Router, [{
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

        return this;
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
        }

        if (conf.list) {
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
    }]);

    return Router;
  }();

  return Router;
}