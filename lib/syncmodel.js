'use strict';

/**
* CoreIO SyncModel
*
* This module organizes your data.
* A model has different states and changes it on a specific action.
*
* States:
* starting | Before initialization
* ready    | Initial state
* valid    | Validation was successfull
* invalid  | Validation failed
*
*
* @package CoreIO
* @module Model
* @requires CoreIO.Utils
* @requires CoreIO.Event
*/

module.exports = function (CoreIO) {
  let log = require('logtopus').getLogger('coreio');

  let SyncModel = function (name, conf) {
    conf = conf || {};

    //Call CoreIO.Model constructor
    CoreIO.Model.call(this, name, conf);

    this.port = this.port || CoreIO.socketPort;
    this.path = this.path || 'xqsocket';
    this.channel = this.channel || this.name.toLowerCase();
    this.syncEnabled = false;
    this.isWriteable = !!this.isWriteable;

    this.initSocket();
    this.initRest();
    this.registerListener();
  };

  SyncModel.prototype = Object.create(CoreIO.Model.prototype);
  SyncModel.prototype.constructor = SyncModel;

  /**
   * Inherits a sync model prototype
   * @method inherit
   * @param  {String} name    model name
   * @param  {Object} options SyncModel properties
   * @return {Object}         Returns a CoreIO.SyncModel prototype
   */
  SyncModel.inherit = function (name, options) {
    if (typeof name === 'object') {
      options = name;
      name = undefined;
    }

    let Proto = function () {
      CoreIO.SyncModel.call(this, name, options);
    };

    Proto.prototype = Object.create(CoreIO.SyncModel.prototype);
    Proto.prototype.constructor = Proto;
    return Proto;
  };

  SyncModel.prototype.initSocket = function () {
    this.socket = new CoreIO.Socket({
      port: this.port,
      path: this.path,
      channel: this.channel
    });

    return this.socket.start();
  };

  SyncModel.prototype.initRest = function () {
    CoreIO.api('/coreio/models/' + this.shortName).get((req, res) => {
      if (req.accepts('json') === 'json') {
        res.json(this.get());
      } else if (req.accepts('html') === 'html') {
        res.send(JSON.stringify(this.get(), null, '  '));
      } else {
        res.send(406);
        log.warn('Accept header missing or invalid in request', req.path);
      }
    });
  };

  /**
   * Register listener
   *
   * @method registerListener
   * @protected
   */
  SyncModel.prototype.registerListener = function () {
    this.socket.on('syncmodel.register', function (data, connection) {
      log.debug('Register new user at model', data, connection.pathname, this.channel);
      this.socket.emitOne(connection, 'syncmodel.init', this.get());
    }.bind(this));

    this.socket.on('syncmodel.fetch', function (data, connection) {
      log.debug('Fetch whole model');
      this.socket.emitOne(connection, 'syncmodel.init', this.get());
    }.bind(this));

    this.socket.on('syncmodel.unregister', function (data, connection) {
      log.debug('Unregister user from model', data, connection.pathname);
    }.bind(this));

    if (this.isWriteable) {
      var opts = {
        sync: 'false'
      };

      this.socket.on('syncmodel.set', function (data) {
        this.set(data, opts);
      });

      this.socket.on('syncmodel.replace', function (data) {
        opts.replace = true;
        this.set(data, opts);
      });

      this.socket.on('syncmodel.item', function (key, value) {
        this.set(key, value, opts);
      });

      this.socket.on('syncmodel.insert', function (path, index, data) {
        this.insert(path, index, data, opts);
      });

      this.socket.on('syncmodel.remove', function (path, index, data) {
        this.remove(path, index, data, opts);
      });

      this.socket.on('syncmodel.reset', function () {
        this.reset(opts);
      });
    }
  };

  /**
   * Send a socket message to all registered clients
   * @param  {String} eventName Event name
   * @param  {Object} data      Data object
   */
  SyncModel.prototype.emitRemote = function (eventName, data) {
    let args = Array.prototype.slice.call(arguments);
    this.socket.emit.apply(this.socket, args);
  };

  SyncModel.prototype.sync = function (method, data) {
    let args = Array.prototype.slice.call(arguments, 1);
    args.unshift('syncmodel.' + method);
    this.emitRemote.apply(this, args);
  };

  return SyncModel;
};