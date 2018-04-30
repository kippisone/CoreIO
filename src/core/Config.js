const superconf = require('superconf')
const Utils = require('./Utils')

class Config {
  constructor (defaultConf) {
    this.__config = {}
    if (defaultConf) {
      this.setConfig(defaultConf)
    }
  }

  setConfig (...args) {
    let obj

    if (args.length === 2) {
      obj = Utils.dedotify({}, args[0], args[1])
    } else {
      obj = args[0]
    }

    this.__config = superconf.config({
      dept: 1
    }).merge(this.__config, obj)
  }

  getConfig (key, defaultValue) {
    if (!key) {
      return this.__config || defaultValue
    }

    return Utils.undotify(key, this.__config) || defaultValue || null
  }
}

module.exports = Config
