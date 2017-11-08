'use strict';

let inspect = require('inspect.js');
let sinon = require('sinon');
inspect.useSinon(sinon);

let CoreIO = require('../src/coreio');
let log = require('logtopus').getLogger('coreio');
log.setLevel('error');

describe('CoreIO.SyncList', function() {
  describe('instance', function() {
    var initSocketStub,
      registerListenerStub;

    beforeEach(function() {
      initSocketStub = sinon.stub(CoreIO.SyncList.prototype, 'initSocket');
      registerListenerStub = sinon.stub(CoreIO.SyncList.prototype, 'registerListener');
    });

    afterEach(function() {
      initSocketStub.restore();
      registerListenerStub.restore();
    });

    it('Should be a SyncList object', function() {
      inspect(CoreIO.SyncList).isFunction();
    });

    it('Should be an instance of SyncList', function() {
      var syncList = new CoreIO.SyncList();
      inspect(syncList).isInstanceOf(CoreIO.SyncList);
      inspect(syncList).isInstanceOf(CoreIO.List);
    });

    it('Should call List constructor', function() {
      var listConstructorStub = sinon.spy(CoreIO, 'List');
      var syncList = new CoreIO.SyncList();

      inspect(listConstructorStub).wasCalledOnce();

      listConstructorStub.restore();
    });

    it('Should call initSocket method', function() {
      var syncList = new CoreIO.SyncList();

      inspect(initSocketStub).wasCalledOnce();
    });

    it('Should call registerListener method', function() {
      var syncList = new CoreIO.SyncList();

      inspect(registerListenerStub).wasCalledOnce();
    });

    it('Should have been extended by CoreIO.Event', function() {
      var syncList = new CoreIO.SyncList();
      inspect(syncList.on).isFunction();
      inspect(syncList.off).isFunction();
      inspect(syncList.emit).isFunction();
    });
  });

  describe('initSocket', function() {
    var SocketStub,
      startStub,
      registerListenerStub,
      syncList;

    beforeEach(function() {
      SocketStub = sinon.stub(CoreIO, 'Socket');
      startStub = sinon.stub();
      SocketStub.returns({
        start: startStub
      });

      registerListenerStub = sinon.stub(CoreIO.SyncList.prototype, 'registerListener');

      syncList = new CoreIO.SyncList('test', {
        port: 1234
      });
    });

    afterEach(function() {
      SocketStub.restore();
      registerListenerStub.restore();
    });

    it('Should initialize CoreIO.Socket', function() {
      inspect(SocketStub).wasCalledOnce();
      inspect(SocketStub).wasCalledWith({
        path: 'xqsocket',
        channel: 'testlist',
        port: 1234
      });

      inspect(startStub).wasCalledOnce();
    });
  });

  describe('registerListener', function() {
    var socketStub,
      initSocketStub;

    beforeEach(function() {
      socketStub = sinon.createStubInstance(CoreIO.Socket);
      initSocketStub = sinon.stub(CoreIO.SyncList.prototype, 'initSocket').callsFake(function() {
        this.socket = socketStub;
      });
    });

    afterEach(function() {
      initSocketStub.restore();
    });

    it('Should register listener', function() {
      var syncList = new CoreIO.SyncList('test', {
        isWriteable: true
      });

      inspect(socketStub.on).hasCallCount(9);
      inspect(socketStub.on).wasCalledWith('synclist.register', sinon.match.func);
      inspect(socketStub.on).wasCalledWith('synclist.unregister', sinon.match.func);
    });

    it('Should register a synclist.push listener', function() {
      var syncList;
      syncList = new CoreIO.SyncList('test', {
        isWriteable: true
      });

      inspect(socketStub.on).wasCalledWith('synclist.push', sinon.match.func);

      var pushStub = sinon.stub(syncList, 'push');
      socketStub.on.withArgs('synclist.push').yield('Test data');
      inspect(pushStub).wasCalledOnce();
      inspect(pushStub).wasCalledWith('Test data', {
        sync: 'false'
      });
      pushStub.restore();
    });

    it('Should register a synclist.unshift listener', function() {
      var syncList;
      syncList = new CoreIO.SyncList('test', {
        isWriteable: true
      });

      inspect(socketStub.on).wasCalledWith('synclist.unshift', sinon.match.func);

      var unshiftStub = sinon.stub(syncList, 'unshift');
      socketStub.on.withArgs('synclist.unshift').yield('Test data');
      inspect(unshiftStub).wasCalledOnce();
      inspect(unshiftStub).wasCalledWith('Test data', {
        sync: 'false'
      });
      unshiftStub.restore();
    });

    it('Should register a synclist.pop listener', function() {
      var syncList;
      syncList = new CoreIO.SyncList('test', {
        isWriteable: true
      });

      inspect(socketStub.on).wasCalledWith('synclist.pop', sinon.match.func);

      var popStub = sinon.stub(syncList, 'pop');
      socketStub.on.withArgs('synclist.pop').yield('Test data');
      inspect(popStub).wasCalledOnce();
      inspect(popStub).wasCalledWith({
        sync: 'false'
      });
      popStub.restore();
    });

    it('Should register a synclist.shift listener', function() {
      var syncList;
      syncList = new CoreIO.SyncList('test', {
        isWriteable: true
      });

      inspect(socketStub.on).wasCalledWith('synclist.shift', sinon.match.func);

      var shiftStub = sinon.stub(syncList, 'shift');
      socketStub.on.withArgs('synclist.shift').yield('Test data');
      inspect(shiftStub).wasCalledOnce();
      inspect(shiftStub).wasCalledWith({
        sync: 'false'
      });
      shiftStub.restore();
    });

    it('Shouldn\'t register any synclist.* listeners if list isn\'t writeable', function() {
      var syncList = new CoreIO.SyncList('test', {
        isWriteable: false
      });

      inspect(socketStub.on).wasNeverCalledWith('synclist.push');
      inspect(socketStub.on).wasNeverCalledWith('synclist.unshift');
      inspect(socketStub.on).wasNeverCalledWith('synclist.pop');
      inspect(socketStub.on).wasNeverCalledWith('synclist.shift');
    });
  });

  describe('emitRemote', function() {
    var socketStub,
      initSocketStub;

    beforeEach(function() {
      socketStub = sinon.createStubInstance(CoreIO.Socket);
      initSocketStub = sinon.stub(CoreIO.SyncList.prototype, 'initSocket').callsFake(function() {
        this.socket = socketStub;
      });
    });

    afterEach(function() {
      initSocketStub.restore();
    });

    it('Should emit a socket message to the client', function() {
      var syncList = new CoreIO.SyncList('test');
      syncList.emitRemote('bla.blubb', 'Test data');

      inspect(socketStub.emit).wasCalledOnce();
      inspect(socketStub.emit).wasCalledWith('bla.blubb', 'Test data');
    });
  });

  describe('sync', function() {
    var socketStub,
      initSocketStub;

    beforeEach(function() {
      socketStub = sinon.createStubInstance(CoreIO.Socket);
      initSocketStub = sinon.stub(CoreIO.SyncList.prototype, 'initSocket').callsFake(function() {
        this.socket = socketStub;
      });
    });

    afterEach(function() {
      initSocketStub.restore();
    });

    it('Should syncronize model with all client models', function() {
      var syncList = new CoreIO.SyncList('test');
      var emitRemoteStub = sinon.stub(syncList, 'emitRemote');

      syncList.sync('push', {a: 'aa'});

      inspect(emitRemoteStub).wasCalledOnce();
      inspect(emitRemoteStub).wasCalledWith('synclist.push', {a: 'aa'});

      emitRemoteStub.restore();
    });
  });
});
