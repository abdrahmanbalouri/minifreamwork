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
              keydown: (e) => {  
                if (e.key === 'Enter' && e.target.value.trim()) {
                  store.update({
                    todos: [
                      ...todos,
                      {
                        id: Date.now(),
                        text: e.target.value.trim(),  
                        completed: false
                      }
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
        attrs: {
          class: 'main',
          style: { display: todos.length ? 'block' : 'none' } 
        },
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
          {
            tag: 'label',
            attrs: { htmlFor: 'toggle-all' }, 
            children: ['Mark all as complete']
          },
          {
            tag: 'ul',
            attrs: { class: 'todo-list' },
            children: filteredTodos.map(todo =>
              MiniFrame.createElement({
                tag: 'li',
                attrs: {
                  class: todo.completed ? 'completed' : '',
                  'data-id': todo.id,
                  key: todo.id
                },
                children: [
                  {
                    tag: 'div',
                    attrs: { class: 'view' },
                    children: [
                      {
                        tag: 'input',
                        attrs: {
                          class: 'toggle',
                          type: 'checkbox',
                          checked: todo.completed
                        },
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
                      {
                        tag: 'label',
                        children: [todo.text || ''],
                        events: {
                          dblclick: (e) => {
                            const li = e.target.closest('li');
                            li.classList.add('editing');

                            const editInput = document.createElement('input');
                            editInput.className = 'edit';
                            editInput.value = todo.text;

                            editInput.addEventListener('keydown', (editEvent) => {
                              if (editEvent.key === 'Enter') {
                                const newText = editInput.value.trim();
                                if (newText) {
                                  store.update({
                                    todos: todos.map(t =>
                                      t.id === todo.id ? { ...t, text: newText } : t
                                    )
                                  });
                                  li.classList.remove('editing');
                                }
                              } else if (editEvent.key === 'Escape') {
                                li.classList.remove('editing');
                              }
                            });

                            editInput.addEventListener('blur', () => {
                              const newText = editInput.value.trim();
                              if (newText) {
                                store.update({
                                  todos: todos.map(t =>
                                    t.id === todo.id ? { ...t, text: newText } : t
                                  )
                                });
                              }
                              li.classList.remove('editing');
                            });

                            // Ajouter l'input d'édition au li
                            li.appendChild(editInput);
                            editInput.focus();
                          }
                        }
                      },
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
        attrs: {
          class: 'footer',
          style: { display: todos.length ? 'block' : 'none' } // ✅ Style en objet
        },
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
              {
                tag: 'li',
                children: [
                  {
                    tag: 'a',
                    attrs: {
                      href: '#all',
                      class: filter === 'all' ? 'selected' : ''
                    },
                    children: ['All']
                  }
                ]
              },
              {
                tag: 'li',
                children: [
                  {
                    tag: 'a',
                    attrs: {
                      href: '#active',
                      class: filter === 'active' ? 'selected' : ''
                    },
                    children: ['Active']
                  }
                ]
              },
              {
                tag: 'li',
                children: [
                  {
                    tag: 'a',
                    attrs: {
                      href: '#completed',
                      class: filter === 'completed' ? 'selected' : ''
                    },
                    children: ['Completed']
                  }
                ]
              }
            ]
          },
          {
            tag: 'button',
            attrs: {
              class: 'clear-completed',
              style: { display: todos.some(t => t.completed) ? 'block' : 'none' } // ✅ Style en objet
            },
            children: ['Clear completed'],
            events: {
              click: () => {  // ✅ Changé 'onclick' en 'click'
                store.update({ todos: todos.filter(t => !t.completed) });
              }
            }
          }
        ]
      }
    ]
  });
}