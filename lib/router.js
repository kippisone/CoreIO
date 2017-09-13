/**
 * Router module
 *
 * @module Router
 *
 * @example {js}
 * const router = new CoreIO.Router();
 * router.registerRoutes({
 *   slug: '/foo',
 *   get: (ctx) => {
 *     return Promise.resolve('Foo');
 *   }
 * })
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = Router;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

function Router(CoreIO) {
  var log = require('logtopus').getLogger('coreio');

  var Router = function () {
    function Router(conf) {
      _classCallCheck(this, Router);

      conf = conf || {};

      var server = new CoreIO.Server({
        port: CoreIO.getConf('httpPort'),
        host: CoreIO.getConf('httpHost'),
        noServer: conf.noServer
      });

      this.server = server;
      this.app = server.app;

      if (conf.mount) {
        this.Router = _express2.default.Router();
        this.app.use(conf.mount, this.Router);
      }

      if (conf.slug) {
        this.registerRoutes(conf);
      }
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
        var app = this.app;
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
            if (p === '') {
              res.type('text/plain');
              res.status(204);
              res.end();
            }

            return;
          }

          if (typeof p.then === 'function' && typeof p.catch === 'function') {
            p.then(function (data) {
              res.status(200);
              typeof data === 'object' && req.accepts('json') ? res.json(data) : data;
            }).catch(function (err) {
              res.status(err.statusCode || 500);
              res.send(err.message);
            });
          } else {
            res.status(200);
            typeof p === 'object' && req.accepts('json') ? res.json(p) : p;
          }
        };
      }
    }, {
      key: 'route',
      value: function route(slug) {
        if (this.Router) {
          return this.Router.route(slug);
        }

        return this.app.route(slug);
      }
    }, {
      key: 'removeRoute',
      value: function removeRoute(path) {
        var i = 0;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this.app._router.stack[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var layer = _step3.value;

            if (layer.path === path) {
              this.app._router.stack.splice(i, 1);
            } else {
              i += 1;
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
    }, {
      key: 'resetRoutes',
      value: function resetRoutes() {
        var i = 0;
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this.app._router.stack[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var layer = _step4.value;

            if (layer.name === 'bound dispatch') {
              this.app._router.stack.splice(i, 1);
            } else {
              i += 1;
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }
    }]);

    return Router;
  }();

  return Router;
}