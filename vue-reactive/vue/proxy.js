function proxy (vm, target, key) {
  // Object.defineProperty() 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。
  // 将属性都挂载到 vm（Vue实例）上，并设置属性的 getter/setter，以实现数据代理：vm.name --> vm.$data.name
  Object.defineProperty(vm, key, {
    get () {
      return vm[target][key]; // vm[target][key] --> vm.$data.name
    },
    set (newValue) {
      vm[target][key] = newValue;
    }
  });
}

export default proxy;