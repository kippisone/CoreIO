const inspect = require('inspect.js')
const sinon = require('sinon')
inspect.useSinon(sinon)

const testArr = require('./errorConf')

testArr.forEach((test) => {
  describe.only(test.name, () => {
    const err = new test.ErrorClass(test.error)

    describe('class', () => {
      it(`creates an instance of ${test.name}`, () => {
        inspect(err).isInstanceOf(Error)
        inspect(err).isInstanceOf(test.ErrorClass)
      })

      it(`has status code ${test.status}`, () => {
        inspect(err).hasKey('status')
        inspect(err.status).isEql(test.status)
      })

      it(`has a toJSON method`, () => {
        inspect(err).hasMethod('toJSON')
      })

      it(`has a toString method`, () => {
        inspect(err).hasMethod('toString')
      })
    })

    describe('toJSON', () => {
      it('returns a JSON object', () => {
        inspect(err.toJSON()).isEql({
          status: test.status,
          type: test.name,
          message: test.message
        })
      })
    })

    describe('toString', () => {
      it('returns a string message', () => {
        inspect(err.toString()).isEql(
          `${test.status} ${test.message}`
        )
      })
    })
  })
})
