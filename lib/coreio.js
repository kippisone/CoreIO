'use strict';

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _socket = require('./socket');

var _socket2 = _interopRequireDefault(_socket);

var _service = require('./service');

var _service2 = _interopRequireDefault(_service);

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CoreIO = {
  logLevel: 'sys',
  socketPort: 9889,
  socketHost: '0.0.0.0',
  httpPort: 6446,
  httpHost: '0.0.0.0'
};

CoreIO.conf = {};

(0, _utils2.default)(CoreIO);
CoreIO.Event = require('./event')(CoreIO);
CoreIO.List = require('./list')(CoreIO);
CoreIO.Model = require('./model')(CoreIO);
CoreIO.ReadyState = require('./readystate')(CoreIO);
CoreIO.Service = require('./service')(CoreIO);
CoreIO.SyncList = require('./synclist')(CoreIO);
CoreIO.SyncModel = require('./syncmodel')(CoreIO);

CoreIO.Service = (0, _service2.default)(CoreIO);
CoreIO.Server = (0, _server2.default)(CoreIO);
CoreIO.Socket = (0, _socket2.default)(CoreIO);
CoreIO.Router = (0, _router2.default)(CoreIO);

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
CoreIO.createModel = function (name, opts) {
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
CoreIO.createList = function (name, opts) {
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
CoreIO.createSyncModel = function (name, opts) {
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
CoreIO.createSyncList = function (name, opts) {
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
CoreIO.createService = function (name, opts) {
  return CoreIO.Service.inherit(name, opts);
};

CoreIO.createRouter = function (slug) {
  let router = require('express').Router();
  return router;
};

/**
 * Register a API route
 *
 * @method api
 *
 * @param  {string} slug Router
 * @param  {object} conf Route configuration
 *
 * @return {object} Returns a router instance
 */
CoreIO.api = function (slug, conf) {
  conf.slug = slug;
  let router = new CoreIO.Router({
    noServer: conf.noServer || false
  });

  router.registerRoutes(conf);

  return router;
};

CoreIO.getHttpServer = function (host, port) {
  if (!host) {
    host = CoreIO.httpHost;
  }

  if (!port) {
    port = CoreIO.httpPort;
  }

  if (!CoreIO.__httpServers) {
    CoreIO.__httpServers = {};
  }

  if (CoreIO.__httpServers[host + ':' + port]) {
    return CoreIO.__httpServers[host + ':' + port];
  }

  let http = require('http');
  let server = http.createServer();
  server.listen(port, host);
  return server;
};

CoreIO.getConf = function (name, defaultValue) {
  return CoreIO.conf[name] || defaultValue;
};

CoreIO.setConf = function (name, value) {
  CoreIO.conf[name] = value;
};

/**
 * Register a HTML skeleton page
 *
 * data:
 * ```js
 * {
 *   title: 'page title',  // Pag title
 *   scripts: ['main.js'], // JS files
 *   styles: ['main.css']  // CSS files
 * }
 * ```
 * @param  {route} route HTML page route
 * @param  {object} data  page data
 * @param  {object} conf  Router configuration
 * @return {object}       Returns a Router instance
 */
CoreIO.htmlPage = function (route, data, conf) {
  conf = conf || {};
  let router = new CoreIO.Router({
    noServer: conf.noServer || false
  });

  router.registerHTMLPage(route, 'html', Object.assign({
    title: 'CoreIO html page',
    scripts: [],
    styles: []
  }, data));
  return router;
};

/**
 * Register a static dir
 * @param  {string} dir  Dirname
 * @param  {object} conf Router configuration
 * @return {object}      Returns a Router object
 */
CoreIO.staticDir = function (dir) {
  const server = new CoreIO.Server({
    port: CoreIO.getConf('httpPort'),
    host: CoreIO.getConf('httpHost')
  });

  server.registerStaticDir(dir);
  return server;
};

module.exports = CoreIO;