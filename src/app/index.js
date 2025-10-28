import { MiniFrame } from '../framework/miniframe.js';
import { createTodoApp, store } from './todo.js';

const root = document.getElementById('root');

if (!root) {
    console.error("The root element with id='root' was not found in the DOM.");
}

let oldVNode = null;

store.subscribe((state) => {
  // hna bagh  nkhali  route  dinamique  hit  t9ad tkon 3andi haja khra mn  ghir craetetodo  onbghit  hiya  nkhdma  khsni 3la hsab route  nkhdam chihaja 
  const vNode = createTodoApp(state,state.route);
  MiniFrame.render(vNode, root, oldVNode);
  oldVNode = vNode;
});

MiniFrame.router.addRoute('/', () => store.update({ route: '' }));
MiniFrame.router.addRoute('/active', () => store.update({ route: 'active' }));
MiniFrame.router.addRoute('/completed', () => store.update({ route: 'completed' }));
MiniFrame.router.start();