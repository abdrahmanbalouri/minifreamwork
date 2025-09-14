function useState(initialValue, renderFn) {
  let value = initialValue;

  function getValue() {
    return value;
  }

  function setValue(newValue) {
    value = newValue;
    if (typeof renderFn === "function") {
      renderFn(value);
    }
  }

  return [getValue, setValue];
}
