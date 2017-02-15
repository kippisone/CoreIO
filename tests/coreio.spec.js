'use strict';

let inspect = require('inspect.js');
let sinon = require('sinon');
inspect.useSinon(sinon);

let CoreIO = require('../lib/coreio');

describe('CoreIO', function() {
  describe('createModel', function() {
    it('does exists', function() {
      inspect(CoreIO).hasMethod('createModel');
    });

    it('creates a model class', function() {
      let Model = CoreIO.createModel('test', {});
      inspect(Model).isClass();
      inspect(Model).isInheritedBy(CoreIO.Model);
    });

    it('creates a model class with config', function() {
      let Model = CoreIO.createModel('test', {
        schema: {
          name: { type: 'string', min: 3, max: 10 }
        }
      });

      let model = new Model();
      inspect(model).isObject();
      inspect(model).isInstanceOf(CoreIO.Model);
      inspect(model.schema).isEql({
        name: { type: 'string', min: 3, max: 10 }
      });
    });
  });

  describe('createList', function() {
    it('does exists', function() {
      inspect(CoreIO).hasMethod('createList');
    });

    it('creates a model class', function() {
      let List = CoreIO.createList('test', {});
      inspect(List).isClass();
      inspect(List).isInheritedBy(CoreIO.List);
    });

    it('creates a model class with config', function() {
      let List = CoreIO.createList('test', {
        schema: {
          name: { type: 'string', min: 3, max: 10 }
        }
      });

      let model = new List();
      inspect(model).isObject();
      inspect(model).isInstanceOf(CoreIO.List);
      inspect(model.schema).isEql({
        name: { type: 'string', min: 3, max: 10 }
      });
    });
  });


  describe('createSyncModel', function() {
    it('does exists', function() {
      inspect(CoreIO).hasMethod('createSyncModel');
    });

    it('creates a syncmodel class', function() {
      let SyncModel = CoreIO.createSyncModel('test', {});
      inspect(SyncModel).isClass();
      inspect(SyncModel).isInheritedBy(CoreIO.Model);
    });

    it('creates a syncmodel class with config', function() {
      let SyncModel = CoreIO.createSyncModel('test', {
        schema: {
          name: { type: 'string', min: 3, max: 10 }
        }
      });

      let syncModel = new SyncModel();
      inspect(syncModel).isObject();
      inspect(syncModel).isInstanceOf(CoreIO.SyncModel);
      inspect(syncModel.schema).isEql({
        name: { type: 'string', min: 3, max: 10 }
      });
    });
  });

  describe('createSyncList', function() {
    it('does exists', function() {
      inspect(CoreIO).hasMethod('createSyncList');
    });

    it('creates a model class', function() {
      let SyncList = CoreIO.createSyncList('test', {});
      inspect(SyncList).isClass();
      inspect(SyncList).isInheritedBy(CoreIO.List);
    });

    it('creates a model class with config', function() {
      let SyncList = CoreIO.createSyncList('test', {
        schema: {
          name: { type: 'string', min: 3, max: 10 }
        }
      });

      let model = new SyncList();
      inspect(model).isObject();
      inspect(model).isInstanceOf(CoreIO.SyncList);
      inspect(model.schema).isEql({
        name: { type: 'string', min: 3, max: 10 }
      });
    });
  });

  describe('createService', function() {
    it('does exists', function() {
      inspect(CoreIO).hasMethod('createService');
    });

    it('creates a service class', function() {
      let Service = CoreIO.createService('test', {});
      inspect(Service).isClass();
      inspect(Service).isInheritedBy(CoreIO.Service);
    });

    it('creates a service class with config', function() {
      let Service = CoreIO.createService('test', {
        foo: 'bar'
      });

      let service = new Service();
      inspect(service).isObject();
      inspect(service).isInstanceOf(CoreIO.Service);
      inspect(service.foo).isEql('bar');
    });
  });

  describe('api', function() {
    it('registers an API route', function() {
      let TestModel = CoreIO.createModel('test', {
        defaults: { foo: 'bar' }
      });

      CoreIO.api('/test', {
        model: TestModel
      });
    });
  });
});
