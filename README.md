CoreIO
=======

CoreIO is a node.js backend model/list system. It keeps data between a web frontent and the backend in sync. Web clients could be connected with REST or Sockets and each model can be connected to a database like MongoDB or Redis as well. CoreIO is the backend part of XQCore. It works pretty well together.

Usage
-----

CoreIO knows models or lists. Lists are simply collections of models. Each model represents a dataset.

```js
let CoreIO = require('coreio');

let myModel = new CoreIO.Model('mymodel', self => {
  self.schema = {
    title: { type: 'string', min: 3, max: 50, required: true },
    description: { type: 'string' },
    isPublic: { type: 'boolean', default: false }
  };
});

// store data in a model
myModel.set({
  title: 'Test item',
  description: 'Some test content...'
});

// get all data from a model
let data = myModel.get();

// get a specific dataset
let title = myModel.get('title');

```
 There are a huche set of methods o deal with the model data.
 See [our api docs](docs) for a full list.

Routes
------

Core.io uses express-server under the hood. All files from you routes folder will be loaded and called automaticly.

`/routes/*.js` files are interpreted as a express middleware and should contain only route configurations.

```js
// routes/inde.js
module.exports = function(CoreIO) {
  app.get('/', (req, res) => {
    res.log('Hello world');
  });
};

```

```js
// models/fruits.js
let CoreIO = require('coreio');
let FruitsModel = CoreIO.createModel('fruits', {
  service: CoreIO.MongoDBService,
  schema: {
    name: { type: 'string', min: 3, max: 25, required: true }
  }
});

```


```js
let FruitsModel = require('../models/fruitsModel');
// let fruitsModel = new FruitsModel();

module.exports = function(app) {
  app.get('/fruits/:name', (req, res) => {
    FruitsModel.fetch(req.params.name).then(model => {
      let data = model.get();
      if (!data) {
        res.status(404);
        res.json({ msg: 'Not found' });
      }
    }).then(err => {
      res.status(500);
      res.send(err.message);
    });
  });
};

```

The short way

```js
let FruitsModel = require('../models/fruitsModel');

CoreIO.api('/fruits/:name', {
  get(ctx) {
    const model = new FruitsModel();
    return model.fetch({
      name: ctx.params.name
    });
  }
});

```

The super short way

```js
let FruitsModel = require('../models/fruitsModel');

CoreIO.api('/fruits/', {
  model: FruitsModel,
  allow: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LIST']
});


```
 is an equivalent of

```js
let FruitsModel = require('../models/fruitsModel');

CoreIO.api('/fruits/:id', {
  get(ctx) {
    const model = new FruitsModel();
    return model.fetch({
      name: ctx.params.name
    });
  },
  put(ctx) {
    const model = new FruitsModel();
    model.fetch({
      name: ctx.params.name
    });
    model.replace(ctx.body);
    return model.update();
  },
  patch(ctx) {
    const model = new FruitsModel();
    model.fetch({
      name: ctx.params.name
    });
    model.set(ctx.body);
    return model.update();
  },
  delete(ctx) {
    const model = new FruitsModel();
    return model.destroy({
      name: ctx.params.name
    });
  }
});

CoreIO.api('/fruits/', {
  get(ctx) {
    const model = new FruitsModel();
    const list = new XQCore.List(model.name, {
      model: FruitsModel
    });
    return list.fetch();
  },
  post(ctx) {
    const model = new FruitsModel();
    model.set(ctx.body);
    return model.save();
  }
});
```
