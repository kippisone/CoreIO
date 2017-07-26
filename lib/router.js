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
exports.default = Router;

var _logtopus = require('logtopus');

var _logtopus2 = _interopRequireDefault(_logtopus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

function Router(CoreIO) {
  let log = require('logtopus').getLogger('coreio');

  class Router {
    constructor(conf) {
      log.setLevel(CoreIO.logLevel);

      conf = conf || {};
      // if (!isConnected) {
      //   Router.connect({
      //     noServer: conf.noServer || false
      //   });
      // }

      if (conf.slug) {
        this.registerRoutes(conf);
      }

      const server = new CoreIO.Server({
        port: CoreIO.getConf('httpPort'),
        host: CoreIO.getConf('httpHost'),
        noServer: conf.noServer
      });

      this.server = server;
      this.app = server.app;
    }

    registerRoutes(conf) {
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
          const c = _step.value;

          if (c.slug) {
            const r = this.route(c.slug);
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = HTTP_METHODS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                const method = _step2.value;

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

    registerHTMLPage(slug, view, data) {
      const app = this.app;
      app.get(slug, function (req, res) {
        res.render(view, data);
      });
    }

    createConfig(conf) {
      const newConf = [];

      if (conf.model) {
        const Model = conf.model;
        if (conf.allow.indexOf('READ') !== -1) {
          newConf.push({
            slug: conf.slug.replace(/\/$/, '') + '/:id',
            get(req, res, next) {
              const model = new Model();
              return model.fetch(req.params.id).then(() => {
                return model.get();
              });
            }
          });
        }

        if (conf.allow.indexOf('CREATE') !== -1) {
          newConf.push({
            slug: conf.slug.replace(/\/$/, ''),
            post(req, res, next) {
              const model = new Model();
              model.set(req.body);
              return model.save();
            }
          });
        }

        if (conf.allow.indexOf('UPDATE') !== -1) {
          newConf.push({
            slug: conf.slug.replace(/\/$/, '') + '/:id',
            put(req, res, next) {
              const model = new Model();
              const id = model.get('id');
              model.replace(req.body);
              model.set('id', id);
              return model.save();
            }
          });

          newConf.push({
            slug: conf.slug.replace(/\/$/, '') + '/:id',
            patch(req, res, next) {
              const model = new Model();
              model.set(req.body);
              return model.save();
            }
          });
        }

        if (conf.allow.indexOf('DELETE') !== -1) {
          newConf.push({
            slug: conf.slug.replace(/\/$/, '') + '/:id',
            delete(req, res, next) {
              const model = new Model();
              return model.delete(req.params.id);
            }
          });
        }
      }

      if (conf.list) {
        const List = conf.list;
        if (conf.allow.indexOf('READ') !== -1) {
          newConf.push({
            slug: conf.slug.replace(/\/$/, ''),
            get(req, res, next) {
              const list = new List();
              return list.fetch().then(() => {
                return list.toArray();
              });
            }
          });
        }
      }

      return newConf;
    }

    requestHandler(fn) {
      return (req, res, next) => {
        const p = typeof fn === 'object' ? fn : fn(req, res, next);
        if (!p) {
          return;
        }

        if (typeof p.then === 'function' && typeof p.catch === 'function') {
          p.then(data => {
            res.status(200);
            res.json(data);
          }).catch(err => {
            res.status(err.statusCode || 500);
            res.send(err.message);
          });
        }
      };
    }

    route(slug) {
      return this.app.route(slug);
    }
  }

  return Router;
}