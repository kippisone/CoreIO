'use strict';

let express = require('express');
let app = express();
let bodyParser = require('body-parser');

module.exports = function(CoreIO) {
  let log = require('logtopus').getLogger('coreio');
  log.setLevel(CoreIO.logLevel);

  log.sys('Listen on port', CoreIO.httpPort);
  app.listen(CoreIO.httpPort, CoreIO.httpHost);

  app.use(bodyParser.json());
  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'content-type');
    next();
  });

  class Router {
    constructor(conf) {
      this.conf = conf || {};
    }

    route(slug) {
      return app.route(slug);
    }

    coupleModel(model) {
      let slug = this.conf.slug || model.name.replace(/Model$/, '');
      if (slug.charAt(0) !== '/') {
        slug = '/' + slug;
      }

      log.sys('Register API on path ', slug);
      let router = express.Router();
      if (this.conf.allow) {
        if (this.conf.allow.indexOf('READ') !== -1) {
          log.sys(`Register GET route for model ${model.name}`);
          router.get('/:id', (req, res) => {
            this.requestHandler(req, res, model.fetch(req.params.id).then(() => {
              return model.get();
            }));
          });
        }

        if (this.conf.allow.indexOf('CREATE') !== -1) {
          log.sys(`Register POST route for model ${model.name}`);
          router.post((req, res) => {
            this.requestHandler(req, res, model.set(req.body));
          });
        }
      }

      app.use(slug, router);
      return router;
    }

    coupleList(list) {
      let slug = this.conf.slug || list.name.replace(/Model$/, '');
      if (slug.charAt(0) !== '/') {
        slug = '/' + slug;
      }

      log.sys('Register API on path ', slug);
      let router = express.Router();
      if (this.conf.allow) {
        if (this.conf.allow.indexOf('READ') !== -1) {
          log.sys(`Register GET route for list ${list.name}`);
          router.get('/:id', (req, res) => {
            this.requestHandler(req, res, list.fetch(req.params.id).then(() => {
              return list.get();
            }));
          });
        }

        if (this.conf.allow.indexOf('CREATE') !== -1) {
          log.sys(`Register POST route for list ${list.name}`);
          router.post('/', (req, res) => {
            this.requestHandler(req, res, list.push(req.body));
          });
        }
      }

      app.use(slug, router);
      return router;
    }

    requestHandler(req, res, fn) {
      fn.then(data => {
        res.json(data);
      }).catch(err => {
        res.send(err.message);
        res.status(500);
      });
    }
  }

  return Router;
};
