function createStore(initialState) {
  let state = { ...initialState };
  let subscribers = [];

  return {
    update: (newState) => {
      state = { ...state, ...newState };
      subscribers.forEach((cb) => cb(state)); 
    },
    subscribe: (cb) => {
        console.log(cb);
        
      subscribers.push(cb);
      cb(state);
    }
  };
}

const store = createStore({ count: 0 });

store.subscribe((state) => {
  console.log(state,"--------------");
});

store.update({ count: 1 }); 
store.update({ count: 2 }); 
store.update({ count: 3 });  
store.update({ count: 3 });
