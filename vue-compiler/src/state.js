import { observe } from "./observer";
import { proxy } from './utils';

function initState (vm) {
  const options = vm.$options;

  if (options.data) {
    initData(vm);
  }
}


function initData (vm) {
  let data = vm.$options.data;

  vm._data = data = typeof data === 'function' ? data.call(vm) : data;
  
  for (let key in data) {
    proxy(vm, '_data', key);
  }
  
  observe(data);
}


export {
  initState
}