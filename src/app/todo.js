import { MiniFrame } from '../framework/miniframe.js';

export const store = MiniFrame.createStore({
  todos: [],
  editingId: null ,
  route : "all"
});

export function createTodoApp(state ,filter ) {
  const { todos, editingId  } = state; 
  

  const filteredTodos = todos.filter((todo) => {
    console.log(filter);
    
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  const handleEditInput = (e, todo) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      const newText = e.target.value.trim();
      
      if (newText) {
        store.update({
          todos: todos.map(t =>
            t.id === todo.id ? { ...t, text: newText } : t
          ),
          editingId: null 
        });
      } else if (e.type === 'blur') {
        store.update({
          todos: todos.filter(t => t.id !== todo.id),
          editingId: null
        });
      }
    } else if (e.key === 'Escape') {
      store.update({ editingId: null });
    }
  };

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
            children: filteredTodos.map(todo => {
              
              const isEditing = todo.id === editingId; 
              
              let liChildren;
              
              if (isEditing) {
                liChildren = [
                  {
                    tag: 'input',
                    attrs: {
                      class: 'edit',
                      value: todo.text,
                    },
                    events: {
                      keydown: (e) => handleEditInput(e, todo),
                      blur: (e) => handleEditInput(e, todo)
                    }
                  }
                ];
                            setTimeout(() => {
                  const editInput = document.querySelector(`li[data-id="${todo.id}"] .edit`);
                  if (editInput) editInput.focus();
                }, 0);

              } else {
                liChildren = [
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
                          dblclick: () => {
                            store.update({ editingId: todo.id });
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
                ];
              }
              
              return MiniFrame.createElement({
                tag: 'li',
                attrs: {
                  class: `${todo.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''}`,
                  'data-id': todo.id,
                  key: todo.id 
                },
                children: liChildren
              });
            }) 
          }
        ]
      },
      {
        tag: 'footer',
        attrs: {
          class: 'footer',
          style: { display: todos.length ? 'block' : 'none' }
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
                    //  href: '/all',
                      class: filter === 'all' ? 'selected' : ''
                    },
                      events: {
                      click: (e) => MiniFrame.router.go(e,'/')  // Hna sta3mel go()
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
                   //   href: '/active',
                      class: filter === 'active' ? 'selected' : ''
                    },
                      events: {
                      click: (e) => MiniFrame.router.go(e,'/active')  // Hna sta3mel go()
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
                  //    href: '/completed',
                      class: filter === 'completed' ? 'selected' : ''
                    },
                      events: {
                        
                      click: (e) => MiniFrame.router.go(e,'/completed')  // Hna sta3mel go()
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
              style: { display: todos.some(t => t.completed) ? 'block' : 'none' }
            },
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