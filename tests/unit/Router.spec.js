
'use strict'

const inspect = require('inspect.js')
const sinon = require('sinon')
const apiInspect = require('api-inspect')
inspect.useSinon(sinon)

const CoreIO = require('../../')

const log = require('logtopus').getLogger('coreio')
log.setLevel('error')

describe('Router', () => {
  describe('class', () => {
    it.skip('should be a class', () => {
      inspect(CoreIO.Router).isClass()
    })
  })

  describe('instance', () => {
    it('has an app and server object', () => {
      const router = new CoreIO.Router({
        noServer: true
      })

      inspect(router).isInstanceOf(CoreIO.Router)
      inspect(router).hasKeys(['app', 'server'])
    })
  })

  describe('registerRoutes', () => {
    let router;

    beforeEach(() => {
      router = new CoreIO.Router({
        noServer: true
      })

      apiInspect.setApi(router.app)
    })

    it('registers a get route', () => {
      const getStub = sinon.stub();
      getStub.returns(Promise.resolve({ foo: 'bar' }));
      router.registerRoutes({
        get: getStub,
        slug: '/foo'
      });

      inspect(router).isObject()

      return apiInspect.get('/foo').test((ctx) => {
        ctx.statusCode(200)
        ctx.contentType('application/json')
        ctx.responseTime(50)
      })
    });

    it('registers a post route', () => {
      const postStub = sinon.stub();
      postStub.returns(Promise.resolve({ foo: 'bar' }));
      router.registerRoutes({
        post: postStub,
        slug: '/foo'
      });

      inspect(router).isObject();

      return apiInspect.post('/foo', { bla: 'blubb' }).test((ctx) => {
        ctx.statusCode(200);
        ctx.contentType('application/json');
        ctx.responseTime(50);

        inspect(ctx.data).isEql({ bla: 'blubb' });
        inspect(ctx.body).isEql({ foo: 'bar' });
      });
    });

    it('registers a put route', () => {
      const putStub = sinon.stub();
      putStub.returns(Promise.resolve({ foo: 'bar' }));
      router.registerRoutes({
        put: putStub,
        slug: '/foo'
      });

      inspect(router).isObject();

      return apiInspect.put('/foo', { bla: 'blubb' }).test((ctx) => {
        ctx.statusCode(200);
        ctx.contentType('application/json');
        ctx.responseTime(50);

        inspect(ctx.data).isEql({ bla: 'blubb' });
        inspect(ctx.body).isEql({ foo: 'bar' });
      });
    });

    it('registers a patch route', () => {
      const patchStub = sinon.stub();
      patchStub.returns(Promise.resolve({ id: 1328 }));
      router.registerRoutes({
        patch: patchStub,
        slug: '/foo'
      });

      inspect(router).isObject();

      return apiInspect.patch('/foo', { bla: 'blubb' }).test((ctx) => {
        ctx.statusCode(200);
        ctx.contentType('application/json');
        ctx.responseTime(50);

        inspect(ctx.data).isEql({ bla: 'blubb' });
        inspect(ctx.body).isEql({ id: 1328 });
      });
    });

    it('registers a delete route', () => {
      const deleteStub = sinon.stub();
      deleteStub.returns(Promise.resolve({ id: 1328 }));
      router.registerRoutes({
        delete: deleteStub,
        slug: '/foo'
      });

      inspect(router).isObject();

      return apiInspect.delete('/foo', { bla: 'blubb' }).test((ctx) => {
        ctx.statusCode(200);
        ctx.contentType('application/json');
        ctx.responseTime(50);

        inspect(ctx.query).isEql({ bla: 'blubb' });
        inspect(ctx.body).isEql({ id: 1328 });
      });
    });
  })

  describe('createConfig', () => {
    let TestModel;
    let TestList;

    before(() => {
      TestModel = CoreIO.createModel('test', {
        defaults: {
          id: 1328,
          foo: 'bar'
        }
      });

      TestList = CoreIO.createList('test', {
        defaults: [{
          id: 1328,
          foo: 'bar'
        }]
      });
    });

    it('create a route conf from model', () => {
      const conf = {
        slug: '/test',
        model: TestModel,
        allow: ['READ', 'CREATE', 'UPDATE', 'DELETE']
      };

      const router = new CoreIO.Router();
      inspect(router.createConfig(conf)).isEql([{
        slug: '/test/:id',
        get: inspect.match.func
      }, {
        slug: '/test',
        post: inspect.match.func
      }, {
        slug: '/test/:id',
        put: inspect.match.func
      }, {
        slug: '/test/:id',
        patch: inspect.match.func
      },{
        slug: '/test/:id',
        delete: inspect.match.func
      }]);
    });

    it('create a route conf from list', () => {
     const conf = {
       slug: '/test',
       list: TestList,
       allow: ['READ']
     };

     const router = new CoreIO.Router();
     inspect(router.createConfig(conf)).isEql([{
       slug: '/test',
       get: inspect.match.func
     }]);
    });

    it('create a route conf with list and modle', () => {
     const conf = {
       slug: '/test',
       model: TestModel,
       list: TestList,
       allow: ['READ']
     };

     const router = new CoreIO.Router();
     inspect(router.createConfig(conf)).isEql([{
       slug: '/test/:id',
       get: inspect.match.func
     }, {
      slug: '/test',
      get: inspect.match.func
     }]);
    });
  });

  describe('model', () => {
    let TestModel
    let TestList
    let router

    beforeEach(() => {
      TestModel = CoreIO.createModel('test', {
        defaults: {
          id: 1328,
          foo: 'bar'
        }
      })

      TestList = CoreIO.createList('test', {
        defaults: [{
          id: 1328,
          foo: 'bar'
        }, {
          id: 1329,
          foo: 'bla'
        }, {
          id: 1330,
          foo: 'blub'
        }]
      })

      router = new CoreIO.Router({
        noServer: true
      })

      apiInspect.setApi(router.app)

      router.resetRoutes()
    })

    afterEach(() => {
      router.resetRoutes()
    })

    it('registers a model get route', () => {
      router.registerRoutes({
        model: TestModel,
        slug: '/test'
      })

      inspect(router).isObject()

      return apiInspect.get('/test/1328').test((ctx) => {
        ctx.statusCode(200)
        ctx.contentType('application/json')
        ctx.responseTime(50)
        inspect(ctx.body).isEql({
          id: 1328,
          foo: 'bar'
        })
      })
    })

    it('registers a model post route', () => {
      router.registerRoutes({
        model: TestModel,
        slug: '/test',
        allow: ['CREATE']
      });

      inspect(router).isObject();

      return apiInspect.post('/test', { bla: 'blubb' }).test((ctx) => {
        ctx.statusCode(200);
        ctx.contentType('application/json');
        ctx.responseTime(50);
        inspect(ctx.body).isEql({
          id: 1328
        });

        inspect(ctx.data).isEql({
          bla: 'blubb'
        });
      });
    });

    it('registers a model put route', () => {
      router.registerRoutes({
        model: TestModel,
        slug: '/test',
        allow: ['UPDATE']
      });

      inspect(router).isObject();

      return apiInspect.put('/test/1328', { bla: 'blubb' }).test((ctx) => {
        ctx.statusCode(200);
        ctx.contentType('application/json');
        ctx.responseTime(50);

        inspect(ctx.data).isEql({ bla: 'blubb' });
        inspect(ctx.body).isEql({ id: 1328 });
      });
    });

    it('registers a model patch route', () => {
      router.registerRoutes({
        model: TestModel,
        slug: '/test',
        allow: ['UPDATE']
      });

      inspect(router).isObject();

      return apiInspect.patch('/test/1328', { bla: 'blubb' }).test((ctx) => {
        ctx.statusCode(200);
        ctx.contentType('application/json');
        ctx.responseTime(50);

        inspect(ctx.data).isEql({ bla: 'blubb' });
        inspect(ctx.body).isEql({ id: 1328 });
      });
    });

    it('registers a model delete route', () => {
      router.registerRoutes({
        model: TestModel,
        slug: '/test',
        allow: ['DELETE']
      });

      inspect(router).isObject();

      return apiInspect.delete('/test/1328').test((ctx) => {
        ctx.statusCode(200);
        ctx.contentType('application/json');
        ctx.responseTime(50);

        inspect(ctx.body).isEql({ id: 1328 });
      });
    });

    it('registers a list get route', () => {
      router.registerRoutes({
        list: TestList,
        slug: '/test'
      })

      inspect(router).isObject();

      return apiInspect.get('/test').test((ctx) => {
        ctx.statusCode(200);
        ctx.contentType('application/json');
        ctx.responseTime(50);
        inspect(ctx.body).isEql([{
          id: 1328,
          foo: 'bar'
        }, {
          id: 1329,
          foo: 'bla'
        }, {
          id: 1330,
          foo: 'blub'
        }]);
      });
    });
  })
})
