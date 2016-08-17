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

    it.only('creates a model class', function() {
      let model = CoreIO.createModel('test', {});
      inspect(model).isClass();
      inspect(model).isInheritedBy(CoreIO.Model);
    });
  });
});
