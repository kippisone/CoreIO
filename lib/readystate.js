'use strict';

/**
 * XQCore.ReadyState module
 *
 * Holds a function call until a state becomes ready
 *
 * @module XQCore.ReadyState
 */

module.exports = function () {
  let ReadyState = function () {
    this.__isReady = false;
    this.__readyFuncs = [];
  };

  /**
   * Wait till view is ready
   *
   * @method ready
   * @param {Function} fn FUnction to be called if state becomes ready
   */
  ReadyState.prototype.ready = function (fn) {
    if (this.__isReady) {
      return fn.call(this);
    } else {
      this.__readyFuncs.push(fn);
    }
  };

  /**
   * Sets a state ready and calls all retained functions
   *
   * @method setReady
   */
  ReadyState.prototype.setReady = function () {
    this.__isReady = true;

    if (this.__readyFuncs) {
      this.__readyFuncs.forEach(fn => {
        fn.call(this);
      });
      this.__readyFuncs = [];
    }
  };

  /**
   * Unsets a ready state
   *
   * @method unsetReady
   */
  ReadyState.prototype.unsetReady = function () {
    this.__isReady = false;
  };

  //--

  return ReadyState;
};