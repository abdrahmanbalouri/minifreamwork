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
      if (key === 'checked' || key === 'autofocus' || key === 'selected') {
        element[key] = !!attrs[key];
      } else {
        element.setAttribute(key, attrs[key]);
      }
    });

    const events = vNode.events || {};
    Object.keys(events).forEach((eventType) => {
      this.on(element, eventType, events[eventType]);
    });

    const children = vNode.children || [];
    children.forEach((child) => {
      element.appendChild(this._createRealDOM(child));
    });

    return element;
  },

  updateDOM(oldVNode, newVNode, parent) {
    if (!oldVNode || !newVNode) {
      parent.innerHTML = '';
      if (newVNode) parent.appendChild(this._createRealDOM(newVNode));
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

    const element = parent.children[0] || parent.appendChild(document.createElement(newVNode.tag));

    const oldAttrs = oldVNode.attrs || {};
    const newAttrs = newVNode.attrs || {};

    Object.keys(newAttrs).forEach((key) => {
      if (newAttrs[key] !== oldAttrs[key]) {
        if (key === 'checked' || key === 'autofocus') {
          element[key] = !!newAttrs[key];
        } else {
          element.setAttribute(key, newAttrs[key]);
        }
      }
    });

    Object.keys(oldAttrs).forEach((key) => {
      if (!(key in newAttrs)) {
        if (key === 'checked' || key === 'autofocus') {
          element[key] = false;
        } else {
          element.removeAttribute(key);
        }
      }
    });

    const newEvents = newVNode.events || {};
    Object.keys(newEvents).forEach((eventType) => {
      this.on(element, eventType, newEvents[eventType]);
    });

    const oldChildren = oldVNode.children || [];
    const newChildren = newVNode.children || [];
    const maxLength = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < maxLength; i++) {
      const childElement = element.children[i] || element.appendChild(document.createElement('div'));
      this.updateDOM(oldChildren[i], newChildren[i], childElement);
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
        return () => {
          subscribers = subscribers.filter((s) => s !== cb);
        };
      }
    };
  },

  eventHub: {
    events: new Map(),
    on(element, eventType, handler) {
      const key = `${eventType}_${element.dataset.id || Math.random().toString(36)}`;
      this.events.set(key, { element, eventType, handler });
      element[`on${eventType}`] = handler;
    },
    off(element, eventType) {
      const key = `${eventType}_${element.dataset.id || Math.random().toString(36)}`;
      this.events.delete(key);
      element[`on${eventType}`] = null;
    }
  },

  on(element, eventType, handler) {
    this.eventHub.on(element, eventType, handler);
  },

  off(element, eventType) {
    this.eventHub.off(element, eventType);
  },

  router: {
    routes: new Map(),
    addRoute(path, renderFn) {
      this.routes.set(path, renderFn);
    },
    start(container) {
      const navigate = () => {
        const path = window.location.hash || '#all';
        const renderFn = this.routes.get(path) || this.routes.get('#all');
        if (renderFn) {
          const vNode = renderFn();
          MiniFrame.render(vNode, container);
        }
      };
      window.addEventListener('hashchange', navigate);
      navigate();
    }
  }
};