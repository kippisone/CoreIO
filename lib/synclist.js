'use strict';

/**
 * SyncList module
 * @module  SyncList
 *
 * @requires CoreIO.List
 */

module.exports = function (CoreIO) {
  let log = require('logtopus').getLogger('coreio');

  var SyncList = function (name, conf) {
    conf = conf || {};

    var self = this;

    //Call CoreIO.List constructor
    CoreIO.List.call(this, name, conf);

    this.port = this.port || CoreIO.socketPort;
    this.path = this.path || 'xqsocket';
    this.channel = this.channel || this.name.toLowerCase();
    this.syncEnabled = false;
    this.isWriteable = !!this.isWriteable;

    this.initSocket();
    this.registerListener();

    this.on('item.push', function (index, len) {
      var emitFn = function (model) {
        return function () {
          self.sync('update', {
            _xqid: model.get('_xqid')
          }, model.get());
        };
      };

      self.items.slice(index, len).forEach(function (model) {
        model.set('_xqid', CoreIO.uid(), { silent: true, noSync: true });
        model.on('data.change', emitFn(model));
      });
    });
  };

  SyncList.prototype = Object.create(CoreIO.List.prototype);
  SyncList.prototype.constructor = SyncList;

  /**
   * Inherits a synclist prototype
   * @method inherit
   * @param  {String} name    synclist name
   * @param  {Object} options Model properties
   * @return {Object}         Returns a CoreIO.Model prototype
   */
  SyncList.inherit = function (name, options) {
    if (typeof name === 'object') {
      options = name;
      name = undefined;
    }

    var Proto = function () {
      CoreIO.SyncList.call(this, name, options);
    };

    Proto.prototype = Object.create(CoreIO.SyncList.prototype);
    Proto.prototype.constructor = Proto;
    return Proto;
  };

  SyncList.prototype.initSocket = function () {
    this.socket = new CoreIO.Socket({
      port: this.port,
      path: this.path,
      channel: this.channel
    });

    this.socket.start();
  };

  /**
   * Register listener
   *
   * @method registerListener
   * @protected
   *
   */
  SyncList.prototype.registerListener = function () {
    this.socket.on('synclist.register', function (data, connection) {
      log.debug('Register new user at list', data, connection.pathname, this.channel);
      // this.socket.setGroup(connection, 'synclist.' + this.name.toLowerCase());
      this.socket.emitOne(connection, 'synclist.init', this.toArray());
    }.bind(this));

    this.socket.on('synclist.fetch', function (data, connection) {
      log.debug('Fetch whole list');
      this.socket.emitOne(connection, 'synclist.init', this.toArray());
    }.bind(this));

    this.socket.on('synclist.unregister', function (data, connection) {
      log.dev('Unregister user from list', data, connection.pathname);
      // this.socket.unsetGroup(connection, 'synclist.' + this.name.toLowerCase());
    }.bind(this));

    if (this.isWriteable) {
      var opts = {
        sync: 'false'
      };

      this.socket.on('synclist.push', function (data) {
        this.push(data, opts);
      }.bind(this));

      this.socket.on('synclist.unshift', function (data) {
        this.unshift(data, opts);
      }.bind(this));

      this.socket.on('synclist.pop', function () {
        this.pop(opts);
      }.bind(this));

      this.socket.on('synclist.shift', function () {
        this.shift(opts);
      }.bind(this));

      this.socket.on('synclist.update', function (query, data) {
        this.update(query, data, opts);
      }.bind(this));

      this.socket.on('synclist.clear', function () {
        this.clear(opts);
      }.bind(this));
    }
  };

  /**
   * Send a socket message to all registered clients
   * @param  {String} eventName Event name
   * @param  {Object} data      Data object
   */
  SyncList.prototype.emitRemote = function (eventName, data) {
    var args = Array.prototype.slice.call(arguments);
    this.socket.emit.apply(this.socket, args);
  };

  SyncList.prototype.sync = function (method, arg1, arg2) {
    var args = [];

    switch (method) {
      case 'push':
        args = ['synclist.push', arg1];
        break;
      case 'unshift':
        args = ['synclist.unshift', arg1];
        break;
      case 'pop':
        args = ['synclist.pop'];
        break;
      case 'shift':
        args = ['synclist.shift'];
        break;
      case 'update':
        args = ['synclist.update', arg1, arg2];
        break;
    }

    this.emitRemote.apply(this, args);
  };

  return SyncList;
};