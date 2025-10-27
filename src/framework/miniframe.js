export const MiniFrame = {
  _getNextExistingElement(newChildren, oldKeyedMap, i, el) {
      for (let j = i + 1; j < newChildren.length; j++) {
          const nextNewChild = newChildren[j];
          const nextKey = (typeof nextNewChild === 'object' && nextNewChild?.attrs?.key) || `_${j}`;
          
          if (oldKeyedMap.has(nextKey)) {
              const existingOldChild = oldKeyedMap.get(nextKey);
              return existingOldChild.el; 
          }
      }
      return null;
  },

  createElement({ tag, attrs = {}, children = [], events = {} }) {
    return { tag, attrs, children, events };
  },

  render(vNode, container, oldVNode = null) {
    if (!oldVNode) {
      const element = this._createRealDOM(vNode);
      container.appendChild(element);
      if (typeof vNode === 'object') vNode.el = element; 
    } else {
      this.updateDOM(oldVNode, vNode, container);
    }
  },

  _createRealDOM(vNode) {
    if (typeof vNode === 'string' || typeof vNode === 'number') {
      const textNode = document.createTextNode(vNode.toString());
      return textNode;
    }
    
    if (!vNode || !vNode.tag) return document.createTextNode('');

    const element = document.createElement(vNode.tag);
    vNode.el = element; 

    const attrs = vNode.attrs || {};
    Object.keys(attrs).forEach((key) => {
      const value = attrs[key];
      if (key === 'checked' || key === 'autofocus' || key === 'selected') {
        element[key] = !!value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key === 'htmlFor') {
        element.setAttribute('for', value);
      } else if (key === 'value') {
        element.value = value || '';
      } else {
        element.setAttribute(key, value);
      }
    });

    const events = vNode.events || {};
    Object.keys(events).forEach((eventType) => {
      element.addEventListener(eventType, events[eventType]);
    });

    const children = vNode.children || [];
    children.forEach((child) => {
      if (child) {
        element.appendChild(this._createRealDOM(child));
      }
    });

    return element;
  },

  updateDOM(oldVNode, newVNode, parent) {
    if (!newVNode) {
      if (oldVNode && oldVNode.el) parent.removeChild(oldVNode.el);
      return;
    }

    if (!oldVNode) {
      const el = this._createRealDOM(newVNode);
      parent.appendChild(el);
      if (typeof newVNode === 'object') newVNode.el = el;
      return;
    }

    if (typeof oldVNode === 'string' || typeof newVNode === 'string' || typeof oldVNode === 'number' || typeof newVNode === 'number') {
      if (oldVNode.toString() !== newVNode.toString()) {
        const newEl = this._createRealDOM(newVNode);
        const oldEl = parent.firstChild;

        if (oldEl) {
           parent.replaceChild(newEl, oldEl);
        } else {
           parent.appendChild(newEl);
        }
      }
      return;
    }
    
    if (oldVNode.tag !== newVNode.tag) {
      const newEl = this._createRealDOM(newVNode);
      parent.replaceChild(newEl, oldVNode.el);
      newVNode.el = newEl;
      return;
    }
    
    const el = oldVNode.el;
    if (!el) {
        const newEl = this._createRealDOM(newVNode);
        parent.replaceChild(newEl, parent.firstChild); 
        newVNode.el = newEl;
        return;
    }
    newVNode.el = el; 

    const oldAttrs = oldVNode.attrs || {};
    const newAttrs = newVNode.attrs || {};
    console.log(newAttrs);
    

    Object.keys(newAttrs).forEach(key => {      
      const oldValue = oldAttrs[key];
      const newValue = newAttrs[key];
      if (oldValue !== newValue) {
        if (key === 'checked' || key === 'autofocus' || key === 'selected') {
          el[key] = !!newValue;
        } else if (key === 'style' && typeof newValue === 'object') {
          Object.assign(el.style, newValue);
        } else if (key === 'htmlFor') {
          el.setAttribute('for', newValue);
        } else if (key === 'value') {
          el.value = newValue || '';
        } else {
          el.setAttribute(key, newValue);
        }
      }
    });

    Object.keys(oldAttrs).forEach(key => {
      if (!(key in newAttrs)) {
        if (key === 'checked' || key === 'autofocus' || key === 'selected') {
          el[key] = false;
        } else if (key === 'style') {
          el.style.cssText = '';
        } else if (key === 'htmlFor') {
          el.removeAttribute('for');
        } else if (key === 'value') {
          el.value = '';
        } else {
          el.removeAttribute(key);
        }
      }
    });

    const oldEvents = oldVNode.events || {};
    const newEvents = newVNode.events || {};

    Object.keys(oldEvents).forEach(eventType => {
      const oldHandler = oldEvents[eventType];
      const newHandler = newEvents[eventType];

      if (!newHandler || oldHandler !== newHandler) {
        el.removeEventListener(eventType, oldHandler);
      }
    });

    Object.keys(newEvents).forEach(eventType => {
      const oldHandler = oldEvents[eventType];
      const newHandler = newEvents[eventType];

      if (!oldHandler || oldHandler !== newHandler) {
        el.addEventListener(eventType, newHandler);
      }
    });

    const oldChildren = oldVNode.children || [];
    const newChildren = newVNode.children || [];

    const oldKeyedMap = new Map();
    oldChildren.forEach((child, index) => {
        const key = (typeof child === 'object' && child?.attrs?.key) || `_${index}`;
        oldKeyedMap.set(key, child);
    });

    for (let i = 0; i < newChildren.length; i++) {
        const newChild = newChildren[i];
        
        const key = (typeof newChild === 'object' && newChild?.attrs?.key) || `_${i}`;
        let oldChild = oldKeyedMap.get(key);
        let realDOMNode = null;
        
        const nextSiblingReference = this._getNextExistingElement(newChildren, oldKeyedMap, i, el);

        if (oldChild) {
            this.updateDOM(oldChild, newChild, el);
            
            if (typeof newChild === 'object') {
                 realDOMNode = newChild.el;
            } else {
                 realDOMNode = el.childNodes[i]; 
            }

            oldKeyedMap.delete(key);
            
            if (realDOMNode && realDOMNode.nextSibling !== nextSiblingReference) {
                el.insertBefore(realDOMNode, nextSiblingReference); 
            }
        } else {
            realDOMNode = this._createRealDOM(newChild);
            el.insertBefore(realDOMNode, nextSiblingReference);
        }
    }

    oldKeyedMap.forEach(oldChild => {
        const childEl = oldChild.el;
        if (childEl && el.contains(childEl)) {
            el.removeChild(childEl);
        }
    });
  },

  createStore(initialState) {
    let state = { ...initialState };
    let subscribers = [];

    return {
      getState: () => state,
      update: (newState) => {
        state = { ...state, ...newState };
        subscribers.forEach((cb) => cb(state));
      },
      subscribe: (cb) => {
        subscribers.push(cb);
        cb(state); 
        return () => {
          subscribers = subscribers.filter((s) => s !== cb);
        };
      }
    };
  },

  router: {
    routes: new Map(),
    addRoute(path, renderFn) {
      this.routes.set(path, renderFn);
    },
    start() {
      const navigate = () => {
        const path = window.location.hash || '#all';
        const renderFn = this.routes.get(path) || this.routes.get('#all');
        if (renderFn) {
          renderFn();
        }
      };
      window.addEventListener('hashchange', navigate);
      navigate();
    }
  }
};