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
