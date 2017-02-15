'use strict';

const inspect = require('inspect.js');
const apiInspect = require('api-inspect');
const sinon = require('sinon');
inspect.useSinon(sinon);

const CoreIO = require('../lib/coreio');
CoreIO.logLevel = 'error';
const Router = CoreIO.Router;

apiInspect.setApi(Router.connect({
  noServer: true
}));

describe.only('Router', () => {
  describe('class', () => {
    it('is a Router class', () => {
      inspect(new Router()).isInstanceOf(Router);
    });
  });

  describe('registerRoutes', () => {
    it('registers a get route', () => {
      const getStub = sinon.stub();
      getStub.returns(Promise.resolve({ foo: 'bar' }));
      const router = new Router({
        get: getStub,
        slug: '/foo'
      });

      inspect(router).isObject();

      return apiInspect.get('/foo').test((ctx) => {
        ctx.statusCode(200);
        ctx.contentType('application/json');
        ctx.responseTime(50);
      });
    });

    it('registers a post route', () => {
      const postStub = sinon.stub();
      postStub.returns(Promise.resolve({ foo: 'bar' }));
      const router = new Router({
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
      const router = new Router({
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
      const router = new Router({
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
      const router = new Router({
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
  });

  describe('registerModel', () => {
    let TestModel;

    before(() => {
      TestModel = CoreIO.createModel('test', {
        defaults: {
          id: 1328,
          foo: 'bar'
        }
      });
    });

    it('create a route conf from model', () => {
      const conf = {
        slug: '/test',
        model: TestModel,
        allow: ['READ', 'CREATE', 'UPDATE', 'DELETE']
      };

      const router = new Router();
      inspect(router.registerModel(conf)).isEql([{
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
  });


  describe('model', () => {
    let TestModel;

    before(() => {
      TestModel = CoreIO.createModel('test', {
        defaults: {
          id: 1328,
          foo: 'bar'
        }
      });
    });

    it('registers a model get route', () => {
      const router = new Router({
        model: TestModel,
        slug: '/test'
      });

      inspect(router).isObject();

      return apiInspect.get('/test/1328').test((ctx) => {
        ctx.statusCode(200);
        ctx.contentType('application/json');
        ctx.responseTime(50);
        inspect(ctx.body).isEql({
          id: 1328,
          foo: 'bar'
        });
      });
    });

    it('registers a model post route', () => {
      const router = new Router({
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
      const router = new Router({
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
      const router = new Router({
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
      const router = new Router({
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
  });
});
