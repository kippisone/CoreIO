const inspect = require('inspect.js')
const sinon = require('sinon')
const testberry = require('testberry')
const apiInspect = require('api-inspect');
inspect.useSinon(sinon)

const CoreIO = require('../../')

describe('/ping', () => {
  describe('benchmarks', () => {
    before(() => {
      const router = CoreIO.api('/ping', {
        noServer: true,
        get() {
          return ''
        }
      })

      apiInspect.setApi(router.app)
    })

    it('for a single call', (testDone) => {
      testberry.test('single call to /ping', (done) => {
        apiInspect.get('/ping').test((ctx) => {
          ctx.statusCode(204)
          done()
          testDone()
        })
      })
    })
  })
})
