/**
 * CoreIO Event
 *
 * A powerfull event emitter
 *
 * @module CoreIO.Event
 *
 * @example {js}
 * var ee = new CoreIO.Event();
 * ee.on('echo', function(msg) {
 *     console.log('Msg:', msg);
 * });
 *
 * //Emit an event
 * ee.emit('echo', 'Hello World!');
 *
 * @example {js}
 * var MyModule = function() {
 *     //Call Event constructor
 *     CoreIO.Event.call(this);
 * };
 *
 * //Extend MyModule with event emitter methods
 * CoreIO.extend(MyModule.prototype, CoreIO.Event.prototype);
 */

'use strict';

module.exports = function (CoreIO) {
  let log = require('logtopus').getLogger('coreio');

  /**
   * An EventListener represents a single event.
   *
   * Each event registration is an instance of EventListener
   *
   * @constructor
   * @group CoreIO.Event.EventListener
   * @private
   * @method  EventListener
   */
  var EventListener = function EventListener(ee, event, fn) {
    this.fn = fn;
    this.calls = 0;
    this.once = false;

    /**
     * Removes this event listener
     * @group CoreIO.Event.EventListener
     * @private
     * @method remove
     * @return {Boolean} Returns true if event was removed
     */
    this.remove = function () {
      ee.off(event, fn);
    };
  };

  /**
   * Event emitter constructor
   *
   * @constructor
   * @method EventEmitter
   */
  var EventEmitter = function EventEmitter() {
    this.__events = {};
    this.__logger = log;

    /**
     * Sets max length of event listeners
     * @property {Number} listenerMaxLength
     */
    this.listenerMaxLength = CoreIO.eventListenerMaxLength;
  };

  /**
   * Registers an event listener
   * @method on
   * @param  {String}   event Event name
   * @param  {Function} fn    Event function
   * @return {Object}         Returns an EventListener instance
   */
  EventEmitter.prototype.on = function (event, fn) {
    var listener = new EventListener(this, event, fn);
    if (!this.__events[event]) {
      this.__events[event] = [];
    }

    this.__events[event].push(listener);
    if (this.__events[event].length > this.listenerMaxLength) {
      log.warn('Listener max length was exceeded!', 'List:', event, 'Length:', this.__events[event].length);
    } else {
      log.info('Register new `' + event + '` event');
    }

    return listener;
  };

  /**
   * Registers an once event listener. This listener is called only once a time.
   *
   * @method once
   * @param  {event}  event  Event name
   * @param  {Function} fn    Event function
   * @return {Object}         Returns an EventListener instance
   */
  EventEmitter.prototype.once = function (event, fn) {
    var args = Array.prototype.slice.call(arguments);
    var listener = this.on.apply(this, args);
    listener.once = true;
    return listener;
  };

  /**
   * Emits an event
   * @method emit
   * @param  {String} event Event name
   * @param  {Any} data  Event data, you can use multiple args here
   * @return {Number}    Returns the number of emited events
   */
  EventEmitter.prototype.emit = function (event, data) {
    if (!this.__events[event]) {
      log.info('Emit `' + event + '` event failed! No listener of this type are registered');
      return 0;
    }

    var args = Array.prototype.slice.call(arguments, 1),
        len = this.__events[event].length;

    for (var i = len - 1; i >= 0; i--) {
      var listener = this.__events[event][i];
      listener.fn.apply(this, args);
      listener.calls++;
      if (listener.once === true) {
        this.__events[event].splice(i, 1);
      }
    }

    if (len) {
      log.info('Emit `' + event + '` event to', len, 'listener');
      log.debug(' ... data:', data);
    }

    return len;
  };

  /**
   * Unregisters events
   *
   * @method off
   * @param  {String}  event  Event name
   * @param  {Function}  [fn]  Event function. If this property is set only that function will be removed. Otherwis all events of this name will be removed
   * @return {Number} Returns the number of removed events
   */
  EventEmitter.prototype.off = function (event, fn) {
    var removed = 0;

    if (!this.__events[event]) {
      log.info('Unregister events failed! No `' + event + '` events were found!');
      return 0;
    }

    if (fn) {
      var len = this.__events[event].length;
      for (var i = 0; i < len; i++) {
        var listener = this.__events[event][i];
        if (listener && listener.fn === fn) {
          this.__events[event].splice(i, 1);
          removed++;
          //Do not break at this point, to remove duplicated events

          if (this.__events[event].length === 0) {
            delete this.__events[event];
          }
        }
      }
    } else {
      removed = this.__events[event].length;
      delete this.__events[event];
    }

    log.info('Unregister `' + event + '` events!', 'Removed ' + removed + ' listener');
    return removed;
  };

  /**
   * Removes all registered events
   * @method clear
   * @return {Number} Returns the number of removed events
   */
  EventEmitter.prototype.clearEvents = function () {
    this.__events = {};
  };

  //--

  return EventEmitter;
};