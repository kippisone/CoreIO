const path = require('path')

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

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

const ALLOW_BITMAP = {
  READ: 1,
  CREATE: 2,
  CHANGE: 4,
  REPLACE: 8,
  UPDATE: 12,
  DELETE: 16,
  CRUD: 31
}

function Router(CoreIO) {
  let log = require('logtopus').getLogger('coreio');

  class Router {
    constructor(conf) {
      conf = conf || {};

      const server = new CoreIO.Server({
        port: CoreIO.getConf('httpPort'),
        host: CoreIO.getConf('httpHost'),
        noServer: conf.noServer
      });

      this.server = server;
      this.app = server.app;
      this.mount = this.validatePath(conf.mount, '')
      this.prettyPrint = server.prettyPrint

      if (conf.reset) {
        this.removeAllRoutes(true)
      }

      if (conf.slug) {
        this.registerRoutes(conf);
      }
    }

    registerRoutes(conf) {
      conf.allow = conf.allow || ['READ']

      if (conf.model || conf.list) {
        conf = this.createConfig(conf);
      } else {
        conf = [conf];
      }

      for (const c of conf) {
        if (c.slug) {
          for (const method of HTTP_METHODS) {
            if (c[method]) {
              const slug = path.join(this.mount, c.slug)
              log.sys(`Register route ${method.toUpperCase()} ${slug}`);
              this.server.route(method.toUpperCase(), slug, this.requestHandler(c[method]))
            }
          }
        }
      }

      return this;
    }

    registerHTMLPage(slug, view, data) {
      const app = this.app;
      app.get(slug, function(req, res) {
        res.render(view, data);
      });
    }

    createConfig(conf) {
      const newConf = [];
      const slug = conf.slug.replace(/\/$/, '')
      const allow = this.getBitmap(ALLOW_BITMAP, conf.allow)

      if (conf.model) {
        const Model = conf.model
        if (ALLOW_BITMAP.READ & allow) {
          newConf.push({
            slug: conf.static ? slug : slug + '/:id',
            async get (req, res) {
              if (Model.isModel) {
                return Model.get()
              }

              const model = new Model()
              const data = await model.fetch(req.params.id)
              return data
            }
          })
        }

        if (ALLOW_BITMAP.CREATE & allow) {
          newConf.push({
            slug: slug,
            async post(req, res) {
              const model = new Model();
              await model.set(req.body);
              return model.save();
            }
          });
        }

        if (ALLOW_BITMAP.REPLACE & allow) {
          newConf.push({
            slug: slug + '/:id',
            async put(req, res) {
              const model = new Model();
              const id = model.get('id');
              model.replace(req.body)
              model.set('id', id);
              return model.save();
            }
          });
        }

        if (ALLOW_BITMAP.CHANGE & allow) {
          newConf.push({
            slug: slug + '/:id',
            async patch(req, res) {
              const model = new Model();
              model.set(req.body);
              return model.save();
            }
          });
        }

        if (ALLOW_BITMAP.DELETE & allow) {
          newConf.push({
            slug: slug + '/:id',
            delete(req, res) {
              const model = new Model();
              return model.delete(req.params.id);
            }
          });
        }
      }

      if (conf.list) {
        const List = conf.list;
        if (ALLOW_BITMAP.READ & allow) {
          newConf.push({
            slug: slug,
            async get(req, res) {
              const list = new List();
              await list.fetch()
              return list.toArray();
            }
          });
        }
      }

      return newConf;
    }

    requestHandler(fn) {
      return async function (...args) {
        const req = args[0]
        const res = args[1]
        const p = typeof fn === 'object' ? fn : fn.apply(null, args)
        if (!p) {
          if (p === '') {
            res.type('text/plain')
            res.status(204)
            res.end()
          }

          return
        }

        if (typeof p.then === 'function' && typeof p.catch === 'function') {
          const data = await p
          res.status(200);
          this.sendResponse(req, res, data)
        } else {
          res.status(200)
          this.sendResponse(req, res, p)
        }
      }.bind(this)
    }

    sendResponse(req, res, data) {
      if (typeof data === 'object' && req.accepts('json')) {
        data = JSON.stringify(data, null, this.prettyPrint ? '  ' : '')
        res.set('Content-Type', 'application/json')
      }

      res.send(data)
    }

    removeRoute(path) {
      let i = 0
      while (true) {
        const layer = this.app._router.stack[i]
        if (!layer) {
          break
        }

        if (layer.path === path) {
          this.app._router.stack.splice(i, 1)
        } else {
          i += 1
        }
      }
    }

    /**
     * Remove all registered routes
     *
     * @method  removeAllRoutes
     * @param   {bool} removeMiddlewares Remove middlewares as well
     */
    removeAllRoutes (removeMiddlewares) {
      this.server.removeAllRoutes(removeMiddlewares)
    }

    getAllRoutes (returnMiddlewares) {
      return this.server.getAllRoutes(returnMiddlewares)
    }

    errorHandler (fn) {
      this.server.errorHandler(fn)
    }

    validatePath (slug, defaultSlug) {
      slug = slug || defaultSlug
      if (!slug) return slug
      if (!/^\//.test(slug)) throw new Error(`Path validation failed for path '${slug}'! It has to start with a '/'`)
      return  slug.replace(/\/+$/, '')
    }

    getBitmap (bitmap, values) {
      let bit = 0;

      values.forEach((val) => {
        bit = bit | bitmap[val]
      })

      return bit
    }
  }

  return Router;
}

module.exports = Router
