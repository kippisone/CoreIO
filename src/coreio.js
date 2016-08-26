'use strict';

let CoreIO = {
  logLevel: 'sys',
  socketPort: 9889
};

require('./utils')(CoreIO);
CoreIO.Event = require('./event')(CoreIO);
CoreIO.List = require('./list')(CoreIO);
CoreIO.Model = require('./model')(CoreIO);
CoreIO.Router = require('./router')(CoreIO);
CoreIO.Service = require('./service')(CoreIO);
CoreIO.Socket = require('./socket')(CoreIO);
CoreIO.SyncList = require('./synclist')(CoreIO);
CoreIO.SyncModel = require('./syncmodel')(CoreIO);

/**
 * Creates a model class
 *
 * @method createModel
 * @version v1.0.0
 *
 * @param  {string} name Model name
 * @param  {object} opts Model options
 * @returns {object} Returns a model class
 */
CoreIO.createModel = function(name, opts) {
  return CoreIO.Model.inherit(name, opts);
};

/**
 * Creates a list class
 *
 * @method createList
 * @version v1.0.0
 *
 * @param  {string} name List name
 * @param  {object} opts List options
 * @returns {object} Returns a list class
 */
CoreIO.createList = function(name, opts) {
  return CoreIO.List.inherit(name, opts);
};

/**
 * Creates a syncmodel class
 *
 * @method createSyncModel
 * @version v1.0.0
 *
 * @param  {string} name SyncModel name
 * @param  {object} opts SyncModel options
 * @returns {object} Returns a syncmodel class
 */
CoreIO.createSyncModel = function(name, opts) {
  return CoreIO.SyncModel.inherit(name, opts);
};

/**
 * Creates a synclist class
 *
 * @method createSyncList
 * @version v1.0.0
 *
 * @param  {string} name SyncList name
 * @param  {object} opts SyncList options
 * @returns {object} Returns a model class
 */
CoreIO.createSyncList = function(name, opts) {
  return CoreIO.SyncList.inherit(name, opts);
};

/**
 * Creates a service class
 *
 * @method createService
 * @version v1.0.0
 *
 * @param  {string} name Service name
 * @param  {object} opts Service options
 * @returns {object} Returns a service class
 */
CoreIO.createService = function(name, opts) {
  return CoreIO.Service.inherit(name, opts);
};

CoreIO.createRouter = function(slug) {
  let router = require('express').Router();
  return router;
};

CoreIO.api = function(model, conf) {
  let router = new CoreIO.Router(conf);
  if (model instanceof CoreIO.Model) {
    router.coupleModel(model);
  }

  return router;
}

module.exports = CoreIO;
