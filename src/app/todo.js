import { MiniFrame } from '../framework/miniframe.js';

export const store = MiniFrame.createStore({
  todos: [],
  filter: 'all'
});

export function createTodoApp(state) {
  const { todos, filter } = state;

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return MiniFrame.createElement({
    tag: 'section',
    attrs: { class: 'todoapp' },
    children: [
      {
        tag: 'header',
        attrs: { class: 'header' },
        children: [
          { tag: 'h1', children: ['todos'] },
          {
            tag: 'input',
            attrs: {
              class: 'new-todo',
              placeholder: 'What needs to be done?',
              autofocus: true
            },
            events: {
              keypress: (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  store.update({
                    todos: [
                      ...todos,
                      { id: Date.now(), text: e.target.value.trim(), completed: false }
                    ]
                  });
                  e.target.value = '';
                }
              }
            }
          }
        ]
      },
      {
        tag: 'section',
        attrs: { class: 'main', style: todos.length ? '' : 'display: none' },
        children: [
          {
            tag: 'input',
            attrs: {
              id: 'toggle-all',
              class: 'toggle-all',
              type: 'checkbox',
              checked: todos.length > 0 && todos.every(t => t.completed)
            },
            events: {
              change: (e) => {
                store.update({
                  todos: todos.map(t => ({ ...t, completed: e.target.checked }))
                });
              }
            }
          },
          { tag: 'label', attrs: { for: 'toggle-all' }, children: ['Mark all as complete'] },
          {
            tag: 'ul',
            attrs: { class: 'todo-list' },
            children: filteredTodos.map(todo =>
              MiniFrame.createElement({
                tag: 'li',
                attrs: {
                  class: todo.completed ? 'completed' : '',
                  'data-id': todo.id
                },
                children: [
                  {
                    tag: 'div',
                    attrs: { class: 'view' },
                    children: [
                      {
                        tag: 'input',
                        attrs: { class: 'toggle', type: 'checkbox', checked: todo.completed },
                        events: {
                          change: () => {
                            store.update({
                              todos: todos.map(t =>
                                t.id === todo.id ? { ...t, completed: !t.completed } : t
                              )
                            });
                          }
                        }
                      },
                      { tag: 'label', children: [todo.text] },
                      {
                        tag: 'button',
                        attrs: { class: 'destroy' },
                        events: {
                          click: () => {
                            store.update({
                              todos: todos.filter(t => t.id !== todo.id)
                            });
                          }
                        }
                      }
                    ]
                  }
                ]
              })
            )
          }
        ]
      },
      {
        tag: 'footer',
        attrs: { class: 'footer', style: todos.length ? '' : 'display: none' },
        children: [
          {
            tag: 'span',
            attrs: { class: 'todo-count' },
            children: [
              `${todos.filter(t => !t.completed).length} item${todos.filter(t => !t.completed).length !== 1 ? 's' : ''} left`
            ]
          },
          {
            tag: 'ul',
            attrs: { class: 'filters' },
            children: [
              { tag: 'li', children: [{ tag: 'a', attrs: { href: '#all', class: filter === 'all' ? 'selected' : '' }, children: ['All'] }] },
              { tag: 'li', children: [{ tag: 'a', attrs: { href: '#active', class: filter === 'active' ? 'selected' : '' }, children: ['Active'] }] },
              { tag: 'li', children: [{ tag: 'a', attrs: { href: '#completed', class: filter === 'completed' ? 'selected' : '' }, children: ['Completed'] }] }
            ]
          },
          {
            tag: 'button',
            attrs: { class: 'clear-completed', style: todos.some(t => t.completed) ? '' : 'display: none' },
            children: ['Clear completed'],
            events: {
              click: () => {
                store.update({ todos: todos.filter(t => !t.completed) });
              }
            }
          }
        ]
      }
    ]
  });
}

MiniFrame.router.addRoute('#all', () => {
  store.update({ filter: 'all' });
  return createTodoApp(store.getState());
});
MiniFrame.router.addRoute('#active', () => {
  store.update({ filter: 'active' });
  return createTodoApp(store.getState());
});
MiniFrame.router.addRoute('#completed', () => {
  store.update({ filter: 'completed' });
  return createTodoApp(store.getState());
});