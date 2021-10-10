import proxy from './proxy';
import { observe } from '../observer/index';

function initState (vm) {
  vm._watchers = []; // 订阅者列表
  const options = vm.$options;

  if (options.data) {
    initData(vm); // 初始化 data
  }
}

function initData (vm) {
  let data = vm.$options.data;

  // Vue 中的 data 可以是函数（Vue 中建议将 data 作为一个函数来使用），也可以是 Object --> {}
  data = vm.$data = typeof data === 'function' ? data.call(vm) : data || {};
  
  for (var key in data) {
    // proxy 实现数据代理，vm.name --> vm.$data.name
    proxy(vm, '$data', key);
  }

  // observe 观察者，对数据进行观测，以便在其发生改变时，做出反应。
  observe(vm.$data); 
}

export {
    initState
}