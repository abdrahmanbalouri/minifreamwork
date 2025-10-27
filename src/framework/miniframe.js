export const MiniFrame = {
  createElement({ tag, attrs = {}, children = [], events = {} }) {
    return { tag, attrs, children, events };
  },

  render(vNode, container, oldVNode = null) {        
    if (!oldVNode) {
      container.innerHTML = '';
      const element = this._createRealDOM(vNode);
      container.appendChild(element);
    } else {
      
      this.updateDOM(oldVNode, vNode, container);
    }
  },

  _createRealDOM(vNode) {
    if (typeof vNode === 'string' || typeof vNode === 'number') {
      return document.createTextNode(vNode);
    }

    const element = document.createElement(vNode.tag);

    const attrs = vNode.attrs || {};
    Object.keys(attrs).forEach((key) => {
      const value = attrs[key];
      
      if (key === 'checked' || key === 'autofocus' || key === 'selected') {
        element[key] = !!value;
      } 
      else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      }
      else if (key === 'htmlFor') {
        element.setAttribute('for', value);
      }
      else if (key === 'value') {
        element.value = value || '';
      }
      else {
        element.setAttribute(key, value);
      }
    });

    const events = vNode.events || {};
    Object.keys(events).forEach((eventType) => {
      element.addEventListener(eventType, events[eventType]);
    });

    const children = vNode.children || [];
    children.forEach((child) => {
      if (child && (child.tag || typeof child === 'string' || typeof child === 'number')) {
        element.appendChild(this._createRealDOM(child));
      }
    });

    return element;
  },

  updateDOM(oldVNode, newVNode, parent) {
    if (!oldVNode || !newVNode) {
      parent.innerHTML = '';
      if (newVNode) {
        parent.appendChild(this._createRealDOM(newVNode));
      }
      return;
    }

    if (typeof oldVNode === 'string' || typeof newVNode === 'string') {
      if (oldVNode !== newVNode) {
        parent.innerHTML = '';
        parent.appendChild(this._createRealDOM(newVNode));
      }
      return;
    }

    if (oldVNode.tag !== newVNode.tag) {
      parent.innerHTML = '';
      parent.appendChild(this._createRealDOM(newVNode));
      return;
    }

    let element = parent.firstChild;
    console.log(element);
    
    if (!element) {
      element = this._createRealDOM(newVNode);
      parent.appendChild(element);
      return;
    }

    const oldAttrs = oldVNode.attrs || {};
    const newAttrs = newVNode.attrs || {};

    Object.keys(newAttrs).forEach((key) => {
      const oldValue = oldAttrs[key];
      const newValue = newAttrs[key];

      if (newValue !== oldValue) {
        if (key === 'checked' || key === 'autofocus') {
          element[key] = !!newValue;
        } 
        else if (key === 'style' && typeof newValue === 'object') {
          Object.assign(element.style, newValue);
        }
        else if (key === 'htmlFor') {
          element.setAttribute('for', newValue);
        }
        else if (key === 'value') {
          element.value = newValue || '';
        }
        else {
          element.setAttribute(key, newValue);
        }
      }
    });

    Object.keys(oldAttrs).forEach((key) => {
      if (!(key in newAttrs)) {
        if (key === 'checked' || key === 'autofocus') {
          element[key] = false;
        }
        else if (key === 'style') {
          element.style = '';
        }
        else if (key === 'htmlFor') {
          element.removeAttribute('for');
        }
        else if (key === 'value') {
          element.value = '';
        }
        else {
          element.removeAttribute(key);
        }
      }
    });

    const oldEvents = oldVNode.events || {};
    const newEvents = newVNode.events || {};

    Object.keys(oldEvents).forEach(eventType => {
      element.removeEventListener(eventType, oldEvents[eventType]);
    });

    Object.keys(newEvents).forEach(eventType => {
      element.addEventListener(eventType, newEvents[eventType]);
    });

    const oldChildren = oldVNode.children || [];
    const newChildren = newVNode.children || [];
    const maxLength = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < maxLength; i++) {
      const childContainer = document.createElement('div');
      if (element.childNodes[i]) {
        element.replaceChild(childContainer, element.childNodes[i]);
      } else {
        element.appendChild(childContainer);
      }
      this.updateDOM(oldChildren[i], newChildren[i], childContainer);
    }

    for (let i = newChildren.length; i < oldChildren.length; i++) {
      if (element.childNodes[i]) {
        element.removeChild(element.childNodes[i]);
      }
    }
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
        // return () => {
        //   subscribers = subscribers.filter((s) => s !== cb);
        // };
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