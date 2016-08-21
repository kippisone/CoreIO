'use strict';

let inspect = require('inspect.js');
let sinon = require('sinon');
inspect.useSinon(sinon);

let CoreIO = require('../src/coreio');

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
});
