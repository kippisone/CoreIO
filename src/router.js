import path from 'path'

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

export default function Router(CoreIO) {
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

      if (conf.model) {
        const Model = conf.model;
        if (conf.allow.indexOf('READ') !== -1) {
          newConf.push({
            slug: conf.slug.replace(/\/$/, '') + '/:id',
            async get (req, res) {
              const model = new Model();
              await model.fetch(req.params.id)
              return model.get()
            }
          });
        }

        if (conf.allow.indexOf('CREATE') !== -1) {
          newConf.push({
            slug: conf.slug.replace(/\/$/, ''),
            async post(req, res) {
              const model = new Model();
              model.set(req.body);
              return model.save();
            }
          });
        }

        if (conf.allow.indexOf('UPDATE') !== -1) {
          newConf.push({
            slug: conf.slug.replace(/\/$/, '') + '/:id',
            async put(req, res) {
              const model = new Model();
              const id = model.get('id');
              model.replace(req.body)
              model.set('id', id);
              return model.save();
            }
          });

          newConf.push({
            slug: conf.slug.replace(/\/$/, '') + '/:id',
            async patch(req, res) {
              const model = new Model();
              model.set(req.body);
              return model.save();
            }
          });
        }

        if (conf.allow.indexOf('DELETE') !== -1) {
          newConf.push({
            slug: conf.slug.replace(/\/$/, '') + '/:id',
            delete(req, res) {
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
          typeof data === 'object' && req.accepts('json') ? res.json(data) : res.send(data);
        } else {
          res.status(200)
          typeof p === 'object' && req.accepts('json') ? res.json(p) : res.send(p);
        }
      }
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

    validatePath(slug, defaultSlug) {
      slug = slug || defaultSlug
      if (!slug) return slug
      if (!/^\//.test(slug)) throw new Error(`Path validation failed for path '${slug}'! It has to start with a '/'`)
      return  slug.replace(/\/+$/, '')
    }
  }

  return Router;
}
