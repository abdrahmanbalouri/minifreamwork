import { MiniFrame } from '../framework/miniframe.js';
import { createTodoApp, store } from './todo.js';

const root = document.getElementById('root');
let oldVNode = null;

store.subscribe((state) => {
  const vNode = createTodoApp(state);
  MiniFrame.render(vNode, root, oldVNode);
  oldVNode = vNode; 
});

// Routes
MiniFrame.router.addRoute('#all', () => store.update({ filter: 'all' }));
MiniFrame.router.addRoute('#active', () => store.update({ filter: 'active' }));
MiniFrame.router.addRoute('#completed', () => store.update({ filter: 'completed' }));

MiniFrame.router.start(root);