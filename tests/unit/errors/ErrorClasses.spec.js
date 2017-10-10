const inspect = require('inspect.js')
const sinon = require('sinon')
inspect.useSinon(sinon)

const testArr = require('./errorConf')

testArr.forEach((test) => {
  describe(test.name, () => {
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

      it('returns an extended JSON object if level is set to 2', () => {
        inspect(err.toJSON(2)).isEql({
          status: test.status,
          type: test.name,
          message: test.message,
          error: test.error
        })
      })

      it('returns an extended JSON object with stack trace if level is set to 3', () => {
        inspect(err.toJSON(3)).isEql({
          status: test.status,
          type: test.name,
          message: test.message,
          error: test.error,
          stack: inspect.match.str
        })

        const extendedError = err.toJSON(3)
        inspect(extendedError.stack).doesContain(`${test.status} ${test.message}`)
      })
    })

    describe('toString', () => {
      it('returns a string message', () => {
        inspect(err.toString()).isEql(
          `${test.status} ${test.message}`
        )
      })

      it('returns an extended string message', () => {
        inspect(err.toString(2)).isEql(
          `${test.status} ${test.message}\n\n${test.error}`
        )
      })

      it('returns an extended string message with stacktrace', () => {
        inspect(err.toString(3)).doesContain(
          `${test.status} ${test.message}\n\n${test.error}\n\n${test.status} ${test.message}`
        )
      })
    })
  })
})
