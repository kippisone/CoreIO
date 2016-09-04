'use strict';

/**
* CoreIO Service
*
* A service is a proxy between a database and a service
*
* @package CoreIO
* @module Service
*/
module.exports = function(CoreIO) {
  let log = require('logtopus').getLogger('coreio');

  /**
   * CoreIO.Service base class
   *
   * @class CoreIO.Service
   * @constructor
   *
   * @uses CoreIO.Logger
   * @uses CoreIO.Event
   *
   * @param {Object} conf Service extend object
   */
  var Service = function CoreIOService(name, conf) {

    /**
     * Enable debug mode
     * @public
     * @type {Boolean}
     */
    log.logLevel = CoreIO.logLevel;

    if (conf === undefined) {
      conf = {};
    }

    if (typeof conf === 'function') {
      conf.call(this, this);
    }
    else {
      Object.assign(this, conf);
    }

    /**
     * Service name
     * @property {String} name
     */
    this.name = name;

    //-- Add default values
    if (this.defaults && !CoreIO.isEmptyObject(this.defaults)) {
      this.set(this.defaults, {
        silent: true,
        noValidation: true
      });
    }
  };

  /**
   * Inherits a service prototype
   * @method inherit
   * @static
   * @param  {String} name    service name
   * @param  {Object} options Service properties
   * @return {Object}         Returns a CoreIO.Service prototype
   */
  Service.inherit = function(name, options) {
    if (typeof name === 'object') {
      options = name;
      name = undefined;
    }

    // call ready state constructor
    CoreIO.ReadyState.call(this);

    var Proto = function(_name, _options) {
      //TODO call this later, ready state will be set before _options had been run
      CoreIO.Service.call(this, name, options);

      if (_name) {
        if (typeof _name === 'string') {
          name = _name;
        }
        else {
          _options = _name;
        }

        if (typeof _options === 'function') {
          _options.call(this, this);
        }
        else if (typeof _options === 'object') {
          Object.assign(this, _options);
        }
      }
    };

    Proto.prototype = Object.create(CoreIO.Service.prototype);
    Proto.prototype.constructor = Proto;
    return Proto;
  };

  Service.prototype = Object.create(CoreIO.ReadyState.prototype);

  /**
   * Save model data
   *
   * @method save
   *
   * @overwritable
   * @return {object} Returns a promise
   */
  Service.prototype.save = function () {
    return Promise.resolve();
  };

  /**
   * Update model data
   *
   * @method update
   *
   * @overwritable
   * @return {object} Returns a promise
   */
  Service.prototype.update = function () {
    return Promise.resolve();
  };

  /**
   * Fetch model data
   *
   * @method fetch
   *
   * @overwritable
   * @return {object} Returns a promise
   */
  Service.prototype.fetch = function () {
    return Promise.resolve();
  };

  /**
   * Deletes model data
   *
   * @method delete
   *
   * @overwritable
   * @return {object} Returns a promise
   */
  Service.prototype.delete = function () {
    return Promise.resolve();
  };

  //--

  return Service;
};
