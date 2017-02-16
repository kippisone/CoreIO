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

import express from 'express';
import bodyParser from 'body-parser';
import logtopus from 'logtopus';

const app = express();
let isConnected = false;
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

export default function Router(CoreIO) {
  let log = require('logtopus').getLogger('coreio');

  class Router {
    constructor(conf) {
      log.setLevel(CoreIO.logLevel);

      conf = conf || {};
      if (!isConnected) {
        this.connect({
          noServer: conf.noServer || false
        });
      }

      this.registerRoutes(conf);
    }

    static connect(options) {
      if (isConnected) {
        return app;
      }

      options = options || {};
      isConnected = true;
      app.use(bodyParser.json());
      app.use((req, res, next) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Headers', 'content-type');
        next();
      });

      app.use(logtopus.express({
        logLevel: CoreIO.logLevel
      }));

      if (!options.noServer) {
        log.sys('Listen on port', CoreIO.httpPort);
        app.listen(CoreIO.httpPort, CoreIO.httpHost);
      }

      return app;
    }

    registerRoutes(conf) {
      conf.allow = conf.allow || ['READ'];

      if (conf.model) {
        conf = this.registerModel(conf);
      } else {
        conf = [conf];
      }

      for (const c of conf) {
        if (c.slug) {
          const r = this.route(c.slug);
          for (const method of HTTP_METHODS) {
            if (c[method]) {
              log.sys(`Register route ${method.toUpperCase()} ${c.slug}`);
              r[method](this.requestHandler(c[method]));
            }
          }
        }
      }
    }

    registerModel(conf) {
      const newConf = [];
      const Model = conf.model;
      if (conf.allow.indexOf('READ') !== -1) {
        newConf.push({
          slug: conf.slug.replace(/\/$/, '') + '/:id',
          get(req, res, next) {
            const model = new Model();
            return model.fetch(req.params.id);
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
            model.replace(req.body)
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

      return newConf;
    }

    requestHandler(fn) {
      return (req, res, next) => {
        const p = typeof fn === 'object' ? fn : fn(req, res, next);
        if (!p) {
          return;
        }

        if (typeof p.then === 'function' && typeof p.catch === 'function') {
          p.then((data) => {
            res.status(200);
            res.json(data);
          }).catch((err) => {
            res.status(err.statusCode || 500);
            res.send(err.message);
          });
        }
      };
    }

    route(slug) {
      return app.route(slug);
    }
  }

  return Router;
}
