/**
 * Extends CoreIO with some usefull functions
 *
 * @module  CoreIO.Utils
 */
'use strict';

function Utils(CoreIO) {
  CoreIO.undotify = function(path, obj) {
    if(path) {
      path = path.split('.');
      path.forEach(function(key) {
        obj = obj ? obj[key] : undefined;
      });
    }

    return obj;
  };

  /**
   * Creates a object from an dotified key and a value
   *
   * @public
   * @method dedotify
   *
   * @param {Object} obj Add new value to obj. This param is optional.
   * @param {String} key The dotified key
   * @param {Any} value The value
   *
   * @returns {Object} Returns the extended object if obj was set otherwis a new object will be returned
   */
  CoreIO.dedotify = function(obj, key, value) {
    if (typeof obj === 'string') {
      value = key;
      key = obj;
      obj = {};
    }

    var newObj = obj;

    if(key) {
      key = key.split('.');
      var len = key.length;
      key.forEach(function(k, i) {
        if (i === len - 1) {
          if (/\[\]$/.test(k)) {
            k = k.substr(0, k.length - 2);
            if (!obj[k]) {
              obj[k] = [];
            }
            obj[k].push(value);
            return;
          }

          obj[k] = value;
          return;
        }

        if (!obj[k]) {
          obj[k] = {};
        }

        obj = obj[k];
      });
    }

    obj = value;

    return newObj;
  };

  /**
   * Creates a unique id
   *
   * @param {Number} len (Optional) String length. Defaults to 7
   * @returns {String} Unique string
   */
  CoreIO.uid = function(len) {
    len = len || 7;
    var str = '';

    while (str.length < len) {
      var part = Math.random().toString(36).substr(2);
      str += part;
    }

    return str.substr(0, len);
  };

  /**
   * Returns a promise object
   *
   * the returning object has two extra methods
   *
   * `resolve` to resolv the promise
   * `reject` to reject the promise
   *
   * If callback is set it will be called, when promise will be resolved or rejected.
   * Gets the reject data as first argument and the resolve data as second argument
   *
   * @example {js}
   * var promise = CoreIO.promise();
   * promise.then(function() {
   *     console.log('Resolve');
   * });
   *
   * setTimeout(function() {
   *     promise.resolve();
   * }, 100);
   *
   * @method promise
   * @param  {Function} [callback] Callback function, to be called on resolv or rejecting the promise
   * @return {Object} Returns a promise object
   */
  CoreIO.promise = function(callback) {

    var s, r;
    var promise = new CoreIO.Promise(function(resolve, reject) {
      s = resolve;
      r = reject;
    });

    promise.resolve = function(data) {
      s(data);
      if (typeof callback === 'function') {
        callback(null, data);
      }

      return promise;
    };

    promise.reject = function(data) {
      r(data);
      if (typeof callback === 'function') {
        callback(data);
      }

      return promise;
    };

    var chain = [];

    promise.push = function(fn) {
      if (typeof fn !== 'function') {
        throw new Error('Could not create a promise chain! First arg is not a function in promise.push().');
      }

      chain.push(fn);
      return this;
    };

    promise.each = function(data) {
      var p = chain.shift();
      if (!p) {
        promise.resolve(data);
        return;
      }

      p(data).then(function(data) {
        promise.each(data);
      }).catch(function(err) {
        promise.reject(err);
      });

      return promise;
    };

    return promise;
  };

  CoreIO.isEmptyObject = function(obj) {
    //jshint forin: false
    var name;
    for ( name in obj ) {
      return false;
    }
    return true;
  };

  CoreIO.isFunction = function(fn) {
    return typeof fn === 'function';
  };

  /**
  * Checks wether an object is an empty object or an empty array
  * @param  {Object|Array}  obj Object which should be checked
  * @return {Boolean}     Returns true if obj is empty
  */
  CoreIO.isEmpty = function(obj) {
    if (Array.isArray(obj)) {
      return obj.length === 0;
    }

    return CoreIO.isEmptyObj(obj);
  }
}

module.exports = Utils
