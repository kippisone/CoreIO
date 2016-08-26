'use strict';

let express = require('express');
let app = express();

module.exports = function(CoreIO) {
  let log = require('logtopus').getLogger('coreio');
  log.setLevel(CoreIO.logLevel);

  log.sys('Liten on port', 7777);
  app.listen(7777);

  class Router {
    constructor(conf) {
      this.conf = conf || {};
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
