'use strict';

let inspect = require('inspect.js');
let sinon = require('sinon');
inspect.useSinon(sinon);

let CoreIO = require('../lib/coreio');

describe('CoreIO.Event', function() {
  'use strict';

  describe('Object', function() {
    it('Should be an Event object', function() {
      inspect(CoreIO.Event).isFunction();
    });

    it('Should hav an on method', function() {
      inspect(CoreIO.Event.prototype.on).isFunction();
    });

    it('Should hav an once method', function() {
      inspect(CoreIO.Event.prototype.once).isFunction();
    });

    it('Should hav an emit method', function() {
      inspect(CoreIO.Event.prototype.emit).isFunction();
    });

    it('Should hav an off method', function() {
      inspect(CoreIO.Event.prototype.off).isFunction();
    });

    it('Should hav an clearEvents method', function() {
      inspect(CoreIO.Event.prototype.clearEvents).isFunction();
    });
  });

  describe('on', function() {
    var ee;

    beforeEach(function() {
      ee = new CoreIO.Event();
    });

    it('Should register event listener', function() {
      var fn = sinon.stub();
      ee.on('test', fn);

      inspect(ee.__events.test).isArray();
      inspect(ee.__events.test).hasLength(1);
      inspect(ee.__events.test[0].fn).isEqual(fn);
    });

    it('Should register multiple event listener', function() {
      var fn = sinon.stub();
      var fn2 = sinon.stub();
      var fn3 = sinon.stub();
      ee.on('test', fn);
      ee.on('test', fn2);
      ee.on('test', fn3);

      inspect(ee.__events.test).isArray();
      inspect(ee.__events.test).hasLength(3);
      inspect(ee.__events.test[0].fn).isEqual(fn);
      inspect(ee.__events.test[1].fn).isEqual(fn2);
      inspect(ee.__events.test[2].fn).isEqual(fn3);
    });

    it('Should register multiple event listeners of different types', function() {
      var fn = sinon.stub();
      var fn2 = sinon.stub();
      var fn3 = sinon.stub();
      ee.on('test', fn);
      ee.on('test.bla', fn2);
      ee.on('test.blubb', fn3);

      inspect(ee.__events.test).isArray();
      inspect(ee.__events.test).hasLength(1);
      inspect(ee.__events.test[0].fn).isEqual(fn);
      inspect(ee.__events['test.bla'][0].fn).isEqual(fn2);
      inspect(ee.__events['test.blubb'][0].fn).isEqual(fn3);
    });
  });

  describe('emit', function() {
    var ee;

    beforeEach(function() {
      ee = new CoreIO.Event();
    });

    it('Should emit an event', function() {
      var fn = sinon.stub();
      ee.on('test', fn);
      ee.emit('test', { data: 'aa'});

      inspect(fn).wasCalledOnce();
      inspect(fn).wasCalledWith({data: 'aa'});
    });

    it('Should emit an event and should return num of called listeners', function() {
      var fn = sinon.stub();
      ee.on('test', fn);
      var len = ee.emit('test', { data: 'aa'});

      inspect(len).isEql(1);
    });

    it('Should emit an event twice', function() {
      var fn = sinon.stub();
      ee.on('test', fn);
      ee.emit('test', { data: 'aa'});

      inspect(fn).wasCalledOnce();
      inspect(fn).wasCalledWith({data: 'aa'});

      ee.emit('test', { data: 'bb'});

      inspect(fn).wasCalledTwice();
      inspect(fn).wasCalledWith({data: 'aa'});
      inspect(fn).wasCalledWith({data: 'bb'});
    });

    it('Should emit an unregistered event', function() {
      var fn = sinon.stub();
      ee.on('test', fn);
      ee.emit('test.bla', { data: 'aa'});

      inspect(fn).wasNotCalled();
    });

    it('Should increase the emit counter', function() {
      var fn = sinon.stub();
      var listener = ee.on('test', fn);

      ee.emit('test', { data: 'aa'});
      inspect(listener.calls).isEql(1);

      ee.emit('test', { data: 'bb'});
      inspect(listener.calls).isEql(2);
    });
  });

  describe('once', function() {
    var ee;

    beforeEach(function() {
      ee = new CoreIO.Event();
    });

    it('Should register an event listener only once', function() {
      var fn = sinon.stub();
      ee.once('test', fn);

      inspect(ee.__events.test).isArray();
      inspect(ee.__events.test).hasLength(1);
      inspect(ee.__events.test[0].fn).isEqual(fn);

      ee.emit('test', 'aa');
      inspect(fn).wasCalledOnce();
      inspect(fn).wasCalledWith('aa');

      inspect(ee.__events.test).hasLength(0);

      ee.emit('test', 'aa');
      inspect(fn).wasCalledOnce();
    });

    it('Should register an event listener multiple times', function() {
      var fn = sinon.stub();
      var fn2 = sinon.stub();
      var fn3 = sinon.stub();
      ee.on('test', fn);
      ee.once('test', fn2);
      ee.on('test', fn3);

      inspect(ee.__events.test).isArray();
      inspect(ee.__events.test).hasLength(3);
      inspect(ee.__events.test[0].fn).isEqual(fn);
      inspect(ee.__events.test[1].fn).isEqual(fn2);
      inspect(ee.__events.test[2].fn).isEqual(fn3);

      ee.emit('test', 'aa');
      inspect(fn).wasCalledOnce();
      inspect(fn2).wasCalledOnce();
      inspect(fn3).wasCalledOnce();
      inspect(fn).wasCalledWith('aa');
      inspect(fn2).wasCalledWith('aa');
      inspect(fn3).wasCalledWith('aa');

      inspect(ee.__events.test).hasLength(2);

      ee.emit('test', 'aa');
      inspect(fn).wasCalledTwice();
      inspect(fn2).wasCalledOnce();
      inspect(fn3).wasCalledTwice();
    });
  });

  describe('off', function() {
    var ee;

    beforeEach(function() {
      ee = new CoreIO.Event();
    });

    it('Should unregister an event listener', function() {
      var fn = sinon.stub();
      ee.on('test', fn);

      inspect(ee.__events.test).isArray();
      inspect(ee.__events.test).hasLength(1);
      inspect(ee.__events.test[0].fn).isEqual(fn);

      ee.emit('test', 'aa');
      inspect(fn).wasCalledOnce();
      inspect(fn).wasCalledWith('aa');

      ee.off('test', fn);
      inspect(ee.__events.test).isEql(undefined);

      ee.emit('test', 'aa');
      inspect(fn).wasCalledOnce();
    });

    it('Should unregister events with the same listener func', function() {
      var fn = sinon.stub();
      var fn2 = sinon.stub();
      ee.on('test', fn);
      ee.on('test', fn2);

      inspect(ee.__events.test).isArray();
      inspect(ee.__events.test).hasLength(2);
      inspect(ee.__events.test[0].fn).isEqual(fn);
      inspect(ee.__events.test[1].fn).isEqual(fn2);

      ee.emit('test', 'aa');
      inspect(fn).wasCalledOnce();
      inspect(fn2).wasCalledOnce();
      inspect(fn).wasCalledWith('aa');
      inspect(fn2).wasCalledWith('aa');

      ee.off('test', fn);
      inspect(ee.__events.test).hasLength(1);
      inspect(ee.__events.test[0].fn).isEqual(fn2);

      ee.emit('test', 'aa');
      inspect(fn).wasCalledOnce();
      inspect(fn2).wasCalledTwice();
    });

    it('Should unregister all event listeners of an event name', function() {
      var fn = sinon.stub();
      var fn2 = sinon.stub();
      ee.on('test', fn);
      ee.on('test', fn2);

      inspect(ee.__events.test).isArray();
      inspect(ee.__events.test).hasLength(2);
      inspect(ee.__events.test[0].fn).isEqual(fn);

      ee.emit('test', 'aa');
      inspect(fn).wasCalledOnce();
      inspect(fn).wasCalledWith('aa');

      ee.off('test');
      inspect(ee.__events.test).isEql(undefined);

      ee.emit('test', 'aa');
      inspect(fn).wasCalledOnce();
    });

    it('Should return the number of removed listeners, remove all', function() {
      var fn = sinon.stub();
      var fn2 = sinon.stub();
      ee.on('test', fn);
      ee.on('test', fn2);

      var len = ee.off('test');
      inspect(len).isEql(2);
    });

    it('Should return the number of removed listeners, remove one', function() {
      var fn = sinon.stub();
      var fn2 = sinon.stub();
      ee.on('test', fn);
      ee.on('test', fn2);

      var len = ee.off('test', fn);
      inspect(len).isEql(1);
    });

    it('Should return the number of removed listeners, remove none', function() {
      var fn = sinon.stub();
      var fn2 = sinon.stub();
      ee.on('test', fn);
      ee.on('test', fn2);

      var len = ee.off('test-bla', fn);
      inspect(len).isEql(0);
    });
  });

  describe('clearEvents', function() {
    var ee;

    beforeEach(function() {
      ee = new CoreIO.Event();
    });

    it('Should remove all registered events', function() {
      var fn = sinon.stub();
      var fn2 = sinon.stub();
      ee.on('test', fn);
      ee.on('test', fn2);

      inspect(ee.__events.test).isArray();
      inspect(ee.__events.test).hasLength(2);
      ee.clearEvents();

      inspect(ee.__events).isEql({});
    });
  });

  describe('maxLength', function() {
    var ee;

    beforeEach(function() {
      ee = new CoreIO.Event();
      ee.maxLength = 3;
    });

    it('Should warn if listener max length was exceeded', function() {
      var warnStub = sinon.stub(ee.__logger, 'warn');

      var fn = sinon.stub();

      ee.on('test', fn);
      ee.on('test', fn);
      ee.on('test', fn);

      inspect(warnStub).wasNotCalled();
      ee.on('test', fn);

      inspect(warnStub).wasCalledOnce();
      inspect(warnStub).wasCalledWith('Listener max length was exceeded!', 'List:', 'test', 'Length:', 4);

      warnStub.restore();
    });

    it('Should set maxlength by a global property', function() {
      CoreIO.eventListenerMaxLength = 5;
      ee = new CoreIO.Event();

      inspect(ee.maxLength).isEql(5);
    });
  });

  describe('logger', function() {
    var ee,
      logStub,
      debugStub;


    beforeEach(function() {
      ee = new CoreIO.Event();
      ee.maxLength = 3;

      logStub = sinon.stub(ee.__logger, 'info');
      debugStub = sinon.stub(ee.__logger, 'debug');
    });

    afterEach(function() {
      logStub.restore();
      debugStub.restore();
    });

    it('Should log each registration of an event', function() {
      ee.on('test', function() {});
      inspect(logStub).wasCalledOnce();
      inspect(logStub).wasCalledWith('Register new `test` event');

      logStub.restore();
    });

    it('Should log each emit call of an event', function() {
      ee.on('test', function() {});
      logStub.reset();

      ee.emit('test', { a: 'aa' });
      inspect(logStub).wasCalledOnce();
      inspect(debugStub).wasCalledOnce();
      inspect(logStub).wasCalledWith('Emit `test` event to', 1, 'listener');
      inspect(debugStub).wasCalledWith(' ... data:', { a: 'aa' });
    });

    it('Should log an emit failed message if no event of this type were registered', function() {
      ee.on('test', function() {});
      logStub.reset();

      ee.emit('test-foo', function() {});
      inspect(logStub).wasCalledOnce();
      inspect(logStub).wasCalledWith('Emit `test-foo` event failed! No listener of this type are registered');
    });

    it('Should log each off call of an event', function() {
      ee.on('test', function() {});
      logStub.reset();

      ee.off('test');
      inspect(logStub).wasCalledOnce();
      inspect(logStub).wasCalledWith('Unregister `test` events!', 'Removed 1 listener');
    });

    it('Should log each off call failed message', function() {
      ee.on('test', function() {});
      logStub.reset();

      ee.off('test-foo');
      inspect(logStub).wasCalledOnce();
      inspect(logStub).wasCalledWith('Unregister events failed! No `test-foo` events were found!');
    });
  });
});
