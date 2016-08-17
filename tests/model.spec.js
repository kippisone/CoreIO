'use strict';

let inspect = require('inspect.js');
let sinon = require('sinon');
inspect.useSinon(sinon);

let CoreIO = require('../src/coreio');

describe('CoreIO Model', function() {
  'use strict';

  describe('initialize', function() {
    it('Should initialize a model', function() {
      var model,
        initFunc = sinon.spy();

      model = new CoreIO.Model('Test II', initFunc);

      inspect(model).isInstanceOf(CoreIO.Model);
      inspect(initFunc).wasCalled();
    });

    it('Should get a model name from first arg', function() {
      var model = new CoreIO.Model('Test');
      inspect(model.name).isEql('TestModel');
    });

    it('Should get a presener name from conf object', function() {
      var model = new CoreIO.Model({
        name: 'Test'
      });

      inspect(model.name).isEql('TestModel');
    });

    it('Should set a default model name', function() {
      var model = new CoreIO.Model();
      inspect(model.name).isEql('NamelessModel');
    });

    it('Should set default data', function() {
      var changeStub = sinon.stub();
      var validationStub = sinon.stub(CoreIO.Model.prototype, 'validate');
      var setSpy = sinon.spy(CoreIO.Model.prototype, 'set');

      var model = new CoreIO.Model('test', function(self) {
        self.schema = { name: { type: 'string', required: true }};
        self.defaults = {name: 'Andi'};
      });

      model.on('data.change', changeStub);

      inspect(validationStub).wasNotCalled();
      inspect(model.properties).isEql({name: 'Andi'});
      inspect(changeStub).wasNotCalled();
      inspect(setSpy).wasCalledOnce();
      inspect(setSpy).wasCalledWith({
        name: 'Andi'
      }, {
        silent: true,
        noValidation: true
      });


      validationStub.restore();
      setSpy.restore();
    });

    it('Should overwrite a core method', function() {
      var fetchStub = sinon.stub();
      var model = new CoreIO.Model('Test', function(self) {
        self.fetch = fetchStub;
      });
      model.fetch();

      inspect(fetchStub).wasCalled();
    });
  });

  describe('inherit', function() {
    it('Should return a prototype inherited by Model', function() {
      var Model = CoreIO.Model.inherit('test', {
        title: { type: 'string' }
      });

      var model = new Model();
      inspect(model.name).isEql('testModel');
      inspect(model).isNotEqual({
        title: { type: 'string' }
      });
    });

    it('Should apply arguments to the constructor of the inherited class', function() {
      var Model = CoreIO.Model.inherit('test', {
        schema: {
          title: { type: 'sting' }
        }
      });

      inspect(Model).isFunction();
      var model1 = new Model();
      var model2 = new Model();
      inspect(model1).isInstanceOf(CoreIO.Model);
      inspect(model1).isNotEqual(model2);
    });
  });

  describe('get', function() {
    var model,
      modelData;

    beforeEach(function() {
      modelData = {
        name: 'Andi',
        favorites: [
          {name: 'Augustiner', voting: 'Best beer ever'},
          {name: 'Bulmers', voting: 'Very delicious cider'}
        ],
        sayHello: function() {
          return 'Servus!';
        },
        profession: {
          name: 'Developer'
        }
      };

      model = new CoreIO.Model('test');
      model.properties = modelData;
    });

    it('Should get all data of a model', function() {
      inspect(model.get()).isObject();
      inspect(model.get()).isEql(modelData);
    });

    it('Should get a item of a model (type string)', function() {
      inspect(model.get('name')).isString();
      inspect(model.get('name')).isEql('Andi');
    });

    it('Should get a item of a model (type array)', function() {
      inspect(model.get('favorites')).isArray();
      inspect(model.get('favorites')).isEql(modelData.favorites);
    });

    it('Should get a item of a model (type object)', function() {
      inspect(model.get('profession')).isObject();
      inspect(model.get('profession')).isEql(modelData.profession);
    });

    it('Should get a item of a model (type function)', function() {
      inspect(model.get('sayHello')).isFunction();
      inspect(model.get('sayHello')()).isEql('Servus!');
    });

    it('Should get a deep item of a model (type string)', function() {
      inspect(model.get('profession.name')).isString();
      inspect(model.get('profession.name')).isEql('Developer');
    });

    it('Should get a pointer of the dataset', function() {
      var data = model.get();

      inspect(data).isEqual(modelData);
    });

    it('Should get a pointer of the sub dataset (string)', function() {
      var data = model.get('name');

      inspect(data).isEqual(modelData.name);
    });

    it('Should get a pointer of the sub dataset (array)', function() {
      var data = model.get('favorites');

      inspect(data).isArray();
      inspect(data).isEqual(modelData.favorites);
    });

    it('Should get a pointer of the sub dataset (function)', function() {
      var data = model.get('sayHello');

      inspect(data).isEqual(modelData.sayHello);
    });

    it('Should get a pointer of the sub dataset (object)', function() {
      var data = model.get('profession');

      inspect(data).isEqual(modelData.profession);
    });

    //Set copy flag

    it('Should get all data of a model, copy flag is true', function() {
      inspect(model.get(null, { copy: true })).isObject();
      inspect(model.get(null, { copy: true })).isEql(modelData);
    });

    it('Should get a item of a model (type string), copy flag is true', function() {
      inspect(model.get('name', { copy: true })).isString();
      inspect(model.get('name', { copy: true })).isEql('Andi');
    });

    it('Should get a item of a model (type array), copy flag is true', function() {
      inspect(model.get('favorites', { copy: true })).isArray();
      inspect(model.get('favorites', { copy: true })).isEql(modelData.favorites);
    });

    it('Should get a item of a model (type object), copy flag is true', function() {
      inspect(model.get('profession', { copy: true })).isObject();
      inspect(model.get('profession', { copy: true })).isEql(modelData.profession);
    });

    it('Should get a item of a model (type function), copy flag is true', function() {
      inspect(model.get('sayHello', { copy: true })).isFunction();
      inspect(model.get('sayHello', { copy: true })()).isEql('Servus!');
    });

    it('Should get a deep item of a model (type string), copy flag is true', function() {
      inspect(model.get('profession.name', { copy: true })).isString();
      inspect(model.get('profession.name', { copy: true })).isEql('Developer');
    });

    it('Should get a copy of the dataset', function() {
      var data = model.get(null, {copy: true});

      inspect(data).isNotEqual(modelData);
      inspect(data).isEql(modelData);
    });

    it('Should get a copy of the sub dataset (string)', function() {
      var data = model.get('name', { copy: true });

      inspect(data).isEql(modelData.name);
    });

    it('Should get a copy of the sub dataset (array)', function() {
      var data = model.get('favorites', { copy: true });

      inspect(data).isArray();
      inspect(data).isNotEqual(modelData.favorites);
      inspect(data).isEql(modelData.favorites);
    });

    it('Should get a copy of the sub dataset (function)', function() {
      var data = model.get('sayHello', { copy: true });

      inspect(data).isNotEqual(modelData.sayHello);
      inspect(data.toString()).isEql(modelData.sayHello.toString());
    });

    it('Should get a copy of the sub dataset (object)', function() {
      var data = model.get('profession', { copy: true });

      inspect(data).isNotEqual(modelData.profession);
      inspect(data).isEql(modelData.profession);
    });
  });

  describe('getByKeys', function() {
    it('Should get data by a key array', function() {
      var data = {
        'name': 1,
        'title': 1,
        'category': 1,
        'state': 1
      };

      var keys = ['name', 'title', 'category'];
      var model = new CoreIO.Model('test');
      var result = model.getByKeys(keys, data);
      inspect(result).isEql({
        'name': 1,
        'title': 1,
        'category': 1
      });
    });

    it('Should get data by a key array with subdata', function() {
      var data = {
        'user': {
          'name': 1,
          'id': 1
        },
        'title': 1,
        'category': 1,
        'state': 1
      };

      var keys = ['user.name', 'title', 'category'];
      var model = new CoreIO.Model('test');
      var result = model.getByKeys(keys, data);
      inspect(result).isEql({
        'user': {
          'name': 1
        },
        'title': 1,
        'category': 1,
      });
    });

    it('Should get data by a key array with subdata, some input data ar missing', function() {
      var data = {
        'title': 1,
        'state': 1
      };

      var keys = ['user.name', 'title', 'category'];
      var model = new CoreIO.Model('test');
      var result = model.getByKeys(keys, data);
      inspect(result).isEql({
        'user': {
          'name': undefined
        },
        'title': 1,
        'category': undefined,
      });
    });

    it('Should get data by a key object', function() {
      var data = {
        'name': 'Andi',
        'title': 'Test',
        'category': 'Bla > Blubb',
        'state': 'new'
      };

      var keys = {
        'name': 1,
        'title': 1,
        'category': 1
      };

      var model = new CoreIO.Model('test');
      var result = model.getByKeys(keys, data);
      inspect(result).isEql({
        'name': 'Andi',
        'title': 'Test',
        'category': 'Bla > Blubb'
      });
    });

    it('Should get data by a key object with subdata', function() {
      var data = {
        'user': {
          'name': 'Andi',
          'id': '123'
        },
        'title': 'Test',
        'category': 'Bla > Blubb',
        'state': 'new'
      };

      var keys = {
        'user': {
          'name': 1
        },
        'title': 1,
        'category': 1
      };

      var model = new CoreIO.Model('test');
      var result = model.getByKeys(keys, data);
      inspect(result).isEql({
        'user': {
          'name': 'Andi'
        },
        'title': 'Test',
        'category': 'Bla > Blubb',
      });
    });


  });

  describe('set', function() {
    var model,
      modelData;

    beforeEach(function() {
      modelData = {
        name: 'Andi',
        sayHello: function() {
          return 'Servus!';
        }
      };
      model = new CoreIO.Model('test');
    });

    it('Should set model data', function() {
      model.set(modelData);
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(modelData);
    });

    it('Should set model item', function() {
      model.set(modelData);
      model.set('profession', 'Developer');
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(Object.assign(modelData, {
        profession: 'Developer'
      }));
    });

    it('Should set deep item', function() {
      model.set(modelData);
      model.set('profession.name', 'Developer');
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(Object.assign(modelData, {
        profession: {
          name: 'Developer'
        }
      }));
    });

    it('Should set model data and should trigger an event', function() {
      var emitStub = sinon.stub(model, 'emit');

      model.set(modelData);
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(modelData);

      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('data.set', model.properties, {});
      inspect(emitStub).wasCalledWith('data.change', model.properties, {});

      emitStub.restore();
    });

    it('Should set model item and should trigger an event', function() {
      var emitStub = sinon.stub(model, 'emit');

      model.properties = modelData;
      model.set('profession', 'Developer');
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(Object.assign(modelData, {
        profession: 'Developer'
      }));

      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('value.set', 'profession', 'Developer');
      inspect(emitStub).wasCalledWith('data.change', model.properties, modelData);

      emitStub.restore();
    });

    it('Should set deep item and should trigger an event', function() {
      var emitStub = sinon.stub(model, 'emit');

      model.properties = modelData;
      model.set('profession.name', 'Developer');
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(Object.assign(modelData, {
        profession: {
          name: 'Developer'
        }
      }));

      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('value.set', 'profession.name', 'Developer');
      inspect(emitStub).wasCalledWith('data.change', model.properties, modelData);

      emitStub.restore();
    });

    it('Should set model data and should never trigger an event', function() {
      var emitStub = sinon.stub(model, 'emit');

      model.set(modelData, { silent: true });
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(modelData);

      inspect(emitStub).wasNotCalled();

      emitStub.restore();
    });

    it('Should set model item and should never trigger an event', function() {
      var emitStub = sinon.stub(model, 'emit');

      model.properties = modelData;
      model.set('profession', 'Developer', { silent: true });
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(Object.assign(modelData, {
        profession: 'Developer'
      }));

      inspect(emitStub).wasNotCalled();

      emitStub.restore();
    });

    it('Should set deep item and should never trigger an event', function() {
      var emitStub = sinon.stub(model, 'emit');

      model.properties = modelData;
      model.set('profession.name', 'Developer', { silent: true });
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(Object.assign(modelData, {
        profession: {
          name: 'Developer'
        }
      }));

      inspect(emitStub).wasNotCalled();

      emitStub.restore();
    });

    it('Should set model data and should validate the model. The validation fails and no data may be changed', function() {
      var validationStub = sinon.stub(model, 'validate');
      validationStub.returns({});
      model.schema = { name: 'String' };

      model.set(modelData);
      inspect(model.properties).isObject();
      inspect(model.properties).isEql({});

      inspect(validationStub).wasCalled();
      inspect(validationStub).wasCalledWith(modelData);

      validationStub.restore();
    });

    it('Should set model data and should validate the model. The validation succeeds and the data may be changed', function() {
      var validationStub = sinon.stub(model, 'validate');
      validationStub.returns(null);
      model.schema = { name: 'String' };

      model.set(modelData);
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(modelData);

      inspect(validationStub).wasCalled();
      inspect(validationStub).wasCalledWith(modelData);

      validationStub.restore();
    });

    it('Should set model item and should validate the model. The validation fails and no data may be changed', function() {
      var validationStub = sinon.stub(model, 'validate');
      validationStub.returns({});
      model.schema = { profession: { type: 'String' } };

      model.properties = modelData;
      model.set('profession', 'Developer');
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(Object.assign({
        profession: 'Developer'
      }, modelData));

      inspect(validationStub).wasCalled();
      inspect(validationStub).wasCalledWith(Object.assign({}, modelData, {
        profession: 'Developer'
      }));

      validationStub.restore();
    });

    it('Should set model item and should validate the model. The validation succeeds and the data may be changed', function() {
      var validationStub = sinon.stub(model, 'validate');
      validationStub.returns(null);
      model.schema = { profession: { type: 'String' } };

      model.properties = modelData;
      model.set('profession', 'Developer');
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(Object.assign({}, modelData, {
        profession: 'Developer'
      }));

      inspect(validationStub).wasCalled();
      inspect(validationStub).wasCalledWith(Object.assign({}, modelData, {
        profession: 'Developer'
      }));

      validationStub.restore();
    });

    it('Should set deep item and should validate the model. The validation fails and no data may be changed', function() {
      var validationStub = sinon.stub(model, 'validate');
      validationStub.returns({});
      model.schema = { name: 'String' };

      model.properties = modelData;
      model.set('profession.name', 'Developer');
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(Object.assign({
        profession: {
          name: 'Developer'
        }
      }, modelData));

      inspect(validationStub).wasCalled();
      inspect(validationStub).wasCalledWith(Object.assign({}, modelData, {
        profession: {
          name: 'Developer'
        }
      }));

      validationStub.restore();
    });

    it('Should set deep item and should validate the model. The validation succeeds and the data may be changed', function() {
      var validationStub = sinon.stub(model, 'validate');
      validationStub.returns(null);
      model.schema = { name: 'String' };

      model.properties = modelData;
      model.set('profession.name', 'Developer');
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(Object.assign({}, modelData, {
        profession: {
          name: 'Developer'
        }
      }));

      inspect(validationStub).wasCalled();
      inspect(validationStub).wasCalledWith(Object.assign({}, modelData, {
        profession: {
          name: 'Developer'
        }
      }));

      validationStub.restore();
    });

    it.skip('Should set model item enable validateOne, the validation fails', function() {
      var validationStub = sinon.stub(model, 'validate');
      var validationOneStub = sinon.stub(model, 'validateOne');
      validationOneStub.returns({ isValid: false });
      model.schema = { profession: { type: 'String' } };

      model.properties = modelData;
      model.set('profession', 'Developer');
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(Object.assign({
        profession: 'Developer'
      }, modelData));

      inspect(validationOneStub).wasCalled();
      inspect(validationOneStub).wasCalledWith({ type: 'String' }, 'Developer');

      validationStub.restore();
      validationOneStub.restore();
    });

    it.skip('Should set model item enable validateOne, the validation succeeds', function() {
      var validationStub = sinon.stub(model, 'validate');
      var validationOneStub = sinon.stub(model, 'validateOne');
      validationOneStub.returns({ isValid: true });
      model.schema = { profession: { type: 'String' } };

      model.properties = modelData;
      model.set('profession', 'Developer', { validateOne: true });
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(Object.assign({}, modelData, {
        profession: 'Developer'
      }));

      inspect(validationStub).wasNotCalled();
      inspect(validationOneStub).wasCalled();
      inspect(validationOneStub).wasCalledWith({ type: 'String' }, 'Developer');

      validationStub.restore();
      validationOneStub.restore();
    });

    it('Should call sync method with set mode', function() {
      var syncStub = sinon.stub();
      model.sync = syncStub;

      model.set({a: 'aa'}, { noSync: false });

      inspect(syncStub).wasCalledOnce();
      inspect(syncStub).wasCalledWith('set', {a:'aa'});
    });

    it('Should call sync method with item mode', function() {
      var syncStub = sinon.stub();
      model.sync = syncStub;

      model.set('a', 'aa', {noSync: false});

      inspect(syncStub).wasCalledOnce();
      inspect(syncStub).wasCalledWith('value', 'a', 'aa');
    });

    it('Should not call sync method when sync option is false', function() {
      var syncStub = sinon.stub();
      model.sync = syncStub;

      model.set({a: 'aa'}, { noSync: true });

      inspect(syncStub).wasNotCalled();
    });

    it('Should not call sync method when sync option is false', function() {
      var syncStub = sinon.stub();
      model.sync = syncStub;

      model.set('a', 'aa', { noSync: true });

      inspect(syncStub).wasNotCalled();
    });

    it('Should not call sync method when validation fails', function() {
      var syncStub = sinon.stub();
      var validationStub = sinon.stub(model, 'validate');
      validationStub.returns({});

      model.sync = syncStub;
      model.schema = { a: 'Number' };

      model.set({a: 'aa'}, {noSync: false});

      inspect(validationStub).wasCalledOnce();
      inspect(syncStub).wasNotCalled();
    });

    it('Should not call sync method when validation fails', function() {
      var syncStub = sinon.stub();
      var validationStub = sinon.stub(model, 'validate');
      validationStub.returns([{ property: 'a' }]);

      model.sync = syncStub;
      model.schema = { a: 'Number' };

      model.set('a', 'aa', {noSync: false});

      inspect(validationStub).wasCalledOnce();
      inspect(syncStub).wasNotCalled();
    });

    it('Should set default values of a model with a schema', function() {
      model.schema = {
        name: { type: 'string', required: true },
        foo: { type: 'string', default: 'test' },
        bar: { type: 'number', default: 123 },
      };

      model.set({
        name: 'Test'
      });

      inspect(model.get()).isEql({
        name: 'Test',
        foo: 'test',
        bar: 123
      });
    });

    it('Should set data in a model with a nested schema', function() {
      model.schema = {
        'title': { type: 'string', min: '3', max: '120', required: true },
        'categoryId': {
          'ref': 'tasks-categories',
          'schema': {
            'category': { type: 'string', min: '3', max: '120', required: true }
          }
        },
        'content': { type: 'string', min: '3', max: '5000', required: true }
      };

      model.set({
        title: 'Test item',
        category: 'Test > Category',
        content: 'Test content'
      });

      inspect(model.lastValidationError).isNull();
      inspect(model.isValid()).isTrue();
    });

    it('Should set data in a model with a nested schema and falidation should fail', function() {
      model.schema = {
        'title': { type: 'string', min: '3', max: '120', required: true },
        'categoryId': {
          'ref': 'tasks-categories',
          'schema': {
            'category': { type: 'string', min: '3', max: '5', required: true }
          }
        },
        'content': { type: 'string', min: '3', max: '5000', required: true }
      };

      model.set({
        title: 'Test item',
        category: 'Test > Category',
        content: 'Test content'
      });

      inspect(model.isValid()).isFalse();
      inspect(model.lastValidationError[0].errCode).isEql(13);
    });
  });

  describe('set with custom validation', function() {
    var model,
      modelData;

    beforeEach(function() {
      modelData = {
        name: 'Andi',
        sayHello: function() {
          return 'Servus!';
        }
      };

      model = new CoreIO.Model('test', {
        validate: function() {}
      });
    });

    it('Should set model item a custom validation was set and the validation fails', function() {
      var validationStub = sinon.stub(model, 'validate');
      var validationOneStub = sinon.stub(model, 'validateOne');
      var customValidationStub = sinon.stub(model, 'customValidate');

      customValidationStub.returns({});
      model.schema = { profession: { type: 'String' } };

      model.properties = modelData;
      model.set('profession', 'Developer');
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(modelData);

      inspect(validationStub).wasNotCalled();
      inspect(validationOneStub).wasNotCalled();
      inspect(customValidationStub).wasCalled();
      inspect(customValidationStub).wasCalledWith(Object.assign({}, modelData, {
        profession: 'Developer'
      }));

      validationStub.restore();
      validationOneStub.restore();
      customValidationStub.restore();
    });

    it('Should set model item a custom validation was set and the validation fails', function() {
      var validationStub = sinon.stub(model, 'validate');
      var validationOneStub = sinon.stub(model, 'validateOne');
      var customValidationStub = sinon.stub(model, 'customValidate');

      customValidationStub.returns(null);
      model.schema = { profession: { type: 'String' } };

      model.properties = modelData;
      model.set('profession', 'Developer');
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(Object.assign({}, modelData, {
        profession: 'Developer'
      }));

      inspect(validationStub).wasNotCalled();
      inspect(validationOneStub).wasNotCalled();
      inspect(customValidationStub).wasCalled();
      inspect(customValidationStub).wasCalledWith(Object.assign({}, modelData, {
        profession: 'Developer'
      }));

      validationStub.restore();
      validationOneStub.restore();
      customValidationStub.restore();
    });

  });

  describe('replace', function() {
    var model,
      modelData;

    beforeEach(function() {
      modelData = {
        name: 'Andi',
        sayHello: function() {
          return 'Servus!';
        }
      };
      model = new CoreIO.Model('test');
      model.set({
        a: 'aa',
        b: 'bb'
      });
    });

    it('Should replace model data', function() {
      model.replace(modelData);
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(modelData);
    });

    it('Should replace model data and should trigger an event', function() {
      var emitStub = sinon.stub(model, 'emit');

      model.replace(modelData);
      inspect(model.properties).isObject();
      inspect(model.properties).isEql(modelData);

      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('data.replace', model.properties, { a: 'aa', b: 'bb' });
      inspect(emitStub).wasCalledWith('data.change', model.properties, { a: 'aa', b: 'bb' });

      emitStub.restore();
    });

    it('Should call sync method with replace mode', function() {
      var syncStub = sinon.stub();
      model.sync = syncStub;

      model.replace({a: 'aa'}, { noSync: false });

      inspect(syncStub).wasCalledOnce();
      inspect(syncStub).wasCalledWith('replace', {a:'aa'});
    });
  });

  describe('push', function() {
    var model;

    beforeEach(function() {
      model = new CoreIO.Model('test');
    });

    it('Should push data to a subset', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = {
        listing: [
          { name: 'AAA', value: '1' },
          { name: 'BBB', value: '2' },
          { name: 'CCC', value: '3' }
        ]
      };

      var finalData = {
        listing: [
          { name: 'AAA', value: '1' },
          { name: 'BBB', value: '2' },
          { name: 'CCC', value: '3' },
          { name: 'DDD', value: '4' }
        ]
      };

      model.push('listing', {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('item.insert', 'listing', -1, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledWith('data.change', finalData);

      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should push data to a subset (path ist listing.data)', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = {
        listing: {
          data: [
            { name: 'AAA', value: '1' },
            { name: 'BBB', value: '2' },
            { name: 'CCC', value: '3' }
          ]
        }
      };

      var finalData = {
        listing: {
          data: [
            { name: 'AAA', value: '1' },
            { name: 'BBB', value: '2' },
            { name: 'CCC', value: '3' },
            { name: 'DDD', value: '4' }
          ]
        }
      };

      model.push('listing.data', {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('item.insert', 'listing.data', -1, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledWith('data.change', finalData);

      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should push data to a subset (path is null)', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = [
        { name: 'AAA', value: '1' },
        { name: 'BBB', value: '2' },
        { name: 'CCC', value: '3' }
      ];

      var finalData = [
        { name: 'AAA', value: '1' },
        { name: 'BBB', value: '2' },
        { name: 'CCC', value: '3' },
        { name: 'DDD', value: '4' }
      ];

      model.push(null, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('item.insert', null, -1, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledWith('data.change', finalData);

      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should push data to a not existing dataset', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = {};

      var finalData = [
        { name: 'DDD', value: '4' }
      ];

      model.push(null, {name: 'DDD', value: '4'});

      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('item.insert', null, -1, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledWith('data.change', finalData);


      emitStub.restore();
    });

    it('Should push data to a existing dataset and should fail with an error', function() {
      let log = require('logtopus').getLogger('coreio');
      let emitStub = sinon.stub(model, 'emit'),
        errorStub = sinon.stub(log, 'error');

      model.properties = { listing: {} };
      model.push('listing', {name: 'DDD', value: '4'});
      inspect(errorStub).wasCalled();
      inspect(errorStub).wasCalledWithMatch(/Model.push requires an array./);
      inspect(emitStub).wasNotCalled();

      emitStub.restore();
      errorStub.restore();
    });

    it('Should call sync method with push mode', function() {
      var syncStub = sinon.stub();
      model.sync = syncStub;

      model.properties = { listing: [] };
      model.push('listing', {a: 'aa'}, { noSync: false });

      inspect(syncStub).wasCalledOnce();
      inspect(syncStub).wasCalledWith('insert', 'listing', -1, {a:'aa'});
    });

    it('Should not call sync method when sync option is false', function() {
      var syncStub = sinon.stub();
      model.sync = syncStub;

      model.properties = { listing: [] };
      model.push('listing', {a: 'aa'}, { noSync: true });

      inspect(syncStub).wasNotCalled();
    });
  });

  describe('unshift', function() {
    var model;

    beforeEach(function() {
      model = new CoreIO.Model('test');
    });

    it('Should unshift data to a subset', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = { listing: [
        { name: 'AAA', value: '1' },
        { name: 'BBB', value: '2' },
        { name: 'CCC', value: '3' }
      ]};

      var finalData = {
        listing: [
          { name: 'DDD', value: '4' },
          { name: 'AAA', value: '1' },
          { name: 'BBB', value: '2' },
          { name: 'CCC', value: '3' }
        ]
      };

      model.unshift('listing', {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('item.insert', 'listing', 0, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledWith('data.change', finalData);

      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should unshift data to a subset (path ist listing.data)', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = {
        listing: {
          data: [
            { name: 'AAA', value: '1' },
            { name: 'BBB', value: '2' },
            { name: 'CCC', value: '3' }
          ]
        }
      };

      var finalData = {
        listing: {
          data: [
            { name: 'DDD', value: '4' },
            { name: 'AAA', value: '1' },
            { name: 'BBB', value: '2' },
            { name: 'CCC', value: '3' }
          ]
        }
      };

      model.unshift('listing.data', {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('item.insert', 'listing.data', 0, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledWith('data.change', finalData);

      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should unshift data to a subset (path is null)', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = [
        { name: 'AAA', value: '1' },
        { name: 'BBB', value: '2' },
        { name: 'CCC', value: '3' }
      ];

      var finalData = [
        { name: 'DDD', value: '4' },
        { name: 'AAA', value: '1' },
        { name: 'BBB', value: '2' },
        { name: 'CCC', value: '3' }
      ];

      model.unshift(null, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('item.insert', null, 0, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledWith('data.change', finalData);


      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should unshift data to a not existing dataset', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = {};

      var finalData = [
        { name: 'DDD', value: '4' }
      ];

      model.unshift(null, {name: 'DDD', value: '4'});

      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('item.insert', null, 0, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledWith('data.change', finalData);


      emitStub.restore();
    });

    it('Should unshift data to a existing dataset and should fail with an error', function() {
      let log = require('logtopus').getLogger('coreio');
      let emitStub = sinon.stub(model, 'emit'),
        errorStub = sinon.stub(log, 'error');

      model.properties = { listing: {} };
      model.unshift('listing', {name: 'DDD', value: '4'});
      inspect(errorStub).wasCalled();
      inspect(errorStub).wasCalledWithMatch(/Model.unshift requires an array./);
      inspect(emitStub).wasNotCalled();

      emitStub.restore();
      errorStub.restore();
    });

    it('Should call sync method with unshift mode', function() {
      var syncStub = sinon.stub();
      model.sync = syncStub;

      model.properties = { listing: [] };
      model.unshift('listing', {a: 'aa'}, {noSync: false });

      inspect(syncStub).wasCalledOnce();
      inspect(syncStub).wasCalledWith('insert', 'listing', 0, {a:'aa'});
    });

    it('Should not call sync method when sync option is false', function() {
      var syncStub = sinon.stub();
      model.sync = syncStub;

      model.properties = { listing: [] };
      model.unshift('listing', {a: 'aa'}, { noSync: true });

      inspect(syncStub).wasNotCalled();
    });
  });

  describe('insert', function() {
    var model;

    beforeEach(function() {
      model = new CoreIO.Model('test');
    });

    it('Should insert data to a subset', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = { listing: [
        { name: 'AAA', value: '1' },
        { name: 'BBB', value: '2' },
        { name: 'CCC', value: '3' }
      ]};

      var finalData = {
        listing: [
          { name: 'AAA', value: '1' },
          { name: 'DDD', value: '4' },
          { name: 'BBB', value: '2' },
          { name: 'CCC', value: '3' }
        ]
      };

      model.insert('listing', 1, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('item.insert', 'listing', 1, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledWith('data.change', finalData);

      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should insert data to a subset (path ist listing.data)', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = {
        listing: {
          data: [
            { name: 'AAA', value: '1' },
            { name: 'BBB', value: '2' },
            { name: 'CCC', value: '3' }
          ]
        }
      };

      var finalData = {
        listing: {
          data: [
            { name: 'AAA', value: '1' },
            { name: 'DDD', value: '4' },
            { name: 'BBB', value: '2' },
            { name: 'CCC', value: '3' }
          ]
        }
      };

      model.insert('listing.data', 1, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('item.insert', 'listing.data', 1, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledWith('data.change', finalData);

      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should insert data to a subset (path is null)', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = [
        { name: 'AAA', value: '1' },
        { name: 'BBB', value: '2' },
        { name: 'CCC', value: '3' }
      ];

      var finalData = [
        { name: 'AAA', value: '1' },
        { name: 'DDD', value: '4' },
        { name: 'BBB', value: '2' },
        { name: 'CCC', value: '3' }
      ];

      model.insert(null, 1, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('item.insert', null, 1, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledWith('data.change', finalData);


      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should insert data to a subset and should never emit an event', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = [
        { name: 'AAA', value: '1' },
        { name: 'BBB', value: '2' },
        { name: 'CCC', value: '3' }
      ];

      var finalData = [
        { name: 'AAA', value: '1' },
        { name: 'DDD', value: '4' },
        { name: 'BBB', value: '2' },
        { name: 'CCC', value: '3' }
      ];

      model.insert(null, 1, {name: 'DDD', value: '4'}, {
        silent: true
      });

      inspect(emitStub).wasNotCalled();
      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it.skip('Should insert data to a not existing dataset', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = {};

      var finalData = [
        { name: 'DDD', value: '4' }
      ];

      model.insert(null, 1, {name: 'DDD', value: '4'});

      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('item.insert', null, 1, {name: 'DDD', value: '4'});
      inspect(emitStub).wasCalledWith('data.change', finalData);


      emitStub.restore();
    });

    it('Should insert data to a existing dataset and should fail with an error', function() {
      let log = require('logtopus').getLogger('coreio');
      let emitStub = sinon.stub(model, 'emit'),
        errorStub = sinon.stub(log, 'error');

      model.properties = { listing: {} };
      model.insert('listing', 1, {name: 'DDD', value: '4'});
      inspect(errorStub).wasCalled();
      inspect(errorStub).wasCalledWithMatch(/Model.insert requires an array./);
      inspect(emitStub).wasNotCalled();

      emitStub.restore();
      errorStub.restore();
    });

    it('Should call sync method with insert mode', function() {
      var syncStub = sinon.stub();
      model.sync = syncStub;

      model.properties = { listing: [] };
      model.insert('listing', 1, {a: 'aa'}, {noSync: false });

      inspect(syncStub).wasCalledOnce();
      inspect(syncStub).wasCalledWith('insert', 'listing', 1, {a:'aa'});
    });

    it('Should not call sync method when sync option is false', function() {
      var syncStub = sinon.stub();
      model.sync = syncStub;

      model.properties = { listing: [] };
      model.insert('listing', 1, {a: 'aa'}, { noSync: true });

      inspect(syncStub).wasNotCalled();
    });
  });

  describe('remove', function() {
    var model;

    beforeEach(function() {
      model = new CoreIO.Model('test');
    });

    it('Should remove data to a subset', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = { listing: [
        { name: 'AAA', value: '1' },
        { name: 'BBB', value: '2' },
        { name: 'CCC', value: '3' }
      ]};

      var finalData = {
        listing: [
          { name: 'AAA', value: '1' },
          { name: 'CCC', value: '3' }
        ]
      };

      model.remove('listing', 1);
      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('item.remove', 'listing', 1, { name: 'BBB', value: '2' });
      inspect(emitStub).wasCalledWith('data.change', finalData);

      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should remove data to a subset (path ist listing.data)', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = {
        listing: {
          data: [
            { name: 'AAA', value: '1' },
            { name: 'BBB', value: '2' },
            { name: 'CCC', value: '3' }
          ]
        }
      };

      var finalData = {
        listing: {
          data: [
            { name: 'AAA', value: '1' },
            { name: 'CCC', value: '3' }
          ]
        }
      };

      model.remove('listing.data', 1);
      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('item.remove', 'listing.data', 1, { name: 'BBB', value: '2' });
      inspect(emitStub).wasCalledWith('data.change', finalData);

      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should remove data to a subset (path is null)', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = [
        { name: 'AAA', value: '1' },
        { name: 'BBB', value: '2' },
        { name: 'CCC', value: '3' }
      ];

      var finalData = [
        { name: 'AAA', value: '1' },
        { name: 'CCC', value: '3' }
      ];

      model.remove(null, 1);
      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('item.remove', null, 1, { name: 'BBB', value: '2' });
      inspect(emitStub).wasCalledWith('data.change', finalData);


      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should remove data to a subset and should never emit an event', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = [
        { name: 'AAA', value: '1' },
        { name: 'BBB', value: '2' },
        { name: 'CCC', value: '3' }
      ];

      var finalData = [
        { name: 'AAA', value: '1' },
        { name: 'CCC', value: '3' }
      ];

      model.remove(null, 1, {
        silent: true
      });

      inspect(emitStub).wasNotCalled();
      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should remove data from a not existing dataset', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = {};

      model.remove('listing', 1);

      inspect(emitStub).wasNotCalled();
      emitStub.restore();
    });

    it('Should remove data to a existing dataset and should fail with an error', function() {
      let log = require('logtopus').getLogger('coreio');
      let emitStub = sinon.stub(model, 'emit'),
        errorStub = sinon.stub(log, 'error');


      model.properties = { listing: {} };
      model.remove('listing', 1);
      inspect(errorStub).wasCalled();
      inspect(errorStub).wasCalledWithMatch(/Model.remove requires an array./);
      inspect(emitStub).wasNotCalled();

      emitStub.restore();
      errorStub.restore();
    });

    it('Should call sync method with remove mode', function() {
      var syncStub = sinon.stub();
      model.sync = syncStub;

      model.properties = { listing: [] };
      model.remove('listing', 1, {noSync: false });

      inspect(syncStub).wasCalledOnce();
      inspect(syncStub).wasCalledWith('remove', 'listing', 1);
    });

    it('Should not call sync method when sync option is false', function() {
      var syncStub = sinon.stub();
      model.sync = syncStub;

      model.properties = { listing: [] };
      model.remove('listing', 1, { noSync: true });

      inspect(syncStub).wasNotCalled();
    });
  });

  describe('modify', function() {
    var model;

    beforeEach(function() {
      model = new CoreIO.Model('test');
    });

    it('Should modify data to a subset', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = { listing: [
        { name: 'AAA', value: '1' },
        { name: 'BBB', value: '2' },
        { name: 'CCC', value: '3' }
      ]};

      var finalData = {
        listing: [
          { name: 'DDD', value: '4' },
          { name: 'BBB', value: '2' },
          { name: 'CCC', value: '3' }
        ]
      };

      model.modify('listing', 0, { name: 'DDD', value: '4' });
      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('data.modify', 'listing', 0, { name: 'DDD', value: '4' }, { name: 'AAA', value: '1' });
      inspect(emitStub).wasCalledWith('data.change', finalData);

      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should modify data to a subset using match object', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = { listing: [
        { name: 'AAA', value: '1' },
        { name: 'BBB', value: '2' },
        { name: 'CCC', value: '3' }
      ]};

      var finalData = {
        listing: [
          { name: 'AAA', value: '1' },
          { name: 'DDD', value: '4' },
          { name: 'CCC', value: '3' }
        ]
      };

      model.modify('listing', { name: 'BBB' }, { name: 'DDD', value: '4' });
      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('data.modify', 'listing', { name: 'BBB' }, { name: 'DDD', value: '4' }, { name: 'BBB', value: '2' });
      inspect(emitStub).wasCalledWith('data.change', finalData);

      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should modify data to a subset (path ist listing.data)', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = {
        listing: {
          data: [
            { name: 'AAA', value: '1' },
            { name: 'BBB', value: '2' },
            { name: 'CCC', value: '3' }
          ]
        }
      };

      var finalData = {
        listing: {
          data: [
            { name: 'AAA', value: '1' },
            { name: 'DDD', value: '4' },
            { name: 'CCC', value: '3' }
          ]
        }
      };

      model.modify('listing.data', 1, { name: 'DDD', value: '4' });
      inspect(emitStub).wasCalledTwice();
      inspect(emitStub).wasCalledWith('data.modify', 'listing.data', 1, { name: 'DDD', value: '4' }, { name: 'BBB', value: '2' });
      inspect(emitStub).wasCalledWith('data.change', finalData);

      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should modify data to a subset and should never emit an event', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = {
        listing: [
          { name: 'AAA', value: '1' },
          { name: 'BBB', value: '2' },
          { name: 'CCC', value: '3' }
        ]
      };

      var finalData = {
        listing: [
          { name: 'AAA', value: '1' },
          { name: 'DDD', value: '4' },
          { name: 'CCC', value: '3' }
        ]
      };

      model.modify('listing', 1, { name: 'DDD', value: '4' }, {
        silent: true
      });

      inspect(emitStub).wasNotCalled();
      inspect(model.properties).isEql(finalData);

      emitStub.restore();
    });

    it('Should modify data from a not existing dataset', function() {
      var emitStub = sinon.stub(model, 'emit');
      model.properties = {
        listing: []
      };

      model.modify('listing', 1);

      inspect(emitStub).wasNotCalled();
      inspect(model.properties).isEql({
        listing: []
      });
      emitStub.restore();
    });

    it('Should call sync method with modify mode', function() {
      var syncStub = sinon.stub();
      model.sync = syncStub;

      model.properties = {
        listing: [
          { name: 'AAA', value: '1' },
          { name: 'DDD', value: '4' },
          { name: 'CCC', value: '3' }
        ]
      };

      model.modify('listing', 1, { name: 'DDD', value: '4' }, { noSync: false });

      inspect(syncStub).wasCalledOnce();
      inspect(syncStub).wasCalledWith('modify', 'listing', 1, { name: 'DDD', value: '4' });
    });

    it('Should not call sync method when sync option is false', function() {
      var syncStub = sinon.stub();
      model.sync = syncStub;

      model.properties = { listing: [] };
      model.modify('listing', 1, { noSync: true });

      inspect(syncStub).wasNotCalled();
    });
  });

  describe('registerFilter', function() {
    var model;

    beforeEach(function() {
      model = new CoreIO.Model('filtertest');
    });

    it('Should register a filter method to models prototype', function() {
      var fn = sinon.spy();

      CoreIO.Model.registerFilter('testfilter', fn);
      inspect(CoreIO.Model.prototype.__registeredFilter).isObject();
      inspect(CoreIO.Model.prototype.__registeredFilter.testfilter).isEql(fn);

      //Instance got the filter from prototype
      inspect(model.__registeredFilter).isObject();
      inspect(model.__registeredFilter.testfilter).isEql(fn);
    });

    it('Should register a filter method to an instance', function() {
      var fn = sinon.spy();

      model.registerFilter('testfilter', fn);
      inspect(model.__registeredFilter).isObject();
      inspect(model.__registeredFilter.testfilter).isEql(fn);
    });

    it('Should fail registering a filter method', function() {
      inspect(function() {
        model.registerFilter('testfilter', 'string');
      }).doesThrow();
    });
  });

  describe('filter', function() {
    var model,
      testData;

    beforeEach(function() {
      model = new CoreIO.Model('filtertest');

      testData = [
        { name: 'Andi' },
        { name: 'Donnie' },
        { name: 'Bubu' },
        { name: 'Stummi' },
        { name: 'Barney' },
        { name: 'Tini' },
        { name: 'Carl' },
        { name: 'Rogger' },
        { name: 'Piglet' }
      ];
    });

    it('Should filter a dataset with query "a"', function() {
      //Set data
      model.set({
        listing: testData
      });

      model.filter('listing', 'name', 'a', 'quicksearch');
      inspect(model.get('listing')).isEql([
        { name: 'Andi' },
        { name: 'Barney' },
        { name: 'Carl' }
      ]);

      inspect(model.__unfiltered).isEql({
        path: 'listing',
        data: testData
      });
    });

    it('Should filter a dataset with query "an"', function() {
      //Set data
      model.set({
        listing: testData
      });

      model.filter('listing', 'name', 'an', 'quicksearch');
      inspect(model.get('listing')).isEql([
        { name: 'Andi' },
        { name: 'Barney' }
      ]);

      inspect(model.__unfiltered).isEql({
        path: 'listing',
        data: testData
      });
    });

    it('Should filter a dataset with query "andi"', function() {
      //Set data
      model.set({
        listing: testData
      });

      model.filter('listing', 'name', 'andi', 'quicksearch');
      inspect(model.get('listing')).isEql([
        { name: 'Andi' }
      ]);

      inspect(model.__unfiltered).isEql({
        path: 'listing',
        data: testData
      });
    });

    it('Should filter a dataset with query "idna"', function() {
      //Set data
      model.set({
        listing: testData
      });

      model.filter('listing', 'name', 'idna', 'quicksearch');
      inspect(model.get('listing')).isEql([]);

      inspect(model.__unfiltered).isEql({
        path: 'listing',
        data: testData
      });
    });
  });

  describe('filterReset', function() {
    var model,
      testData;

    beforeEach(function() {
      model = new CoreIO.Model('filtertest');

      testData = [
        { name: 'Andi' },
        { name: 'Donnie' },
        { name: 'Bubu' },
        { name: 'Stummi' },
        { name: 'Barney' },
        { name: 'Tini' },
        { name: 'Carl' },
        { name: 'Rogger' },
        { name: 'Piglet' }
      ];
    });

    it('Should reset a filtered dataset', function() {
      model.__unfiltered = {
        path: 'listing',
        data: testData
      };

      model.properties = {
        listing: [
          { name: 'andi' }
        ]
      };

      model.filterReset();
      inspect(model.get('listing')).isEql(testData);
    });
  });

  describe('state', function() {
    it('Should set a state', function() {
      var model = new CoreIO.Model();
      inspect(model.__state).isEql('ready');

      model.state('loading');
      inspect(model.__state).isEql('loading');
    });
  });

  describe('getState', function() {
    it('Should get a state', function() {
      var model = new CoreIO.Model();
      inspect(model.getState()).isEql('ready');

      model.__state = 'loading';
      inspect(model.getState()).isEql('loading');
    });
  });

  describe('has', function() {
    it('Should check whether a property exists in model (strings)', function() {
      var testModel = new CoreIO.Model();

      testModel.set({
        a: 'aaa',
        b: 'bbb',
        c: 'ccc'
      });

      inspect(testModel.has('a')).isTrue();
      inspect(testModel.has('z')).isFalse();
    });

    it('Should check whether a property exists in model (falsy values)', function() {
      var testModel = new CoreIO.Model();

      testModel.set({
        a: null,
        b: '',
        c: undefined
      });

      inspect(testModel.has('a')).isTrue();
      inspect(testModel.has('b')).isTrue();
      inspect(testModel.has('c')).isFalse();
      inspect(testModel.has('z')).isFalse();
    });

    it('Should check whether a nested property exists in model', function() {
      var testModel = new CoreIO.Model();

      testModel.set({
        a: null,
        b: '',
        c: undefined,
        d: {
          e: {
            f: true
          }
        }
      });

      inspect(testModel.has('a')).isTrue();
      inspect(testModel.has('b')).isTrue();
      inspect(testModel.has('c')).isFalse();
      inspect(testModel.has('c.d.f')).isFalse();
      inspect(testModel.has('d.e.f')).isTrue();
      inspect(testModel.has('z')).isFalse();
    });
  });

  describe('reset', function() {
    it('Should reset the model properties', function() {
      var testModel = new CoreIO.Model({
        validate: function() {
          return null; //Validation is successfull
        }
      });

      testModel.set({
        a: 'aaa',
        b: 'bbb',
        c: 'ccc'
      });

      inspect(testModel.properties).isEql({
        a: 'aaa',
        b: 'bbb',
        c: 'ccc'
      });

      testModel.reset();

      inspect(testModel.properties).isEql({});
    });

    it('Should call a data.reset event', function() {
      var model = new CoreIO.Model();
      model.set({ a : 'b' });

      var cb = sinon.stub();
      model.on('data.reset', cb);
      model.reset();

      inspect(cb).wasCalledOnce();
      inspect(cb).wasCalledWith({ a : 'b' });
    });

    it('Should remove data and all registered event listeners', function() {
      var model = new CoreIO.Model();
      model.set({ a : 'b' });

      var cb = sinon.stub();
      model.on('data.reset', cb);

      model.reset({
        removeListener: true
      });

      inspect(model.__events).isEql({});

      inspect(cb).wasCalledOnce();
    });

    it('Should remove data and all registered event listeners', function() {
      var model = new CoreIO.Model();
      model.set({ a : 'b' });

      var cb = sinon.stub();
      model.on('data.reset', cb);

      model.reset({
        removeListener: true,
        silent: true
      });

      inspect(model.__events).isEql({});

      inspect(cb).wasNotCalled();
    });

    it('Should call sync method', function() {
      var model = new CoreIO.Model();
      model.set({ a : 'b' });

      var syncStub = sinon.stub();
      model.sync = syncStub;
      model.reset();

      inspect(syncStub).wasCalledOnce();
      inspect(syncStub).wasCalledWith('reset');
    });
  });

  describe('search', function() {
    it('Should search a property, searching in the first level', function() {
      var testModel = new CoreIO.Model({

      });

      testModel.set({
        a: [
          {name: 'aaa1'},
          {name: 'aaa2'},
          {name: 'aaa3'},
          {name: 'aaa4'},
          {name: 'aaa5'}
        ]
      });

      var result = testModel.search('a', {
        name: 'aaa3'
      });

      inspect(result).isEql(testModel.properties.a[2]);
    });

    it('Should search a property, searching in the third level', function() {
      var testModel = new CoreIO.Model({

      });

      testModel.set({
        data: {
          values: {
            a: [
              {name: 'aaa1'},
              {name: 'aaa2'},
              {name: 'aaa3'},
              {name: 'aaa4'},
              {name: 'aaa5'}
            ]
          }
        }
      });

      var result = testModel.search('data.values.a', {
        name: 'aaa3'
      });

      inspect(result).isEql(testModel.properties.data.values.a[2]);
    });
  });

  describe('sortBy', function() {
    it('Should sort an array collection (Simple ascend)', function() {
      var test = new CoreIO.Model();
      test.set([
        {name: 'Homer', surname: 'Simpson'},
        {name: 'Marge', surname: 'Simpson'},
        {name: 'Bart', surname: 'Simpson'},
        {name: 'Lisa', surname: 'Simpson'},
        {name: 'Maggie', surname: 'Simpson'},
        {name: 'Moe', surname: 'Szyslak'},
        {name: 'Barney', surname: 'Gumble'},
        {name: 'Carl', surname: 'Carlson'},
        {name: 'Lenny', surname: 'Leonard'}
      ], { replace: true });

      var sorted = test.sortBy({surname: 1, name: 1});
      inspect(sorted).isArray();
      inspect(sorted).isEql([
        {name: 'Carl', surname: 'Carlson'},
        {name: 'Barney', surname: 'Gumble'},
        {name: 'Lenny', surname: 'Leonard'},
        {name: 'Bart', surname: 'Simpson'},
        {name: 'Homer', surname: 'Simpson'},
        {name: 'Lisa', surname: 'Simpson'},
        {name: 'Maggie', surname: 'Simpson'},
        {name: 'Marge', surname: 'Simpson'},
        {name: 'Moe', surname: 'Szyslak'}
      ]);
    });

    it('Should sort an array collection (Simple descend)', function() {
      var test = new CoreIO.Model();
      test.set([
        {name: 'Homer', surname: 'Simpson'},
        {name: 'Marge', surname: 'Simpson'},
        {name: 'Bart', surname: 'Simpson'},
        {name: 'Lisa', surname: 'Simpson'},
        {name: 'Maggie', surname: 'Simpson'},
        {name: 'Moe', surname: 'Szyslak'},
        {name: 'Barney', surname: 'Gumble'},
        {name: 'Carl', surname: 'Carlson'},
        {name: 'Lenny', surname: 'Leonard'}
      ], { replace: true });

      var sorted = test.sortBy({surname: -1, name: -1});
      inspect(sorted).isArray();
      inspect(sorted).isEql([
        {name: 'Moe', surname: 'Szyslak'},
        {name: 'Marge', surname: 'Simpson'},
        {name: 'Maggie', surname: 'Simpson'},
        {name: 'Lisa', surname: 'Simpson'},
        {name: 'Homer', surname: 'Simpson'},
        {name: 'Bart', surname: 'Simpson'},
        {name: 'Lenny', surname: 'Leonard'},
        {name: 'Barney', surname: 'Gumble'},
        {name: 'Carl', surname: 'Carlson'}
      ]);
    });

    it('Should sort an array collection (Simple ascend - descend)', function() {
      var test = new CoreIO.Model();
      test.set([
        {name: 'Homer', surname: 'Simpson'},
        {name: 'Marge', surname: 'Simpson'},
        {name: 'Bart', surname: 'Simpson'},
        {name: 'Lisa', surname: 'Simpson'},
        {name: 'Maggie', surname: 'Simpson'},
        {name: 'Moe', surname: 'Szyslak'},
        {name: 'Barney', surname: 'Gumble'},
        {name: 'Carl', surname: 'Carlson'},
        {name: 'Lenny', surname: 'Leonard'}
      ], { replace: true });

      var sorted = test.sortBy({surname: 1, name: -1});
      inspect(sorted).isArray();
      inspect(sorted).isEql([
        {name: 'Carl', surname: 'Carlson'},
        {name: 'Barney', surname: 'Gumble'},
        {name: 'Lenny', surname: 'Leonard'},
        {name: 'Marge', surname: 'Simpson'},
        {name: 'Maggie', surname: 'Simpson'},
        {name: 'Lisa', surname: 'Simpson'},
        {name: 'Homer', surname: 'Simpson'},
        {name: 'Bart', surname: 'Simpson'},
        {name: 'Moe', surname: 'Szyslak'}
      ]);
    });

    it('Should sort an array collection and should trigger a data.change event', function(done) {
      var test = new CoreIO.Model();
      test.set([
        {name: 'Homer', surname: 'Simpson'},
        {name: 'Lenny', surname: 'Leonard'}
      ], { replace: true });

      test.once('data.change', function() {
        done();
      });

      test.sortBy({name: 1});
    });
  });

  describe('registerValidation', function() {
    var model;

    beforeEach(function() {
      model = new CoreIO.Model();
    });

    it('Should register a validation method', function() {
      var fn1 = sinon.stub();
      var fn2 = sinon.stub();

      model.registerValidation('test1', fn1);
      model.registerValidation('test2', fn2);

      inspect(model.__registeredValidations.test1).isEql(fn1);
      inspect(model.__registeredValidations.test2).isEql(fn2);
    });

    it('Should register a validation method for all models', function() {
      var fn1 = sinon.stub();
      var fn2 = sinon.stub();

      CoreIO.Model.registerValidation('test1', fn1);
      CoreIO.Model.registerValidation('test2', fn2);

      inspect(model.__registeredValidations.test1).isEql(fn1);
      inspect(model.__registeredValidations.test2).isEql(fn2);
    });
  });

  describe('validate', function() {
    var model;

    beforeEach(function() {
      model = new CoreIO.Model('validation-test', function(self) {
        self.schema = {
          title: { type: 'string' }
        };
      });
    });

    it('validate a model', function() {
      var result = model.validate({
        title: 'Test'
      });

      inspect(result).isNull();
      inspect(model.isValid()).isTrue();
    });

    it('Should validate an item an should get an undefined but required error', function(done) {
      var test = new CoreIO.Model({
        schema: {
          'test': { type: 'string', required: true }
        }
      });

      test.on('validation.error', function(err) {
        inspect(err[0]).isObject();
        inspect(err[0].property).isEqual('test');
        inspect(err[0].msg).isEqual('Property is undefined or null, but it\'s required');
        inspect(err[0].errCode).isEqual(10);
        done();
      });

      test.set('test', undefined);

      inspect(test.isValid()).isFalse();
    });

    it('Should validate a nested struckture', function() {
      var test = new CoreIO.Model({
        schema: {
          test: { type: 'string', 'default': 'test', noEmpty: true },
          data: {
            name: { type: 'string' },
            status: { type: 'number' },
            content: { type: 'string' },
            tags: {
              draft: { type: 'boolean', require: true },
              isPublic: { type: 'boolean', require: true },
              isWriteable: { type: 'boolean', require: true }
            }
          }
        }
      });

      var errStub = sinon.stub();

      test.on('validation.error', errStub);

      test.set({
        test: 'Test one',
        data: {
          name: 'Test1',
          status: 1,
          content: 'Nested test',
          tags: {
            draft: false,
            isPublic: true,
            isWriteable: true
          }
        }
      });


      inspect(test.isValid()).isTrue();
      inspect(errStub).hasCallCount(0);
    });
  });

  describe('validateOne', function() {
    var model;

    beforeEach(function() {
      model = new CoreIO.Model('validation-test', function(self) {
        self.schema = {
          title: { type: 'string' },
          number: { type: 'number' }
        };
      });
    });

    it('Should validate on model item', function() {
      var result = model.validateOne(model.schema.title, 'Test title');
      inspect(result).isEql({
        isValid: true,
        value: 'Test title',
        error: null
      });
    });

    it('Should validate one and should get a undefined but required error', function() {
      var test = new CoreIO.Model();
      var err = test.validateOne({ type: 'string', required: true }, undefined).error;

      inspect(err).isObject();
      inspect(err.msg).isEqual('Property is undefined or null, but it\'s required');
      inspect(err.errCode).isEqual(10);
    });

    it('Should validate one and should get a type error', function() {
      var test = new CoreIO.Model();
      var err = test.validateOne({ type: 'string' }, 1).error;

      inspect(err).isObject();
      inspect(err.msg).isEqual('Property type is a number, but a string is required');
      inspect(err.errCode).isEqual(11);
    });

    it('Should validate one and should get a string to short error', function() {
      var test = new CoreIO.Model();

      var err = test.validateOne({ type: 'string', min: 10 }, 'test').error;

      inspect(err).isObject();
      inspect(err.msg).isEqual('String length is too short');
      inspect(err.errCode).isEqual(12);
    });

    it('Should validate one and should get a string to long error', function() {
      var test = new CoreIO.Model();
      var err = test.validateOne({ type: 'string', max: 10 }, 'testing ist so beautifull').error;

      inspect(err).isObject();
      inspect(err.msg).isEqual('String length is too long');
      inspect(err.errCode).isEqual(13);
    });

    it('Should validate one and should get a string doesn\'t match regexp', function() {
      var test = new CoreIO.Model();
      var err = test.validateOne({ type: 'string', match: /^a/ }, 'blabla').error;

      inspect(err).isObject();
      inspect(err.msg).isEqual('String doesn\'t match regexp');
      inspect(err.errCode).isEqual(14);
    });

    it('Should validate one and should get a type error', function() {
      var test = new CoreIO.Model();
      var err = test.validateOne({ type: 'number' }, '1').error;

      inspect(err).isObject();
      inspect(err.msg).isEqual('Property type is not a valid number');
      inspect(err.errCode).isEqual(21);
    });

    it('Should validate one and should get a number to low error', function() {
      var test = new CoreIO.Model();
      var err = test.validateOne({ type: 'number', min: 10 }, 9).error;

      inspect(err).isObject();
      inspect(err.msg).isEqual('Number is too low');
      inspect(err.errCode).isEqual(22);
    });

    it('Should validate one and should get a number to high error', function() {
      var test = new CoreIO.Model();
      var err = test.validateOne({ type: 'number', max: 10 }, 12).error;

      inspect(err).isObject();
      inspect(err.msg).isEqual('Number is too high');
      inspect(err.errCode).isEqual(23);
    });

    it('Should validate one and should get a not a valid date error', function() {
      var test = new CoreIO.Model();
      var err = test.validateOne({ type: 'date' }, 'Not a date').error;

      inspect(err).isObject();
      inspect(err.msg).isEqual('Property isn\'t a valid date');
      inspect(err.errCode).isEqual(31);
    });

    it('Should validate one and should get a type not an array error', function() {
      var test = new CoreIO.Model();
      var err = test.validateOne({ type: 'array' }, {
        a: 'aa',
        b: 'bb'
      }).error;

      inspect(err).isObject();
      inspect(err.msg).isEqual('Property type is a object, but an array is required');
      inspect(err.errCode).isEqual(41);
    });

    it('Should validate one and should get an array length to low error', function() {
      var test = new CoreIO.Model();
      var err = test.validateOne({ type: 'array', min: 5 }, [
        'aa', 'bb', 'cc'
      ]).error;

      inspect(err).isObject();
      inspect(err.msg).isEqual('Array length is 3 but must be greater than 5');
      inspect(err.errCode).isEqual(42);
    });

    it('Should validate one and should get an array length to long error', function() {
      var test = new CoreIO.Model();
      var err = test.validateOne({ type: 'array', max: 2 }, [
        'aa', 'bb', 'cc'
      ]).error;

      inspect(err).isObject();
      inspect(err.msg).isEqual('Array length is 3 but must be lesser than 2');
      inspect(err.errCode).isEqual(43);
    });

    it('Should validate one and should get a not a valid object error', function() {
      var test = new CoreIO.Model();
      var err = test.validateOne({ type: 'object' }, 'Not an object').error;

      inspect(err).isObject();
      inspect(err.msg).isEqual('Property isn\'t a valid object');
      inspect(err.errCode).isEqual(51);
    });

    it('Should validate one and should get a not a valid objectId error', function() {
      var test = new CoreIO.Model();
      var err = test.validateOne({ type: 'objectId' }, 'abc').error;

      inspect(err).isObject();
      inspect(err.msg).isEqual('Property isn\'t a valid objectId');
      inspect(err.errCode).isEqual(52);
    });

    it('Should validate one and should get a not a valid boolean error', function() {
      var test = new CoreIO.Model();
      var err = test.validateOne({ type: 'boolean' }, 'Not a boolean').error;

      inspect(err).isObject();
      inspect(err.msg).isEqual('Property isn\'t a valid boolean');
      inspect(err.errCode).isEqual(61);
    });

    it('A empty string should cause a validation error if property is required', function() {
      var test = new CoreIO.Model();
      var err = test.validateOne({ type: 'string', required: true }, '').error;
      inspect(err).isObject();
      inspect(err.msg).isEqual('Property is undefined or null, but it\'s required');
      inspect(err.errCode).isEqual(10);
    });

    it('Should use the default value, noEmpty: true on a String', function() {
      var test = new CoreIO.Model();
      var err = test.validateOne({ type: 'string', 'default': 'test', noEmpty: true }, '');
      inspect(err.error).isNull();
      inspect(err.value).isEqual('test');
    });
  });

  describe('isValid', function() {
    it('Should return the validation state of a model (true)', function() {
      var model = new CoreIO.Model();
      model.__isValid = true;
      inspect(model.isValid()).isTrue();
    });

    it('Should return the validation state of a model (false)', function() {
      var model = new CoreIO.Model();
      model.__isValid = false;
      inspect(model.isValid()).isFalse();
    });
  });
});
