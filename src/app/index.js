import { MiniFrame } from '../framework/miniframe.js';
import { createTodoApp, store } from './todo.js';

const root = document.getElementById('root');

store.subscribe((state) => {    
  const vNode = createTodoApp(state);
  MiniFrame.render(vNode, root);
});
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

MiniFrame.router.start(root);