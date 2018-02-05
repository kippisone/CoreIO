const inspect = require('inspect.js')
const CoreIO = require('../../')

describe.only('Config', () => {
  describe('class', () => {
    it('should be a class', () => {
      inspect(CoreIO.Config).isClass()
    })

    it('has a getConfig method', () => {
      const config = new CoreIO.Config()
      inspect(config).hasMethod('getConfig')
    })

    it('has a setConfig method', () => {
      const config = new CoreIO.Config()
      inspect(config).hasMethod('setConfig')
    })

    it('should set a defaultConfig', () => {
      const conf = {
        server: {
          host: 'http://localhost',
          port: 1328
        }
      }

      const config = new CoreIO.Config(conf)

      inspect(config.__config).isObject()
      inspect(config.__config).isEql(conf)
    })
  })

  describe('setConfig()', () => {
    it('should set a config', () => {
      const conf = {
        server: {
          host: 'http://localhost',
          port: 1328
        }
      }

      const config = new CoreIO.Config()
      config.setConfig(conf)

      inspect(config.__config).isObject()
      inspect(config.__config).isEql(conf)
    })

    it('should extend a config', () => {
      const config = new CoreIO.Config()
      config.setConfig({
        server: {
          host: 'http://localhost',
          port: 1328
        }
      })

      config.setConfig({
        server: {
          host: '127.0.0.1',
          debug: false
        }
      })

      inspect(config.__config).isObject()
      inspect(config.__config).isEql({
        server: {
          host: '127.0.0.1',
          port: 1328,
          debug: false
        }
      })
    })

    it('should overwrite second level', () => {
      const config = new CoreIO.Config()
      config.setConfig({
        server: {
          host: {
            url: 'http://localhost',
            method: 'GET'
          },
          port: 1328
        }
      })

      config.setConfig({
        server: {
          host: {
            ip: '127.0.0.1'
          },
          debug: false
        }
      })

      inspect(config.__config).isObject()
      inspect(config.__config).isEql({
        server: {
          host: {
            ip: '127.0.0.1'
          },
          port: 1328,
          debug: false
        }
      })
    })

    it('should overwrite second level with a strinf item', () => {
      const config = new CoreIO.Config()
      config.setConfig({
        server: {
          host: {
            url: 'http://localhost',
            method: 'GET'
          },
          port: 1328
        }
      })

      config.setConfig({
        server: {
          host: '127.0.0.1',
          debug: false
        }
      })

      inspect(config.__config).isObject()
      inspect(config.__config).isEql({
        server: {
          host: '127.0.0.1',
          port: 1328,
          debug: false
        }
      })
    })
  })

  describe('getConfig()', () => {
    let config

    beforeEach(() => {
      const conf = {
        host: {
          url: 'http://localhost',
          method: 'GET'
        },
        port: 1328
      }

      config = new CoreIO.Config()
      config.setConfig(conf)
    })

    it('return config', () => {
      const conf = config.getConfig()
      inspect(conf).isEql({
        host: {
          url: 'http://localhost',
          method: 'GET'
        },
        port: 1328
      })
    })

    it('returns a config item', () => {
      const conf = config.getConfig('host')
      inspect(conf).isEql({
        url: 'http://localhost',
        method: 'GET'
      })
    })

    it('returns a deep config item', () => {
      const conf = config.getConfig('host.url')
      inspect(conf).isEql('http://localhost')
    })

    it('handles not existing configs', () => {
      const conf = config.getConfig('host.secret')
      inspect(conf).isNull()
    })

    it('returns default values it key doesn\'t exists', () => {
      const conf = config.getConfig('host.secret', '****')
      inspect(conf).isEql('****')
    })
  })
})
