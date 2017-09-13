'use strict';

let inspect = require('inspect.js');
let sinon = require('sinon');
inspect.useSinon(sinon);

let CoreIO = require('../lib/coreio');
let log = require('logtopus').getLogger('coreio');
log.setLevel('error');

describe('CoreIO.SyncModel', function() {
  describe('instance', function() {
    var initSocketStub,
      registerListenerStub,
      syncModel;

    beforeEach(function() {
      syncModel = new CoreIO.SyncModel('test');
      initSocketStub = sinon.stub(syncModel, 'initSocket');
      registerListenerStub = sinon.stub(syncModel, 'registerListener');
    });

    it('Should be an instance of SyncModel', function() {
      inspect(CoreIO.SyncModel).isFunction()
    });

    it('Should be an instance of Model', function() {
      inspect(CoreIO.Model).isFunction()
    });

    it('Should create an instance', function() {
      inspect(syncModel).isObject();
      inspect(syncModel).isInstanceOf(CoreIO.SyncModel);
    });

    it('Should have been extended by CoreIO.Model', function() {
      inspect(syncModel).hasMethod('set');
      inspect(syncModel).hasMethod('get');
      inspect(syncModel).hasMethod('has');
    });

    it('Should have been extended by CoreIO.Event', function() {
      inspect(syncModel.on).isFunction();
      inspect(syncModel.off).isFunction();
      inspect(syncModel.emit).isFunction();
    });
  });

  describe('initSocket', function() {
    var SocketStub,
      startStub,
      onStub,
      registerListenerStub,
      syncModel;

    beforeEach(function() {
      SocketStub = sinon.stub(CoreIO, 'Socket');
      startStub = sinon.stub();
      onStub = sinon.stub();
      SocketStub.returns({
        start: startStub,
        on: onStub
      });

      syncModel = new CoreIO.SyncModel('test', {
        port: 1234
      });

      registerListenerStub = sinon.stub(syncModel, 'registerListener');
    });

    afterEach(function() {
      SocketStub.restore();
      registerListenerStub.restore();
    });

    it('Should initialize CoreIO.Socket', function() {
      inspect(SocketStub).wasCalledOnce();
      inspect(SocketStub).wasCalledWith({
        path: 'xqsocket',
        port: 1234,
        channel: 'testmodel'
      });

      inspect(startStub).wasCalledOnce();
    });
  });

  describe('registerListener', function() {
    let sandbox;
    var onStub,
      syncModel,
      setGroupStub,
      unsetGroupStub,
      emitOneStub;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      onStub = sandbox.stub();
      setGroupStub = sandbox.stub();
      unsetGroupStub = sandbox.stub();
      emitOneStub = sandbox.stub();

      sandbox.stub(CoreIO.SyncModel.prototype, 'initSocket').callsFake(function() {
        this.socket = {
          on: onStub,
          setGroup: setGroupStub,
          unsetGroup: unsetGroupStub,
          emitOne: emitOneStub
        };
      });

      syncModel = new CoreIO.SyncModel('test');
    });

    afterEach(function() {
      sandbox.restore();
    });


    it('Should register listener', function() {
      inspect(onStub).wasCalledThrice();
      inspect(onStub).wasCalledWith('syncmodel.register', sinon.match.func);
      inspect(onStub).wasCalledWith('syncmodel.unregister', sinon.match.func);
    });
  });

  describe('registerListener (writeable model)', function() {
    let sandbox;
    var onStub,
      syncModel,
      setGroupStub,
      unsetGroupStub,
      emitOneStub;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      onStub = sandbox.stub();
      setGroupStub = sandbox.stub();
      unsetGroupStub = sandbox.stub();
      emitOneStub = sandbox.stub();

      sandbox.stub(CoreIO.SyncModel.prototype, 'initSocket').callsFake(function() {
        this.socket = {
          on: onStub,
          setGroup: setGroupStub,
          unsetGroup: unsetGroupStub,
          emitOne: emitOneStub
        };
      });

      syncModel = new CoreIO.SyncModel('test', {
        isWriteable: true
      });
    });

    afterEach(function() {
      sandbox.restore();
    });


    it('Should register listener for a writeable model', function() {
      inspect(onStub).hasCallCount(9);
      inspect(onStub).wasCalledWith('syncmodel.register', sinon.match.func);
      inspect(onStub).wasCalledWith('syncmodel.unregister', sinon.match.func);
      inspect(onStub).wasCalledWith('syncmodel.set', sinon.match.func);
      inspect(onStub).wasCalledWith('syncmodel.replace', sinon.match.func);
      inspect(onStub).wasCalledWith('syncmodel.item', sinon.match.func);
      inspect(onStub).wasCalledWith('syncmodel.insert', sinon.match.func);
      inspect(onStub).wasCalledWith('syncmodel.remove', sinon.match.func);
      inspect(onStub).wasCalledWith('syncmodel.reset', sinon.match.func);
    });

    it('Should handle a syncmodel.set event', function() {
      var setStub = sandbox.stub(syncModel, 'set');
      onStub.withArgs('syncmodel.set').yieldOn(syncModel, {a: 'aa'});

      inspect(setStub).wasCalledOnce();
      inspect(setStub).wasCalledWith({a: 'aa'});
    });

    it('Should handle a syncmodel.item event', function() {
      var setStub = sinon.stub(syncModel, 'set');
      onStub.withArgs('syncmodel.item').yieldOn(syncModel, 'a', 'aa');

      inspect(setStub).wasCalledOnce();
      inspect(setStub).wasCalledWith('a', 'aa');

      setStub.restore();
    });

    it('Should handle a syncmodel.insert event', function() {
      var insertStub = sinon.stub(syncModel, 'insert');
      onStub.withArgs('syncmodel.insert').yieldOn(syncModel, 1, {a: 'aa'});

      inspect(insertStub).wasCalledOnce();
      inspect(insertStub).wasCalledWith(1, {a: 'aa'});

      insertStub.restore();
    });

    it('Should handle a syncmodel.insert event (prepend)', function() {
      var setStub = sinon.stub(syncModel, 'insert');
      onStub.withArgs('syncmodel.insert').yieldOn(syncModel, 'listing', -1, {a: 'aa'});

      inspect(setStub).wasCalledOnce();
      inspect(setStub).wasCalledWith('listing', -1, {a: 'aa'});

      setStub.restore();
    });

    it('Should handle a syncmodel.remove event', function() {
      var setStub = sinon.stub(syncModel, 'remove');
      onStub.withArgs('syncmodel.remove').yieldOn(syncModel, 'listing', 1);

      inspect(setStub).wasCalledOnce();
      inspect(setStub).wasCalledWith('listing', 1);

      setStub.restore();
    });
  });

  describe('emitRemote', function() {
    var socketStub,
      syncModel,
      socketEmitStub;

    beforeEach(function() {
      socketStub = sinon.stub(CoreIO, 'Socket');
      socketEmitStub = sinon.stub();
      socketStub.returns({
        start: function() {},
        on: function() {},
        emit: socketEmitStub
      });

      syncModel = new CoreIO.SyncModel('synctest');
    });

    afterEach(function() {
      socketStub.restore();
    });

    it('Should send a socket call to all registered clients', function() {
      syncModel.emitRemote('test', {a: 'aa'});
      inspect(socketEmitStub).wasCalledOnce();
      inspect(socketEmitStub).wasCalledWith('test', {a:'aa'});
    });
  });

  describe('sync', function() {
    var socketStub,
      syncModel,
      socketEmitStub;

    beforeEach(function() {
      socketStub = sinon.stub(CoreIO, 'Socket');
      socketEmitStub = sinon.stub();
      socketStub.returns({
        start: function() {},
        on: function() {},
        emitGroup: socketEmitStub
      });

      syncModel = new CoreIO.SyncModel('synctest');
    });

    afterEach(function() {
      socketStub.restore();
    });

    it('Should syncronize model with all client models', function() {
      var emitRemoteStub = sinon.stub(syncModel, 'emitRemote');

      syncModel.sync('reset', {a: 'aa'});

      inspect(emitRemoteStub).wasCalledOnce();
      inspect(emitRemoteStub).wasCalledWith('syncmodel.reset', {a: 'aa'});

      emitRemoteStub.restore();
    });
  });
});
