const CoreIO = require('../')
CoreIO.logLevel = 'debug';

const todos = [];

// Todo Service
const TodoService = CoreIO.createService('todo', {
  insert(data) {
    todos.push(data);
    data.id = CoreIO.uid(5);
    return Promise.resolve({
      id: data.id
    });
  },
  findOne(id) {
    for (const item of todos) {
      if (id === item.id) {
        return Promise.resolve(item);
      }
    }

    return Promise.resolve(null);
  },
  find() {
    return Promise.resolve(todos);
  }
});

// Todo Model
const TodoModel = CoreIO.createModel('todo', {
  service: TodoService,
  schema: {
    title: { type: 'string', min: 3, max: 100 },
    description: { type: 'string', min: 0, max: 1000 },
    state: { type: 'number', default: 1 }
  }
});

// Todo List
const TodoList = CoreIO.createList('todo', {
  model: TodoModel,
  service: TodoService
});

// API
CoreIO.api('/todo', {
  list: TodoList,
  model: TodoModel,
  allow: ['READ', 'CREATE', 'UPDATE', 'DELETE']
});
