'use strict';

/**
 * CoreIO List
 *
 * The list module is a list of models. Each dataset in a list is an instance of a CoreIO.Model
 *
 * @module  CoreIO.List
 * @requires CoreIO.Event
 * @requires CoreIO.Logger
 * @example
 *
 * var Model = CoreIO.Model.inherit({
 *     schema: {
 *         title: { type: 'string', min: 3, max 100 },
 *         content: { type: 'string', min: 3, max 1000 }
 *     }
 * });
 *
 * var list new CoreIO.List('myList', function(self) { {
 *     self.model = Model
 * }});
 *
 * list.push({
 *     title: 'Item 1',
 *     content: 'This is my first list item'
 * });
 *
 */
module.exports = function(CoreIO) {
  let log = require('logtopus').getLogger('coreio');

  /**
   * CoreIO.List base class
   *
   * @class CoreIO.List
   * @constructor
   *
   * @uses CoreIO.Logger
   * @uses CoreIO.Event
   *
   * @param {Object} conf List extend object
   */
  var List = function(name, conf) {
    //Call Event constructor
    CoreIO.Event.call(this);

    var self = this;

    if (typeof arguments[0] === 'object') {
      conf = name;
      name = conf.name;
    }

    /**
     * Enable debug mode
     * @public
     * @type {Boolean}
     */
    this.debug = CoreIO.debug;

    if (conf === undefined) {
      conf = {};
    }

    this.__unfiltered = {};

    /**
     * List name
     * @property {String} name
     */
    this.name = (name ? name.replace(/List$/, '') : 'Nameless') + 'List';

    /**
     * Contains list items
     * @property {Array} items
     */
    this.items = [];

    /**
     * Sets a maxlength of items
     * @property {Number} maxlength
     * @default null
     */
    this.maxLength = null;

    /**
     * Sets the Model to be used to create new models in push and unshift methods.
     * @property {Object} model
     */
    if (!this.model) {
      this.model = CoreIO.Model;
    }

    /*!
     * Mapping of initial conf
     */
    if (typeof conf === 'function') {
      conf.call(this, self);
    }
    else {
      Object.assign(this, conf);
    }

    /**
     * Sets default values
     * @property {Object|Array} defaults
     */
    if (this.defaults && !CoreIO.isEmpty(this.defaults)) {
      this.push(this.defaults, {
        silent: true,
        noValidation: true
      });
    }

    this.state('ready');
  };

  Object.assign(List.prototype, CoreIO.Event.prototype);

  /**
   * Inherits a list prototype
   * @method inherit
   * @param  {String} name    list name
   * @param  {Object} options Model properties
   * @return {Object}         Returns a CoreIO.Model prototype
   */
  List.inherit = function(name, options) {
    if (typeof name === 'object') {
      options = name;
      name = undefined;
    }

    var Proto = function() {
      CoreIO.List.call(this, name, options);
    };

    Proto.prototype = Object.create(CoreIO.List.prototype);
    Proto.prototype.constructor = Proto;
    return Proto;
  };

  /**
   * Contains the length of the list
   * @property length
   * @type {Number}
   */
  Object.defineProperty(List.prototype, 'length', {
    get: function() {
      return this.items.length;
    }
  });

  /**
   * Change the list state
   *
   * @method state
   * @param {String} state New state
   */
  List.prototype.state = function(state) {
    this.__state = state;
    this.emit('state.' + state);
    this.emit('state.change', state);
  };

  /**
   * Get the current list state
   *
   * @method getState
   */
  List.prototype.getState = function() {
    return this.__state;
  };

  /**
   * Adds one ore more items to the end of a list.
   * You can pass a CoreIO.Model or a plain data object.
   * A data object will be converted into a CoreIO.Model.
   * The model must be valid to be added to the list.
   *
   * @param {Object|Array} data Model instance or a plain data object. Add multiple models by using an array of items
   * @param {Object} options Options object
   * {
   *     silent: true,    //Disable event emitting
   *     noSync: true     //Don't call sync method
   * }
   *
   * @returns {Boolean} Returns true if validation was succesfully and all items were added
   */
  List.prototype.push = function(data, options) {
    var models = [],
      model,
      item;

    options = options || {};

    if (!Array.isArray(data)) {
      data = [data];
    }

    for (var i = 0, len = data.length; i < len; i++) {
      item = data[i];

      if (item instanceof CoreIO.Model) {
        model = item;
      }
      else {
        model = new this.model('ListItem');
        model.set(item, {
          noSync: true,
          silent: true
        });
      }

      if (model.isValid()) {
        models.push(model);
      }
      else {
        return false;
      }
    }

    //No validation error has been ocured.
    var length = this.items.push.apply(this.items, models);

    if (length) {
      if (this.maxLength && this.items.length > this.maxLength) {
        this.items.splice(0, this.items.length - this.maxLength);
      }

      if (!options.silent) {
        this.emit('item.push', models, length);
      }

      if (!options.noSync) {
        if (typeof this.sync === 'function') {
          this.sync('push', models);
        }
      }
    }

    return true;
  };

  /**
   * Adds one ore more items to the beginning of a list.
   * You can pass a CoreIO.Model or a plain data object.
   * A data object will be converted into a CoreIO.Model.
   * The model must be valid to be added to the list.
   *
   * @param {Object|Array} data Model instance or a plain data object. Add multiple models by using an array of items
   * @param {Object} options Options object
   * {
   *     silent: true,    //Disable event emitting
   *     noSync: true     //Don't call sync method
   * }
   * @returns {Boolean} Returns true if validation was succesfully and all items were added
   */
  List.prototype.unshift = function(data, options) {
    var models = [],
      model,
      item;

    options = options || {};

    if (!Array.isArray(data)) {
      data = [data];
    }

    for (var i = 0, len = data.length; i < len; i++) {
      item = data[i];

      if (item instanceof CoreIO.Model) {
        model = item;
      }
      else {
        model = new this.model('ListItem');
        model.set(item, {
          noSync: true,
          silent: true
        });
      }

      if (model.isValid()) {
        models.unshift(model);
      }
      else {
        return false;
      }
    }

    //No validation error has been ocured.
    var length = this.items.unshift.apply(this.items, models);

    if (length) {
      if (this.maxLength && this.items.length > this.maxLength) {
        this.items.splice(this.maxLength);
      }

      if (!options.silent) {
        this.emit('item.unshift', models, length);
      }

      if (!options.noSync) {
        if (typeof this.sync === 'function') {
          this.sync('unshift', models);
        }
      }
    }

    return true;
  };

  /**
   * Removes the last item from a list and returns it.
   *
   * @event item.remove Emits an item.remove event. The removed item will be passed as the first argument
   *
   * @param {Object} options Options object
   * {
   *     silent: true,    //Disable event emitting
   *     noSync: true     //Don't call sync method
   * }
   *
   * @returns {Object} Returns the removed item
   */
  List.prototype.pop = function(options) {
    var model;

    options = options || {};

    model = this.items.pop() || null;
    if (model === undefined) {
      return null;
    }

    if (!options.silent) {
      this.emit('item.pop', model);
    }

    if (!options.noSync) {
      if (typeof this.sync === 'function') {
        this.sync('pop', model);
      }
    }

    return model;
  };

  /**
   * Removes the first item from a list and returns it.
   *
   * @event item.shift Emits an item.shift event. The removed item will be passed as the first argument
   *
   * @param {Object} options Options object
   * {
   *     silent: true,    //Disable event emitting
   *     noSync: true     //Don't call sync method
   * }
   *
   * @returns {Object} Returns the removed item
   */
  List.prototype.shift = function(options) {
    var model;

    options = options || {};

    model = this.items.shift() || null;
    if (model === undefined) {
      return null;
    }

    if (!options.silent) {
      this.emit('item.shift', model);
    }

    if (!options.noSync) {
      if (typeof this.sync === 'function') {
        this.sync('shift', model);
      }
    }

    return model;
  };

  /**
   * Updates a list item or pushs it to the end
   * You can pass a CoreIO.Model or a plain data object.
   * A data object will be converted into a CoreIO.Model.
   * The model must be valid to be added to the list.
   *
   * @param {Object|Number} match Match to find element which should be updated
   * @param {Object} data Model instance or a plain data object.
   * @param {Object} options Options object
   * {
   *     silent: true,    //Disable event emitting
   *     noSync: true     //Don't call sync method
   * }
   *
   * @fires item.update
   * Fires an item.update event if item was succesfully updated. Othwewise fires an item.push event
   *
   * @returns {Object} Returns the updated item
   */
  List.prototype.update = function(match, data, options) {
    options = options || {};

    var updateItem;
    if (typeof match === 'number') {

      updateItem = this.items[match];
    }
    else {
      updateItem = this.findOne(match);
    }

    if (updateItem) {
      updateItem.set(data, { noSync: true, silent: true });

      if (!options.silent) {
        this.emit('item.update', updateItem);
      }

      if (!options.noSync) {
        if (typeof this.sync === 'function') {
          this.sync('update', match, data);
        }
      }
    }

    return updateItem;
  };

  /**
   * Removes an item at a given position
   *
   * @param {Object|Number} match Match to find element which should be removed
   * @param {Object} options Options object
   * {
   *     silent: true,    //Disable event emitting
   *     noSync: true     //Don't call sync method
   * }
   *
   * @fires item.remove
   * Fires an item.remove event if item was succesfully removed.
   *
   * @returns {Object} Returns the removed item
   */
  List.prototype.remove = function(match, options) {
    options = options || {};

    var removedItem,
      index = 0;
    if (typeof match === 'number') {
      removedItem = this.items[match];
      index = match;
    }
    else {
      removedItem = this.findOne(match);
      for (var i = 0, len = this.items.length; i < len; i++) {
        if (this.items[i] === removedItem) {
          index = i;
          break;
        }
      }
    }

    if (removedItem) {
      this.items.splice(index, 1);

      if (!options.silent) {
        this.emit('item.remove', removedItem, index);
      }

      if (!options.noSync) {
        if (typeof this.sync === 'function') {
          this.sync('remove', match, index);
        }
      }
    }

    return removedItem;
  };

  /**
   * Clears the whole list
   * @param  {Object} options Options object
   * {
   *     silent: true,    //Disable event emitting
   *     noSync: true     //Don't call sync method
   * }
   *
   * @fires item.clear
   * Fires an item.clear event if item was succesfully cleared. It will not fire any events on an empty list
   *
   * @returns {Number} Returns the amount of removed items
   */
  List.prototype.clear = function(options) {
    options = options || {};

    if (this.items.length === 0) {
      return 0;
    }

    var oldValue = this.toArray();

    this.items = [];

    if (!options.silent) {
      this.emit('item.clear', oldValue);
    }

    if (!options.noSync) {
      if (typeof this.sync === 'function') {
        this.sync('clear', oldValue);
      }
    }

    return oldValue.length;
  };

  /**
   * Returns list items as an array
   * @method toArray
   * @return {Array} Returns an array of list items
   */
  List.prototype.toArray = function() {
    return this.items.map(function(model) {
      return model.properties;
    });
  };

  /**
   * Compatibility, does the same as toArray()
   * @method toJSON
   * @return {Array} Returns an array of list items
   */
  List.prototype.toJSON = function() {
    return this.toArray();
  };

  /**
   * Search through list items and returns the first matching item
   *
   * @method findOne
   * @param {Object} searchfor Searching for object
   * @return {Object} Returns the first matched item or null. The returning item is a CoreIO.Model object
   */
  List.prototype.findOne = function(query) {
    var parent;

    parent = this.items;

    if (parent) {
      for (var i = 0; i < parent.length; i++) {
        var prop = parent[i],
          matching;

        for (var p in query) {
          if (query.hasOwnProperty(p)) {
            if (prop.properties[p] && prop.properties[p] === query[p]) {
              matching = true;
              break;
            }
            else {
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
   * Search through list items and returns all matching items
   *
   * @method find
   * @param {Object} searchfor Searching for object
   * @return {Object} Returns all matched item or an empty array.
   * The returning value is an array of CoreIO.Model objects
   */
  List.prototype.find = function(query) {
    var parent,
      res = [];

    parent = this.items;

    if (parent) {
      for (var i = 0; i < parent.length; i++) {
        var prop = parent[i],
          matching;

        for (var p in query) {
          if (query.hasOwnProperty(p)) {
            if (prop.properties[p] && prop.properties[p] === query[p]) {
              matching = true;
              break;
            }
            else {
              matching = false;
            }
          }
        }

        if (matching === true) {
          res.push(prop);
        }

      }
    }

    return res;
  };

  /**
   * Calls a function on each item.
   * Optionally traverse the `initial` object through all methods and returns it at the end.
   *
   * @method each
   * @param  {Object}   initial Object which will be traversed and returned at the end
   * @param  {Function} fn      Funtion to be called on each item. Gets the model as first arg and the traversing object as second arg.
   * @returns {Object}          Returns a traversed object
   */
  List.prototype.each = function(initial, fn) {
    if (fn === undefined || fn === null) {
      fn = initial;
      initial = {};
    }

    var data = initial;
    var result = [];
    for (var i = 0, len = this.items.length; i < len; i++) {
      var res = fn(this.items[i], data);
      result.push(res);
    }

    return result;
  };

  //--

  return List;
};
