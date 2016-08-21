'use strict';

let http = require('http');
let sockjs = require('sockjs');

let inspect = require('inspect.js');
let sinon = require('sinon');
inspect.useSinon(sinon);

let CoreIO = require('../src/coreio');
let log = require('logtopus').getLogger('coreio');
log.setLevel('error');

describe('CoreIO.Socket', function() {
  'use strict';

  describe('Instance', function() {
    it('does exists', function() {
      inspect(CoreIO).isObject();
      inspect(CoreIO.Socket).isFunction();
    });

    it('is a CoreIO.Socket object', function() {
      let socket = new CoreIO.Socket({
        channel: 'test',
        port: 9876
      });

      inspect(socket).isInstanceOf(CoreIO.Socket);
    });
  });

  describe('start', function() {
    let socket,
      sandbox,
      createServerStub,
      getSocketServerStub,
      socketServerStartStub,
      createSocketServerStub,
      socketServerOnStub,
      listenStub,
      installHandlersStub;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();

      socketServerStartStub = sandbox.stub();
      socketServerOnStub = sandbox.stub();
      listenStub = sandbox.stub();
      installHandlersStub = sinon.stub();
      socketServerOnStub = sinon.stub();

      createServerStub = sandbox.stub(http, 'createServer');
      createSocketServerStub = sandbox.stub(sockjs, 'createServer');
      createSocketServerStub.returns({
        on: socketServerOnStub,
        installHandlers: installHandlersStub
      });

      createServerStub.returns({
        listen: listenStub
      });
      //
      socket = new CoreIO.Socket({
        channel: 'test',
        port: 9876
      });
    });

    afterEach(function() {
      sandbox.restore();
      delete CoreIO.Socket.__socketServerInstances['0.0.0.0:9876'];
    });

    it('returns a promise', function() {
      let res = socket.start();
      inspect(res).isPromise();
    });

    it('starts a Socket server', function() {
      return socket.start().then(() => {
        inspect(listenStub).wasCalledOnce();
        inspect(listenStub).wasCalledWith(9876, '0.0.0.0');
        inspect(socketServerOnStub).wasCalledOnce();
        inspect(socketServerOnStub).wasCalledWith('connection', sinon.match.func);
        inspect(installHandlersStub).wasCalledOnce();
        inspect(installHandlersStub).wasCalledWith(sinon.match.object, { prefix:'/xqsocket' });
      });
    });

    it('starts a server only once per port and host', function() {
      let socket = new CoreIO.Socket({
        channel: 'test',
        port: '9876'
      });

      let socket2 = new CoreIO.Socket({
        channel: 'test',
        port: 9876
      });

      inspect(socket).isNotEqual(socket2);
    });

    it('use one httpServer for multiple Socket instances', function() {
      // second instance
      let socket2 = new CoreIO.Socket({
        channel: 'test',
        port: 9876
      });

      return Promise.all([
        socket.start(),
        socket2.start()
      ]).then(() => {
        inspect(listenStub).wasCalledOnce();
        inspect(listenStub).wasCalledWith(9876, '0.0.0.0');
      })
    });
  });

  describe('emit', function() {
    let socket;

    beforeEach(function() {
      socket = new CoreIO.Socket({
        channel: 'test',
        port: 9876
      });

      socket.start();
    });

    it('emits a message to all connected clients', function() {
      let writeStub = sinon.stub();

      socket.__socket.connections = [
        { write: writeStub },
        { write: writeStub },
        { write: writeStub }
      ];

      socket.emit('test', {
        command:'test.start'
      });

      inspect(writeStub).wasCalledThrice();
      inspect(writeStub).wasAlwaysCalledWith(JSON.stringify({
        eventName: 'test',
        channel: 'test',
        args: [{command: 'test.start'}]
      }));
    });

    it('emits a message to all connected clients, multiple args', function() {
      let writeStub = sinon.stub();

      socket.__socket.connections = [
        { write: writeStub },
        { write: writeStub },
        { write: writeStub }
      ];

      socket.emit('test', {
        command:'test.start'
      }, 'test');

      inspect(writeStub).wasCalledThrice();
      inspect(writeStub).wasAlwaysCalledWith(JSON.stringify({
        eventName: 'test',
        channel: 'test',
        args: [{command: 'test.start'}, 'test']
      }));
    });
  });

  describe('on', function() {
    let socket;

    beforeEach(function() {
      socket = new CoreIO.Socket({
        channel: 'test',
        port: 9876
      });

      return socket.start();
    });

    it('registers a listener for incomming socket messages', function() {
      let onStub = sinon.stub();
      socket.on('test.bla', onStub);

      socket.__channel.emit('test.bla', 'jeay');
      socket.__channel.emit('test.blub', 'nope');

      inspect(onStub).wasCalledOnce();
      inspect(onStub).wasCalledWith('jeay');
    });

    it.skip('registers a listener for incomming socket messages for test channel', function() {
      let onStub = sinon.stub();
      socket.on('test.bla', onStub);

      // emit a message on all connections
      socket.__socket.connections.forEach(conn => {
        conn.emit('data', JSON.stringify({
          eventName: 'test',
          channel: 'test',
          args: [{command: 'test.bla'}, 'test']
        }))
      });

      inspect(onStub).wasCalledOnce();
      inspect(onStub).wasCalledWith('test');
    });
  });

  describe('setGroup', function() {
    let socket;

    beforeEach(function() {
      socket = new CoreIO.Socket({
        channel: 'test',
        port: 9876
      });

      return socket.start();
    });

    it('Should set a group', function() {
      let conn1 = {},
        conn2 = {},
        conn3 = {};


      socket.__socket.connections = [conn1, conn2, conn3];

      socket.setGroup(conn1, 'test');

      inspect(conn1).isEql({
        groups: {
          test: true
        }
      });

      inspect(conn2).isEql({});
      inspect(conn3).isEql({});

      socket.setGroup(conn3, 'test-bla');

      inspect(conn1).isEql({
        groups: {
          test: true
        }
      });

      inspect(conn2).isEql({});
      inspect(conn3).isEql({
        groups: {
          'test-bla': true
        }
      });

      //Test a not existing connection
      socket.setGroup({}, 'test-bla');
    });
  });

  describe('unsetGroup', function() {
    let socket;

    beforeEach(function() {
      socket = new CoreIO.Socket({
        channel: 'test',
        port: 9876
      });

      return socket.start();
    });

    it('Should set a group', function() {
      let conn1 = { groups: { test: true } },
        conn2 = {},
        conn3 = { groups: { 'test-bla': true } };

      socket.__socket.connections = [conn1, conn2, conn3];

      socket.unsetGroup(conn1, 'test');

      inspect(conn1).isEql({ groups: {} });
      inspect(conn2).isEql({});
      inspect(conn3).isEql({
        groups: {
          'test-bla': true
        }
      });

      socket.unsetGroup(conn3, 'test-bla');

      inspect(conn1).isEql({ groups: {} });
      inspect(conn2).isEql({});
      inspect(conn3).isEql({ groups: {} });

      //Test a not existing connection
      socket.unsetGroup({}, 'test-bla');
    });
  });

  describe('emitGroup', function() {
    let socket;

    beforeEach(function() {
      socket = new CoreIO.Socket({
        channel: 'test',
        port: 9876
      });

      return socket.start();
    });

    it('Should emit a message to all connected clients', function() {
      let writeStub = sinon.stub();

      socket.__socket.connections = [
        { write: writeStub, groups: { test: true } },
        { write: writeStub },
        { write: writeStub, groups: { 'test-bla': true } }
      ];

      socket.emitGroup('test', 'test', {
        command:'test.start'
      });

      inspect(writeStub).wasCalledOnce();
      inspect(writeStub).wasCalledWith(JSON.stringify({
        eventName: 'test',
        channel: 'test',
        args: [{command: 'test.start'}]
      }));
    });
  });
});
