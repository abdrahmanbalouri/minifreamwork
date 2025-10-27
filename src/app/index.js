import { MiniFrame } from '../framework/miniframe.js';
import { createTodoApp, store } from './todo.js';

const root = document.getElementById('root');

if (!root) {
    console.error("The root element with id='root' was not found in the DOM.");
}

let oldVNode = null;

store.subscribe((state) => {
  const vNode = createTodoApp(state);
  
  MiniFrame.render(vNode, root, oldVNode);
  
  oldVNode = vNode; 
});

MiniFrame.router.addRoute('#all', () => store.update({ filter: 'all' }));
MiniFrame.router.addRoute('#active', () => store.update({ filter: 'active' }));
MiniFrame.router.addRoute('#completed', () => store.update({ filter: 'completed' }));

MiniFrame.router.start();