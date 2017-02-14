'use strict';

let inspect = require('inspect.js');
let sinon = require('sinon');
inspect.useSinon(sinon);

let CoreIO = require('../lib/coreio');
let log = require('logtopus').getLogger('coreio');
log.setLevel('error');

describe('CoreIO List', function() {
  describe('instance', function() {
    beforeEach(function() {

    });

    afterEach(function() {

    });

    it('Should be a function', function() {
      inspect(CoreIO.List).isFunction();
    });

    it('Should be an instance of CoreIO.List', function() {
      var list = new CoreIO.List();
      inspect(list).isInstanceOf(CoreIO.List);
    });

    it('Should create an instance, using conf object', function() {
      var list = new CoreIO.List('test1', {
        myconf: '123'
      });

      inspect(list.name).isEql('test1List');
      inspect(list.myconf).isEql('123');
    });

    it('Should create an instance, using conf function', function() {
      var list = new CoreIO.List('test1', function(self) {
        self.myconf =  '123';
      });

      inspect(list.name).isEql('test1List');
      inspect(list.myconf).isEql('123');
    });
  });

  describe('model', function() {
    it('Should point to a model prototype.', function() {
      var list = new CoreIO.List();
      inspect(list.model).isEqual(CoreIO.Model);
    });
  });

  describe('items', function() {
    it('Should have an items array', function() {
      var list = new CoreIO.List();
      inspect(list.items).isArray();
      inspect(list.items.length).isEql(0);


    });
  });

  describe('length', function() {
    it('Should contains the amount of items', function() {
      var list = new CoreIO.List();
      inspect(list.length).isNumber()
      inspect(list.length).isEql(0);

      list.items.push('1', '2');
      inspect(list.length).isEql(2);
    });
  });

  describe('state', function() {
    it('Should have a ready state', function() {
      var list = new CoreIO.List();
      inspect(list.__state).isEql('ready');
    });

    it('Should set a state', function() {
      var list = new CoreIO.List();

      list.state('loading');
      inspect(list.__state).isEql('loading');

    });

    it('Should emit a state.change event', function() {
      var cb = sinon.stub();
      var list = new CoreIO.List();

      list.on('state.change', cb);
      list.state('loading');
      inspect(cb).wasCalledOnce();
      inspect(cb).wasCalledWith('loading');
    });

    it('Should emit a state.<state> event', function() {
      var cb = sinon.stub();
      var list = new CoreIO.List();

      list.on('state.loading', cb);
      list.state('loading');
      inspect(cb).wasCalledOnce();
      inspect(cb).wasCalledWith();
    });
  });

  describe('getState', function() {
    it('Should get the current state', function() {
      var list = new CoreIO.List();

      inspect(list.getState()).isEql('ready');
      list.__state = 'loading';
      inspect(list.getState()).isEql('loading');
    });
  });

  describe('push', function() {
    it('Should add one item to the end of the list', function() {
      var list = new CoreIO.List();
      var state = list.push({
        a: 'AA',
        b: 'BB'
      });

      inspect(state).isTruthy()
      inspect(list.items).hasLength(1);
      inspect(list.items[0]).isInstanceOf(CoreIO.Model);
      inspect(list.items[0].properties).isEql({
        a: 'AA',
        b: 'BB'
      });
    });

    it('Should not add an item if model validation fails', function() {
      var list = new CoreIO.List();
      var Model = CoreIO.Model.inherit('TestModel', {
        validation: {
          key: { type: 'number', required: true }
        }
      });

      list.model = Model;

      var state = list.push({
        a: 'AA',
        b: 'BB'
      });

      inspect(state).isTruthy();
      inspect(list.items).hasLength(1);
      inspect(list.items[0]).isInstanceOf(CoreIO.Model);
      inspect(list.items[0].properties).isEql({
        a: 'AA',
        b: 'BB'
      });
    });

    it('Should add three items to the end of the list', function() {
      var list = new CoreIO.List();
      var state = list.push([{
        a: 'AA',
        b: 'BB'
      }, {
        a: 'CC',
        b: 'DD'
      }, {
        a: 'EE',
        b: 'FF'
      }]);

      inspect(state).isTruthy();
      inspect(list.items).hasLength(3);
      inspect(list.items[0]).isInstanceOf(CoreIO.Model);
      inspect(list.items[1]).isInstanceOf(CoreIO.Model);
      inspect(list.items[2]).isInstanceOf(CoreIO.Model);
      inspect(list.items[0].properties).isEql({
        a: 'AA',
        b: 'BB'
      });

      inspect(list.items[1].properties).isEql({
        a: 'CC',
        b: 'DD'
      });

      inspect(list.items[2].properties).isEql({
        a: 'EE',
        b: 'FF'
      });
    });

    it('Should add one item of type model to the end of the list', function() {
      var list = new CoreIO.List();
      var model = new CoreIO.Model();
      model.set({
        a: 'AA',
        b: 'BB'
      });

      var state = list.push(model);

      inspect(state).isTruthy();
      inspect(list.items).hasLength(1);
      inspect(list.items[0]).isInstanceOf(CoreIO.Model);
      inspect(list.items[0]).isEqual(model);
      inspect(list.items[0].properties).isEql({
        a: 'AA',
        b: 'BB'
      });
    });

    it('Should add three items of type model to the end of the list', function() {
      var list = new CoreIO.List();
      var model1 = new CoreIO.Model();
      model1.set({
        a: 'AA',
        b: 'BB'
      });

      var model2 = new CoreIO.Model();
      model2.set({
        a: 'CC',
        b: 'DD'
      });

      var model3 = new CoreIO.Model();
      model3.set({
        a: 'EE',
        b: 'FF'
      });

      var state = list.push([model1, model2, model3]);

      inspect(state).isTruthy();
      inspect(list.items).hasLength(3);
      inspect(list.items[0]).isInstanceOf(CoreIO.Model);
      inspect(list.items[1]).isInstanceOf(CoreIO.Model);
      inspect(list.items[2]).isInstanceOf(CoreIO.Model);
      inspect(list.items[0].properties).isEql({
        a: 'AA',
        b: 'BB'
      });

      inspect(list.items[1].properties).isEql({
        a: 'CC',
        b: 'DD'
      });

      inspect(list.items[2].properties).isEql({
        a: 'EE',
        b: 'FF'
      });
    });

    it('Should emit an item.push event', function() {
      var list = new CoreIO.List();
      var cb = sinon.stub();

      list.on('item.push', cb);

      list.push({
        a: 'AA',
        b: 'BB'
      });

      inspect(list.items).hasLength(1);
      inspect(cb).wasCalledOnce();
      inspect(cb).wasCalledWith(sinon.match.array, 1);
    });

    it('Should emit an item.push event on adding multiple items', function() {
      var list = new CoreIO.List();
      var cb = sinon.stub();

      list.on('item.push', cb);

      list.push([{
        a: 'AA',
        b: 'BB'
      }, {
        a: 'CC',
        b: 'DD'
      }, {
        a: 'EE',
        b: 'FF'
      }]);

      inspect(list.items).hasLength(3);
      inspect(cb).wasCalledOnce();
      inspect(cb).wasCalledWith(sinon.match.array, 3);
    });

    it('Should not emit an item.push event if silent option is set', function() {
      var list = new CoreIO.List();
      var cb = sinon.stub();

      list.on('item.push', cb);

      list.push({
        a: 'AA',
        b: 'BB'
      }, { silent: true });

      inspect(cb).wasNotCalled();
    });

    it('Should call sync method', function() {
      var list = new CoreIO.List();
      list.sync = sinon.stub();

      list.push({
        a: 'AA',
        b: 'BB'
      });

      inspect(list.items).hasLength(1);
      inspect(list.sync).wasCalledOnce();
      inspect(list.sync).wasCalledWith('push', sinon.match.array);
      var models = list.sync.firstCall.args[1];
      inspect(models).isArray();
      inspect(models[0].properties).isEql({
        a: 'AA',
        b: 'BB'
      });
    });

    it('Should call sync method', function() {
      var list = new CoreIO.List();
      list.sync = sinon.stub();

      list.push([{
        a: 'AA',
        b: 'BB'
      }, {
        a: 'CC',
        b: 'DD'
      }, {
        a: 'EE',
        b: 'FF'
      }]);

      inspect(list.items).hasLength(3);
      inspect(list.sync).wasCalledOnce();
      inspect(list.sync).wasCalledWith('push', sinon.match.array);
      var models = list.sync.firstCall.args[1];
      inspect(models).isArray();
      inspect(models[0].properties).isEql({
        a: 'AA',
        b: 'BB'
      });

      inspect(models[1].properties).isEql({
        a: 'CC',
        b: 'DD'
      });

      inspect(models[2].properties).isEql({
        a: 'EE',
        b: 'FF'
      });
    });

    it('Should not call sync method if noSync option is set', function() {
      var list = new CoreIO.List();
      list.sync = sinon.stub();

      list.push({
        a: 'AA',
        b: 'BB'
      }, { noSync: true });

      inspect(list.sync).wasNotCalled();
    });
  });



  describe('unshift', function() {
    it('Should add one item to the beginning of the list', function() {
      var list = new CoreIO.List();
      var state = list.unshift({
        a: 'AA',
        b: 'BB'
      });

      inspect(state).isTruthy();
      inspect(list.items).hasLength(1);
      inspect(list.items[0]).isInstanceOf(CoreIO.Model);
      inspect(list.items[0].properties).isEql({
        a: 'AA',
        b: 'BB'
      });
    });

    it('Should add three items to the beginning of the list', function() {
      var list = new CoreIO.List();
      var state = list.unshift([{
        a: 'AA',
        b: 'BB'
      }, {
        a: 'CC',
        b: 'DD'
      }, {
        a: 'EE',
        b: 'FF'
      }]);

      inspect(state).isTruthy();
      inspect(list.items).hasLength(3);
      inspect(list.items[0]).isInstanceOf(CoreIO.Model);
      inspect(list.items[1]).isInstanceOf(CoreIO.Model);
      inspect(list.items[2]).isInstanceOf(CoreIO.Model);
      inspect(list.items[0].properties).isEql({
        a: 'EE',
        b: 'FF'
      });

      inspect(list.items[1].properties).isEql({
        a: 'CC',
        b: 'DD'
      });

      inspect(list.items[2].properties).isEql({
        a: 'AA',
        b: 'BB'
      });
    });

    it('Should add one item of type model to the beginning of the list', function() {
      var list = new CoreIO.List();
      var model = new CoreIO.Model();
      model.set({
        a: 'AA',
        b: 'BB'
      });

      var state = list.unshift(model);

      inspect(state).isTruthy();
      inspect(list.items).hasLength(1);
      inspect(list.items[0]).isInstanceOf(CoreIO.Model);
      inspect(list.items[0]).isEqual(model);
      inspect(list.items[0].properties).isEql({
        a: 'AA',
        b: 'BB'
      });
    });

    it('Should add three items of type model to the beginning of the list', function() {
      var list = new CoreIO.List();
      var model1 = new CoreIO.Model();
      model1.set({
        a: 'AA',
        b: 'BB'
      });

      var model2 = new CoreIO.Model();
      model2.set({
        a: 'CC',
        b: 'DD'
      });

      var model3 = new CoreIO.Model();
      model3.set({
        a: 'EE',
        b: 'FF'
      });

      var state = list.unshift([model1, model2, model3]);

      inspect(state).isTruthy();
      inspect(list.items).hasLength(3);
      inspect(list.items[0]).isInstanceOf(CoreIO.Model);
      inspect(list.items[1]).isInstanceOf(CoreIO.Model);
      inspect(list.items[2]).isInstanceOf(CoreIO.Model);
      inspect(list.items[0].properties).isEql({
        a: 'EE',
        b: 'FF'
      });

      inspect(list.items[1].properties).isEql({
        a: 'CC',
        b: 'DD'
      });

      inspect(list.items[2].properties).isEql({
        a: 'AA',
        b: 'BB'
      });
    });

    it('Should emit an item.unshift event', function() {
      var list = new CoreIO.List();
      var cb = sinon.stub();

      list.on('item.unshift', cb);

      list.unshift({
        a: 'AA',
        b: 'BB'
      });

      inspect(list.items).hasLength(1);
      inspect(cb).wasCalledOnce();
      inspect(cb).wasCalledWith(sinon.match.array, 1);
    });

    it('Should emit an item.unshift event on adding multiple items', function() {
      var list = new CoreIO.List();
      var cb = sinon.stub();

      list.on('item.unshift', cb);

      list.unshift([{
        a: 'EE',
        b: 'FF'
      }, {
        a: 'CC',
        b: 'DD'
      }, {
        a: 'AA',
        b: 'BB'
      }]);

      inspect(list.items).hasLength(3);
      inspect(cb).wasCalledOnce();
      inspect(cb).wasCalledWith(sinon.match.array, 3);
    });

    it('Should not emit an item.unshift event if silent option is set', function() {
      var list = new CoreIO.List();
      var cb = sinon.stub();

      list.on('item.unshift', cb);

      list.unshift({
        a: 'AA',
        b: 'BB'
      }, { silent: true });

      inspect(cb).wasNotCalled();
    });

    it('Should call sync method', function() {
      var list = new CoreIO.List();
      list.sync = sinon.stub();

      list.unshift({
        a: 'AA',
        b: 'BB'
      });

      inspect(list.items).hasLength(1);
      inspect(list.sync).wasCalledOnce();
      inspect(list.sync).wasCalledWith('unshift', sinon.match.array);
      var models = list.sync.firstCall.args[1];
      inspect(models).isArray();
      inspect(models[0].properties).isEql({
        a: 'AA',
        b: 'BB'
      });
    });

    it('Should call sync method', function() {
      var list = new CoreIO.List();
      list.sync = sinon.stub();

      list.unshift([{
        a: 'AA',
        b: 'BB'
      }, {
        a: 'CC',
        b: 'DD'
      }, {
        a: 'EE',
        b: 'FF'
      }]);

      inspect(list.items).hasLength(3);
      inspect(list.sync).wasCalledOnce();
      inspect(list.sync).wasCalledWith('unshift', sinon.match.array);
      var models = list.sync.firstCall.args[1];
      inspect(models).isArray();
      inspect(models[0].properties).isEql({
        a: 'EE',
        b: 'FF'
      });

      inspect(models[1].properties).isEql({
        a: 'CC',
        b: 'DD'
      });

      inspect(models[2].properties).isEql({
        a: 'AA',
        b: 'BB'
      });
    });

    it('Should not call sync method if noSync option is set', function() {
      var list = new CoreIO.List();
      list.sync = sinon.stub();

      list.unshift({
        a: 'AA',
        b: 'BB'
      }, { noSync: true });

      inspect(list.sync).wasNotCalled();
    });
  });

  describe('pop', function() {
    var list, model1, model2, model3;

    beforeEach(function() {
      list = new CoreIO.List();
      model1 = new CoreIO.Model();
      model1.set({
        a: 'AA',
        b: 'BB'
      });

      model2 = new CoreIO.Model();
      model2.set({
        a: 'CC',
        b: 'DD'
      });

      model3 = new CoreIO.Model();
      model3.set({
        a: 'EE',
        b: 'FF'
      });

      list.push([model1, model2, model3]);
    });

    it('Should remove the last item of the list', function() {
      var removed = list.pop();

      inspect(removed).isObject()
      inspect(removed).isEqual(model3);
      inspect(list.items).hasLength(2);
    });

    it('Should remove the last item of the list, returns null if list was empty', function() {
      var removed = list.pop();
      removed = list.pop();
      removed = list.pop();

      inspect(removed).isObject()
      inspect(removed).isEqual(model1);
      inspect(list.items).hasLength(0);

      removed = list.pop();
      inspect(removed).isNull()
      inspect(list.items).hasLength(0);
    });

    it('Should emit an item.pop event', function() {
      var cb = sinon.stub();

      list.on('item.pop', cb);
      list.pop();

      inspect(cb).wasCalledOnce();
      inspect(cb).wasCalledWith(model3);
    });

    it('Should not emit an item.pop event if silent option is set', function() {
      var cb = sinon.stub();

      list.on('item.pop', cb);
      list.pop({ silent: true });

      inspect(cb).wasNotCalled();
    });

    it('Should call sync method', function() {
      list.sync = sinon.stub();
      list.pop();

      inspect(list.sync).wasCalledOnce();
      inspect(list.sync).wasCalledWith('pop', model3);
    });

    it('Should not call sync method if noSync option is set', function() {
      list.sync = sinon.stub();
      list.pop( { noSync: true });

      inspect(list.sync).wasNotCalled();
    });
  });

  describe('shift', function() {
    var list, model1, model2, model3;

    beforeEach(function() {
      list = new CoreIO.List();
      model1 = new CoreIO.Model();
      model1.set({
        a: 'AA',
        b: 'BB'
      });

      model2 = new CoreIO.Model();
      model2.set({
        a: 'CC',
        b: 'DD'
      });

      model3 = new CoreIO.Model();
      model3.set({
        a: 'EE',
        b: 'FF'
      });

      list.push([model1, model2, model3]);
    });

    it('Should remove the first item of the list', function() {
      var removed = list.shift();

      inspect(removed).isObject()
      inspect(removed).isEqual(model1);
      inspect(list.items).hasLength(2);
    });

    it('Should remove the first item of the list, returns null if list was empty', function() {
      var removed = list.shift();
      removed = list.shift();
      removed = list.shift();

      inspect(removed).isObject()
      inspect(removed).isEqual(model3);
      inspect(list.items).hasLength(0);

      removed = list.shift();
      inspect(removed).isNull()
      inspect(list.items).hasLength(0);
    });

    it('Should emit an item.shift event', function() {
      var cb = sinon.stub();

      list.on('item.shift', cb);
      list.shift();

      inspect(cb).wasCalledOnce();
      inspect(cb).wasCalledWith(model1);
    });

    it('Should not emit an item.shift event if silent option is set', function() {
      var cb = sinon.stub();

      list.on('item.shift', cb);
      list.shift({ silent: true });

      inspect(cb).wasNotCalled();
    });

    it('Should call sync method', function() {
      list.sync = sinon.stub();
      list.shift();

      inspect(list.sync).wasCalledOnce();
      inspect(list.sync).wasCalledWith('shift', model1);
    });

    it('Should not call sync method if noSync option is set', function() {
      list.sync = sinon.stub();
      list.shift( { noSync: true });

      inspect(list.sync).wasNotCalled();
    });
  });

  describe('findOne', function() {
    var list, model1, model2, model3;

    beforeEach(function() {
      list = new CoreIO.List();
      model1 = new CoreIO.Model();
      model1.set({
        a: 'AA',
        b: 'BB'
      });

      model2 = new CoreIO.Model();
      model2.set({
        a: 'CC',
        b: 'DD'
      });

      model3 = new CoreIO.Model();
      model3.set({
        a: 'EE',
        b: 'FF'
      });

      list.push([model1, model2, model3]);
    });

    it('Should search for an item', function() {
      var res = list.findOne({
        a: 'CC'
      });

      inspect(res).isEql(model2);
    });

    it('Shouldn\'t search any item', function() {
      var res = list.findOne({
        a: 'GG'
      });

      inspect(res).isEql(null);
    });
  });

  describe('find', function() {
    var list, model1, model2, model3;

    beforeEach(function() {
      list = new CoreIO.List();
      model1 = new CoreIO.Model();
      model1.set({
        a: 'AA',
        b: 'BB',
        c: 'XX'
      });

      model2 = new CoreIO.Model();
      model2.set({
        a: 'CC',
        b: 'DD',
        c: 'YY'
      });

      model3 = new CoreIO.Model();
      model3.set({
        a: 'EE',
        b: 'FF',
        c: 'XX'
      });

      list.push([model1, model2, model3]);
    });

    it('Should search for items', function() {
      var res = list.find({
        c: 'XX'
      });

      inspect(res).isEql([model1, model3]);
    });

    it('Shouldn\'t search any items', function() {
      var res = list.find({
        c: 'WW'
      });

      inspect(res).isEql([]);
    });
  });

  describe('update', function() {
    var list, model1, model2, model3;

    beforeEach(function() {
      list = new CoreIO.List();
      model1 = new CoreIO.Model();
      model1.set({
        id: 1,
        a: 'AA',
        b: 'BB'
      });

      model2 = new CoreIO.Model();
      model2.set({
        id: 2,
        a: 'CC',
        b: 'DD'
      });

      model3 = new CoreIO.Model();
      model3.set({
        id: 3,
        a: 'EE',
        b: 'FF'
      });

      list.push([model1, model2, model3]);
    });

    it('Should update an existing item', function() {
      list.update({
        id: 2
      }, {
        id: 2,
        a: 'GG',
        b: 'HH'
      });

      inspect(model2.properties).isEql({
        id: 2,
        a: 'GG',
        b: 'HH'
      });
    });

    it.skip('Should update an not existing item', function() {
      list.update({
        id: 4
      }, {
        id: 4,
        a: 'GG',
        b: 'HH'
      });

      inspect(list.items[3].properties).isEql({
        id: 4,
        a: 'GG',
        b: 'HH'
      });
    });
  });

  describe('each', function() {
    var list, model1, model2, model3;

    beforeEach(function() {
      list = new CoreIO.List();
      model1 = new CoreIO.Model();
      model1.set({
        id: 1,
        a: 'AA',
        b: 'BB'
      });

      model2 = new CoreIO.Model();
      model2.set({
        id: 2,
        a: 'CC',
        b: 'DD'
      });

      model3 = new CoreIO.Model();
      model3.set({
        id: 3,
        a: 'EE',
        b: 'FF'
      });

      list.push([model1, model2, model3]);
    });

    it('Should execute a callback on each item of the list', function() {
      var counter = 0;
      list.each(function() {
        counter++;
      });

      inspect(counter).isEql(3);
    });

    it('Should execute a callback on each item of the list, using initial arg', function() {
      var counter = 0;
      var initial = {
        str: ''
      };

      var res = list.each(initial, function(item, data) {
        counter++;
        data.str += item.get('a');
        return item.get('b');
      });

      inspect(counter).isEql(3);
      inspect(initial).isEql({
        str: 'AACCEE'
      });

      inspect(res).isEql(['BB', 'DD', 'FF']);
    });
  });

  describe('filter', function() {
    it.skip('Should filter items and reduce the list', function() {

    });
  });

  describe('sort', function() {
    it.skip('Should sort all items of the lists', function() {

    });
  });

  describe('any', function() {
    it.skip('Should tests wheter one or more items in the list pass the test', function() {

    });
  });

  describe('every', function() {
    it.skip('Should tests wheter all items in the list pass the test', function() {

    });
  });

  describe('reset', function() {
    it.skip('Should reset a list', function() {

    });
  });

  describe('toArray', function() {
    it.skip('Should return an array of all items and its values', function() {

    });
  });

  describe.skip('remove', function() {
    var list, model1, model2, model3;

    beforeEach(function() {
      list = new CoreIO.List();
      model1 = new CoreIO.Model();
      model1.set({
        id: 1,
        a: 'AA',
        b: 'BB'
      });

      model2 = new CoreIO.Model();
      model2.set({
        id: 2,
        a: 'CC',
        b: 'DD'
      });

      model3 = new CoreIO.Model();
      model3.set({
        id: 3,
        a: 'EE',
        b: 'FF'
      });

      list.push([model1, model2, model3]);
    });

    it('Should remove an item from the list by a given index', function() {
      var removed = list.remove(1);
      inspect(removed).to.be(model2);
    });
  });

  describe('replace', function() {
    it.skip('Should replace an item by a given index', function() {

    });
  });

  describe('sync', function() {
    it.skip('Should be a plain overridable method', function() {

    });
  });
});
