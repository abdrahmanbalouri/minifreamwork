import { MiniFrame } from '../framework/miniframe.js';
import { createTodoApp, store } from './todo.js';

const root = document.getElementById('root');

store.subscribe((state) => {
  const vNode = createTodoApp(state);
  MiniFrame.render(vNode, root);
});

MiniFrame.router.start(root);