'use strict';

/**
* CoreIO Model
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
  var log = require('logtopus').getLogger('coreio');

  /**
   * CoreIO.Model base class
   *
   * @class CoreIO.Model
   * @constructor
   *
   * @uses CoreIO.Logger
   * @uses CoreIO.Event
   *
   * @param {Object} conf Model extend object
   */
  var Model = function CoreIOModel(name, conf) {
    var _this = this;

    //Call Event constructor
    CoreIO.Event.call(this);

    if (typeof arguments[0] === 'object') {
      conf = name;
      name = conf.name;
    }

    /**
     * Enable debug mode
     * @public
     * @type {Boolean}
     */
    log.logLevel = CoreIO.logLevel;

    /**
     * Stores models properties
     * @type {Object}
     * @property pro
     * perties
     */
    this.properties = {};

    /**
     * Contains last validation errors if state is invalid
     * @type {Array}
     * @property lastValidationError
     */
    this.lastValidationError = null;

    //-- Initial conf mapping
    if (conf === undefined) {
      conf = {};
    }

    if (typeof conf === 'function') {
      conf.call(this, this);
    } else {
      Object.assign(this, conf);
    }

    this.__state = 'starting';
    this.__unfiltered = {};
    this.__isValid = false;

    this.customValidate = conf.validate;
    delete conf.validate;

    this.conf = conf;

    /**
     * Model short name
     * @property {String} name
     */
    this.shortName = name ? name.replace(/Model$/, '') : 'Nameless';

    /**
     * Model name
     * @property {String} name
     */
    this.name = this.shortName + 'Model';

    //-- Add default values
    if (this.defaults && !CoreIO.isEmptyObject(this.defaults)) {
      this.set(this.defaults, {
        silent: true,
        noValidation: true
      });
    }

    //-- Add schema props as default values
    if (this.schema) {
      Object.keys(this.schema).forEach(function (key) {
        if (!(key in this.properties)) {
          this.properties[key] = this.schema[key].default !== undefined ? this.schema[key].default : null;
        }
      }, this);
    }

    // initialize service
    if (this.service) {
      var serviceConf = {
        name: this.collection || this.table || this.shortName
      };

      var Service = this.service;
      this.__service = new Service(serviceConf);
      log.info('Connect model with service', serviceConf.name);
      this.__service.then(function () {
        log.sys('... service succesfully connected!');
        if (_this.autoSave) {
          _this.fetch();
        }
      }).catch(function (err) {
        log.error('... service connection failed!', err);
      });
    }

    this.__isValid = !this.schema;
    this.state('ready');
  };

  Object.assign(Model.prototype, CoreIO.Event.prototype);

  if (CoreIO.Sync) {
    Object.assign(Model.prototype, CoreIO.Sync.prototype);
  }

  /**
   * Inherits a model prototype
   * @method inherit
   * @static
   * @param  {String} name    model name
   * @param  {Object} options Model properties
   * @return {Object}         Returns a CoreIO.Model prototype
   */
  Model.inherit = function (name, options) {
    if (typeof name === 'object') {
      options = name;
      name = undefined;
    }

    var Proto = function Proto(_name, _options) {
      //TODO call this later, ready state will be set before _options had been run
      CoreIO.Model.call(this, name, options);

      if (_name) {
        if (typeof _name === 'string') {
          name = _name;
        } else {
          _options = _name;
        }

        if (typeof _options === 'function') {
          _options.call(this, this);
        } else if (typeof _options === 'object') {
          Object.assign(this, _options);
        }
      }
    };

    Proto.prototype = Object.create(CoreIO.Model.prototype);
    Proto.prototype.constructor = Proto;
    return Proto;
  };

  /**
   * Change the model state
   *
   * @method state
   * @param {String} state New state
   */
  Model.prototype.state = function (state) {
    this.__state = state;
    this.emit('state.' + state);
    this.emit('state.change', state);
  };

  /**
   * Get the current model state
   *
   * @method getState
   */
  Model.prototype.getState = function () {
    return this.__state;
  };

  /**
   * Set model data
   *
   * Triggers a data.change event if data was set succesfully
   *
   * @method set
   * @param {Object} data
   */

  /**
   * Set model data
   *
   * Triggers these events if data was set succesfully<br>
   * data.change<br>
   * &lt;key&gt;.change
   *
   * **options**
   * | property | type | description |
   * ---------------------------------
   * | silent | {boolean} | Don't trigger any events
   * | noValidation | {boolean} | Don't validate
   * | replace | {boolean} | Replace all date with new data
   * | noSync | {boolean} | Do not call sync method. Default: false
   * | noAutoSave | {boolean} | Dissable autosave
   *
   * @method set
   * @param {String} key
   * @param {Object} value Data value
   * @param {Object} options Options
   *
   * @returns {Object} Returns a promise object
   */
  Model.prototype.set = function (key, value, options) {
    var newData = {},
        oldData = this.get(),
        validationResult,
        setItem = false,
        setAll = false;

    options = options || {};

    if (arguments[0] === null) {
      newData = arguments[1];
      setAll = true;
      log.info('Set data', newData, oldData);
    } else if (typeof arguments[0] === 'object') {
      //Add a dataset
      options = value || {};
      newData = options.replace ? arguments[0] : Object.assign(newData, oldData, arguments[0]);
      setAll = true;
      key = null;
      log.info('Set data', newData, oldData);
    } else if (typeof arguments[0] === 'string') {
      newData = Object.assign({}, this.get());
      setItem = true;
      CoreIO.dedotify(newData, key, value);
      log.info('Set value', key, value, oldData);
    } else {
      log.warn('Data are incorrect in model.set()', arguments);
    }

    options = options || {};

    if (options.noValidation !== true) {
      if (this.customValidate) {
        log.info('Using a custom validation!');
        validationResult = this.customValidate(newData);
      } else if (this.schema) {
        validationResult = this.validate(newData);
        if (setItem && validationResult) {
          var newValidationResult;
          for (var i = 0, len = validationResult.length; i < len; i++) {
            if (validationResult[i].property === key) {
              newValidationResult = [validationResult[i]];
              break;
            }
          }

          validationResult = newValidationResult || null;
        }
      }

      if (validationResult) {
        log.warn('Validation error', validationResult);
        if (options.silent !== true) {
          this.emit('validation.error', validationResult, newData);
        }

        return Promise.reject({
          msg: 'validation.error',
          err: validationResult
        });
      }
    }

    this.properties = newData;
    if (options.silent !== true) {
      if (setAll) {
        if (!options.noSync && typeof this.sync === 'function') {
          this.sync(options.replace ? 'replace' : 'set', newData);
        } else {
          //TODO show only replaced data if set is using
          this.emit(options.replace ? 'data.replace' : 'data.set', newData, oldData);
        }
      } else if (setItem) {
        if (!options.noSync && typeof this.sync === 'function') {
          this.sync('value', key, value);
        }

        this.emit('value.set', key, value);
      }

      this.emit('data.change', newData, oldData);
    }

    if (this.autoSave && this.__service && !options.noAutoSave) {
      log.info('Autosave model', this.name);
      return this.save();
    }

    return Promise.resolve(newData);
  };

  /**
   * Get one or all properties from a dataset
   *
   * <b>Options:</b>
   *   copy: <Boolean>  //Set it to true to get a copy of the dataset
   *
   * @param {String} key Data key
   * @param {Object} options Set options
   *
   * @returns {Object}    Returns the whole model or a filtered dataset
   */
  Model.prototype.get = function (key, options) {
    if (options === undefined) {
      options = {};
    }

    var data;

    if (typeof key === 'object' && arguments.length === 1) {
      options = key;
      key = null;
    }

    if (key === undefined || key === null) {
      if (options.copy === true) {
        return Object.assign({}, this.properties);
      }

      return this.properties;
    } else if (typeof key === 'string' && typeof options === 'number') {
      var index = options;
      if (arguments.length === 3) {
        options = arguments[2];
      }

      var item = this.get(key);

      if (options.copy === true) {
        if (typeof item[index] === 'object') {
          return Object.assign({}, item[index]);
        }
      }

      return item ? item[index] : null;
    } else {
      if (options.copy === true) {
        data = CoreIO.undotify(key, this.properties);
        switch (typeof data) {
          case 'object':
            return Array.isArray(data) ? data.slice() : Object.assign(true, {}, data);
          case 'function':
            //jshint evil:true
            return eval('(' + data.toString() + ')');
          default:
            return data;
        }
      }

      return CoreIO.undotify(key, this.properties);
    }
  };

  /**
   * Get items filtered by a key array or object
   * @param  {Object|Array} keys Key array
   * @param  {Object} data (Optional) Data to be filtered. Uses model data if it is undefined
   * @return {Object}      Returns a filtered data object
   */
  Model.prototype.getByKeys = function (keys, data) {
    if (typeof keys !== 'object') {
      throw new Error('First param must be an object or array in Model.getByKeys()!');
    }

    var out = {};

    data = data || this.get();

    if (Array.isArray(keys)) {
      keys.forEach(function (key) {
        if (key.indexOf('.') === -1) {
          out[key] = data[key];
        } else {
          out = CoreIO.dedotify(out, key, CoreIO.undotify(key, data));
        }
      });
    } else {
      for (var k in keys) {
        if (keys.hasOwnProperty(k)) {
          var item = data[k];
          if (typeof item === 'object') {
            out[k] = this.getByKeys(keys[k], data[k]);
          } else {
            out[k] = data[k];
          }
        }
      }
    }

    return out;
  };

  /**
   * Check wether model has a dataset
   *
   * @method  has
   * @param {String} key Dataset key
   * @return {Boolean} Returns true if model has a dataset with key
   */
  Model.prototype.has = function (key) {
    var hasKey = true,
        obj = this.properties;

    key = key.split('.');
    for (var i = 0, len = key.length; i < len; i++) {
      if (typeof obj === 'object' && obj.hasOwnProperty(key[i])) {
        obj = obj[key[i]];
        if (obj === undefined) {
          hasKey = false;
          break;
        }

        continue;
      }

      hasKey = false;
      break;
    }

    return hasKey;
  };

  /**
   * Removes all data from model
   *
   * @method reset
   * @param  {Object} options Options object
   * {
   *     removeListener: true,    //Remove all event listener
   *     silent: true,            //Disable event emitting
   *     noSync: true             //Don't call sync method
   * }
   *
   * @fires data.reset
   * Fires a data.reset event if model was succesfully reseted.
   *
   * @returns {Object} Returns removed data
   *
   */
  Model.prototype.reset = function (options) {
    options = options || {};

    log.info('Reset model');
    var oldData = this.get();
    this.properties = Object.assign({}, this.defaults);
    this.state('ready');
    if (!options.silent) {
      this.emit('data.reset', oldData);
    }

    if (options.removeListener) {
      this.clearEvents();
    }

    if (!options.noSync) {
      if (typeof this.sync === 'function') {
        this.sync('reset', oldData);
      }
    }

    return oldData;
  };

  /**
   * Push data to a subset
   *
   * @method push
   * @param {String} path path to subset
   * @param {Object} data data to add
   */
  Model.prototype.push = function (path, data, options) {
    var dataset = CoreIO.undotify(path, this.properties);

    options = options || {};

    if (dataset instanceof Array) {
      dataset.push(data);
    } else if (typeof dataset === 'undefined') {
      CoreIO.dedotify(this.properties, path, [data]);
    } else if (typeof dataset === 'object' && !path && CoreIO.isEmptyObject(this.properties)) {
      this.properties = [data];
    } else {
      log.error('Model.push requires an array. Dataset isn\'t an array. Path: ', path);
      return;
    }

    if (options.silent !== true) {
      if (!options.noSync && typeof this.sync === 'function') {
        this.sync('insert', path, -1, data);
      }

      this.emit('item.insert', path, -1, data);
      this.emit('data.change', this.properties);
    }
  };

  /**
   * Unshift data to a subset
   *
   * @method unshift
   * @param {String} path path to subset
   * @param {Object} data data to add
   */
  Model.prototype.unshift = function (path, data, options) {
    var dataset = CoreIO.undotify(path, this.properties);

    options = options || {};

    if (dataset instanceof Array) {
      dataset.unshift(data);
    } else if (typeof dataset === 'undefined') {
      CoreIO.dedotify(this.properties, path, [data]);
    } else if (typeof dataset === 'object' && !path && CoreIO.isEmptyObject(this.properties)) {
      this.properties = [data];
    } else {
      log.error('Model.unshift requires an array. Dataset isn\'t an array. Path: ', path);
      return;
    }

    if (options.silent !== true) {
      if (!options.noSync && typeof this.sync === 'function') {
        this.sync('insert', path, 0, data);
      }

      this.emit('item.insert', path, 0, data);
      this.emit('data.change', this.properties);
    }
  };

  /**
   * Insert data into a subset at a given index
   *
   * @method insert
   * @param {String} path Path to subset
   * @param {Number} index The index where the data should be inserted
   * @param {Object} data Dataset to be inserted
   * @param {Object} options Inserting options
   */
  Model.prototype.insert = function (path, index, data, options) {
    var dataset = CoreIO.undotify(path, this.properties);

    options = options || {};

    if (dataset instanceof Array) {
      if (index === -1) {
        dataset.push(data);
      } else if (index === 0) {
        dataset.unshift(data);
      } else {
        dataset.splice(index, 0, data);
      }
    } else if (!dataset) {
      CoreIO.dedotify(this.properties, path, [data]);
    } else {
      log.error('Model.insert requires an array. Dataset isn\'t an array. Path: ', path);
      return;
    }

    if (options.silent !== true) {
      if (!options.noSync && typeof this.sync === 'function') {
        this.sync('insert', path, index, data);
      }

      this.emit('item.insert', path, index, data);
      this.emit('data.change', this.properties);
    }
  };

  /**
   * Remove a subset
   *
   * @method remove
   * @param {String} path path to subset
   * @param {Number} index Index of the subsut to remove
   * @param {Object} options Remove options
   *
   * @return {Object} removed subset
   */
  Model.prototype.remove = function (path, index, options) {
    var dataset = CoreIO.undotify(path, this.properties),
        removed = null;

    options = options || {};

    if (dataset instanceof Array) {
      removed = dataset.splice(index, 1);
    } else if (typeof dataset === 'object') {
      log.error('Model.remove requires an array. Dataset isn\'t an array. Path: ', path);
      return;
    }

    if (removed && options.silent !== true) {
      if (!options.noSync && typeof this.sync === 'function') {
        this.sync('remove', path, index);
      }

      this.emit('item.remove', path, index, removed[0]);
      this.emit('data.change', this.properties);
    }

    return removed;
  };

  /**
   * Replace all models data with new data. This is a alias for set(<AnyData>, {replace: true})
   *
   * @method replace
   * @param {Object} data Data object
   * @param {Object} options Option data. (See set method for details)
   */
  Model.prototype.replace = function (data, options) {
    options = options || {};
    options.replace = true;
    return this.set(data, options);
  };

  /**
   * Search an item in models properties
   *
   * @method search
   * @param {String} path Path to the parent property. We use dot notation to navigate to subproperties. (data.bla.blub) (Optional)
   * @param {Object} searchfor Searching for object
   * @return {Object} Returns the first matched item or null
   */
  Model.prototype.search = function (path, searchfor) {
    var parent;

    if (arguments.length === 1) {
      searchfor = path;
      path = '';
      parent = this.properties;
    } else if (!path) {
      parent = this.properties;
    } else {
      parent = CoreIO.undotify(path, this.properties);
    }

    if (parent) {
      for (var i = 0; i < parent.length; i++) {
        var prop = parent[i],
            matching;

        for (var p in searchfor) {
          if (searchfor.hasOwnProperty(p)) {
            if (prop[p] && prop[p] === searchfor[p]) {
              matching = true;
              break;
            } else {
              matching = false;
            }
          }
        }

        if (matching === true) {
          return prop;
        }
      }
    }

    return null;
  };

  /**
   * Updates a dataset
   * @development
   *
   * @method modify
   * @param {String} path Parent path
   * @param {Number|Object} match Search match or index to find the to be modifyd item
   * @param {Object} data Update date
   */
  Model.prototype.modify = function (path, match, data, options) {
    var item;

    options = options || {};

    if (typeof match === 'number') {
      item = this.get(path, match);
    } else {
      item = this.search(path, match);
    }

    var oldData = Object.assign({}, item);
    if (item) {
      Object.assign(item, data);

      if (options.silent !== true) {
        this.emit('data.modify', path, match, data, oldData);
        this.emit('data.change', this.properties);
      }

      if (!options.noSync && typeof this.sync === 'function') {
        this.sync('modify', path, match, data);
      }
    }
  };

  /**
   * Sort an array collection by a given attribute
   *
   * @method  sortBy
   * @param {String} path Path to the collection
   * @param {Object} sortKeys Sort by key
   *
   * sortKeys: {
   *   'key': 1 // Sort ascend by key,
   *   'second.key': -1 // Sort descand by second.key
   * }
   *
   * ascend, a -> z, 0 - > 9 (-1)
   * descend, z -> a, 9 -> 0 (1)
   *
   */
  Model.prototype.sortBy = function (path, sortKeys) {
    if (arguments.length === 1) {
      sortKeys = path;
      path = null;
    }

    var data = CoreIO.undotify(path, this.properties),
        order;

    if (!Array.isArray(data)) {
      log.warn('Could not sort data of type', typeof data);
      return [];
    }

    data.sort(function (a, b) {
      order = -1;
      for (var key in sortKeys) {
        if (sortKeys.hasOwnProperty(key)) {
          order = String(CoreIO.undotify(key, a)).localeCompare(String(CoreIO.undotify(key, b)));
          if (order === 0) {
            continue;
          } else if (sortKeys[key] === -1) {
            order = order > 0 ? -1 : 1;
          }

          break;
        }
      }

      return order;
    });

    this.set(path, data);
    return data;
  };

  /**
   * Filter an array collection by a given filter function
   *
   * @method filter
   * @param {String} path Path to the collection
   * @param {String | Function} filter Filter function
   *
   */
  Model.prototype.filter = function (path, property, query, fn) {
    if (arguments.length === 1) {
      fn = path;
      path = null;
    }

    if (typeof fn === 'string') {
      if (this.__registeredFilter[fn]) {
        fn = this.__registeredFilter[fn];
      } else {
        throw new Error('Filter ' + fn + ' not registered!');
      }
    }

    //We use a for i instead of Array.filter because it's faster!
    var data = CoreIO.undotify(path, this.__unfiltered.data || this.properties);
    var filtered = [];
    for (var i = 0, len = data.length; i < len; i++) {
      if (fn(property, query, data[i])) {
        filtered.push(data[i]);
      }
    }

    this.__unfiltered = {
      path: path,
      data: data
    };

    this.set(path, filtered);
    return filtered;
  };

  /**
   * Resets a filter
   * @method filterReset
   * @param {Object} options Set options
   */
  Model.prototype.filterReset = function (options) {
    if (this.__unfiltered) {
      this.set(this.__unfiltered.path, this.__unfiltered.data, options);
    }
  };

  /**
   * Validate model
   * @method validate
   * @param {Object} data Data to be validated
   * @param {Object} schema Schema
   * @returns {Object} Returns an object with failed validations or null if validation succeeds
   */
  Model.prototype.validate = function (data, schema) {
    var self = this,
        failed = [],
        subFailed;

    schema = schema || this.schema;

    if (schema) {
      Object.keys(schema).forEach(function (key) {
        // console.log('KEY', key);
        if (typeof schema[key] === 'object' && typeof schema[key].type === 'undefined') {
          if (schema[key].ref && schema[key].schema) {
            // console.log('Has a subref to %s', schema[key].ref);
            subFailed = self.validate(data, schema[key].schema);
            if (subFailed) {
              failed = failed.concat(subFailed);
            }
          } else {
            // console.log('SUBVAL');
            subFailed = self.validate(Object.assign({}, data[key]), Object.assign({}, schema[key]));
            // console.log('RES', subFailed);
            if (Array.isArray(subFailed) && subFailed.length > 0) {
              failed = failed.concat(subFailed);
            }
          }
          return;
        }

        var validationResult = self.validateOne(schema[key], data[key]);

        if (validationResult.isValid === true) {
          data[key] = validationResult.value;
        } else {
          validationResult.error.property = key;
          failed.push(validationResult.error);
        }
      });
    }

    if (failed.length === 0) {
      this.__isValid = true;
      this.lastValidationError = null;
      this.state('valid');
      return null;
    } else {
      this.__isValid = false;
      this.lastValidationError = failed;
      this.state('invalid');
      return failed;
    }
  };

  /**
   * Validate one property
   *
   * ValidatorResultItemObject
   * {
   *   isValid: Boolean,
   *   value: Any,
   *   error: Object
   * }
   *
   * @param  {Any} schema Schema for the check
   * @param  {Any} value Property value
   *
   * @return {Object}       Returns a ValidatorResultItemObject
   */
  Model.prototype.validateOne = function (schema, value, propName) {
    var failed, schemaType;

    if (schema.type === undefined) {
      if (!schema.ref) {
        throw new Error('No schema type are set!');
      }

      schemaType = 'ref';
    } else {
      schemaType = schema.type.toLowerCase();
    }

    if (value === '' && schema.noEmpty === true) {
      value = undefined;
    }

    if ((value === undefined || value === null || value === '') && schema['default']) {
      value = schema['default'];
    }

    if (value === undefined || value === null || value === '') {
      if (schema.required === true) {
        failed = {
          msg: 'Property is undefined or null, but it\'s required',
          errCode: 10
        };
      }
    } else {
      if (this.__registeredValidations[schemaType]) {
        failed = this.__registeredValidations[schemaType].call(this, value, schema);
      } else {
        throw new Error('Undefined schema type', schema);
      }
    }

    if (failed === undefined) {
      failed = {
        isValid: true,
        value: value,
        error: null
      };
    } else {
      failed = {
        isValid: false,
        value: value,
        error: failed
      };
    }

    return failed;
  };

  /**
   * Checks the validation of a property without changeing any states
   *
   * @method checkValidation
   * @param  {String}  key  Property name
   * @param {String} value Property value
   * @returns {Boolean} Returns true if validation had been passed
   */
  Model.prototype.checkValidation = function (key, value) {
    var check = this.validateOne(this.schema[key], value, key);
    return check.isValid;
  };

  /**
   * Returns the validation state of the model
   *
   * @method isValid
   * @returns {Boolean} Returns true when model data are valid. When no data was set it'll returns false
   */
  Model.prototype.isValid = function () {
    return this.__isValid;
  };

  /**
   * To be called when a form has been submited in a coupled model
   *
   * Model gets <i>submited</i> state when validation succeeds
   * If validation fails, model gets <i>invalid</i> state
   *
   * @deprecated
   * @method setData
   * @param {Object} data Form data
   */
  Model.prototype.setData = function (data, caller) {
    log.warn('Model.setData has been deprecated since v0.9');
    this.set(data, {
      extend: true
    });
  };

  /**
   * Register a filter function
   *
   * CoreIO.Model.registerFilter('myfilter', fn);
   * Registers a filter for all models
   *
   * instance.registerFilter('myfilter', fn);
   * Registers a filter for the instance only.
   *
   * @method registerFilter
   * @param {String} filterName [description]
   * @param {Function} filterFunction [description]
   */
  Model.registerFilter = function (filterName, filterFunction) {
    if (typeof filterFunction !== 'function') {
      throw new Error('Filter function isn\'t a function');
    }

    var obj = typeof this === 'function' ? Model.prototype : this;
    obj.__registeredFilter[filterName] = filterFunction;
  };

  /**
   * Alias for Model.registerFilter
   * @type {method}
   */
  Model.prototype.registerFilter = Model.registerFilter;

  /**
   * Holds registered filter
   * @type {Object}
   * @private
   */
  Model.prototype.__registeredFilter = {
    quicksearch: function quicksearch(property, query, item) {
      var value = CoreIO.undotify(property, item);
      var pat = new RegExp(query.replace(/[a-z0-9äüöß]/g, '$&.*'), 'i');
      return pat.test(value);
    }
  };

  /**
   * Register validation metods for all Models
   *
   * @method registerValidation
   * @static
   * @param {String} type Data type
   * @param {Function} fn Validation function
   */
  Model.registerValidation = function (type, fn) {
    var obj = typeof this === 'function' ? Model.prototype : this;
    obj.__registeredValidations[type] = fn;
  };

  /**
   * Register new validation method for currentyl instanciated model
   *
   * @method registerValidation
   * @param {String} type Data type
   * @param {Function} fn Validation function
   */
  Model.prototype.registerValidation = Model.registerValidation;

  /**
   * Stores registered validatiion functions
   * @type {Object}
   * @private
   */
  Model.prototype.__registeredValidations = {
    'string': function string(value, schema) {
      if (schema.convert && typeof value === 'number') {
        value = String(value);
      }

      if ('string' !== typeof value) {
        return {
          msg: 'Property type is a ' + typeof value + ', but a string is required',
          errCode: 11
        };
      } else if (schema.min && schema.min > value.length) {
        return {
          msg: 'String length is too short',
          errCode: 12
        };
      } else if (schema.max && schema.max < value.length) {
        return {
          msg: 'String length is too long',
          errCode: 13
        };
      } else if (schema.match && !schema.match.test(value)) {
        return {
          msg: 'String doesn\'t match regexp',
          errCode: 14
        };
      }
    },
    'number': function number(value, schema) {

      if (schema.convert && typeof value === 'string') {
        value = parseInt(value, 10);
      }

      if ('number' !== typeof value || isNaN(value)) {
        return {
          msg: 'Property type is not a valid number',
          errCode: 21
        };
      } else if (schema.min && schema.min > value) {
        return {
          msg: 'Number is too low',
          errCode: 22
        };
      } else if (schema.max && schema.max < value) {
        return {
          msg: 'Number is too high',
          errCode: 23
        };
      }
    },
    'date': function date(value, schema) {
      if (value) {
        var date = Date.parse(value);
        if (isNaN(date)) {
          return {
            msg: 'Property isn\'t a valid date',
            errCode: 31
          };
        }
      }
    },
    'array': function array(value, schema) {
      if (!Array.isArray(value)) {
        return {
          msg: 'Property type is a ' + typeof value + ', but an array is required',
          errCode: 41
        };
      } else if (schema.min && schema.min > value.length) {
        return {
          msg: 'Array length is ' + value.length + ' but must be greater than ' + schema.min,
          errCode: 42
        };
      } else if (schema.max && schema.max < value.length) {
        return {
          msg: 'Array length is ' + value.length + ' but must be lesser than ' + schema.max,
          errCode: 43
        };
      }
    },
    'object': function object(value, schema) {
      if (typeof value !== 'object') {
        return {
          msg: 'Property isn\'t a valid object',
          errCode: 51
        };
      }
    },
    'objectid': function objectid(value, schema) {
      if (!/^[a-zA-Z0-9]{24}$/.test(value)) {
        return {
          msg: 'Property isn\'t a valid objectId',
          errCode: 52
        };
      }
    },
    'boolean': function boolean(value, schema) {
      if (typeof value !== 'boolean') {
        return {
          msg: 'Property isn\'t a valid boolean',
          errCode: 61
        };
      }
    },

    /**
     * Validation type time
     *
     * Allowed values are:
     * HH:MM
     * HH:MM:SS
     * D:HH:MM:SS
     */
    'time': function time(value, schema) {
      if (!/^\d+(:\d{2}){1,3}$/.test(value)) {
        return {
          msg: 'Property isn\'t a valid time',
          errCode: 71
        };
      }
    },

    /**
     * Validation type email         *
     */
    'email': function email(value, schema) {
      if (!/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value)) {
        return {
          msg: 'Property isn\'t a valid email',
          errCode: 72
        };
      }
    }
  };

  Model.prototype.fetch = function () {
    var _this2 = this;

    if (this.__service) {
      log.info('Fetch data from model service');
      var args = Array.prototype.slice.call(arguments);
      return this.__service.findOne.apply(this.__service, args).then(function (data) {
        _this2.set(data, {
          noAutoSave: true
        });

        return data;
      });
    }

    return Promise.resolve(this.get());
  };

  /**
   * Save model data
   *
   * @method save
   *
   * @overwritable
   * @return {object} Returns a promise
   */
  Model.prototype.save = function (forceCreate) {
    if (!this.__service) {
      return Promise.resolve({
        id: this.get('id')
      });
    }

    var data = this.get({
      copy: true
    });

    if (data.id && !forceCreate) {
      return this.__service.update(data.id, data);
    } else {
      return this.__service.insert(data);
    }
  };

  /**
   * Delete model data
   *
   * @method delete
   *
   * @overwritable
   * @return {object} Returns a promise
   */
  Model.prototype.delete = function () {
    if (!this.__service) {
      var id = this.get('id');
      this.properties = {};
      return Promise.resolve({
        id: id
      });
    }

    return this.__service.delete(this.get('id'));
  };

  /**
   * Returns model as JSON
   * @method toJSON
   * @return {Object} Returns model data as JSON
   */
  Model.prototype.toJSON = function () {
    return this.get();
  };

  /**
   * Returns model data as a stringified JSON
   * @method stringify
   *
   * @param {boolean} pretty Enable pretty print
   * @return {Object} Returns model data as JSON
   */
  Model.prototype.stringify = function (pretty) {
    return JSON.stringify(this.get(), null, pretty === true ? '  ' : pretty);
  };

  //--

  return Model;
};