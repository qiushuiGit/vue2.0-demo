import { initState } from './state';

function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    const vm = this; // 存储 this（ Vue实例 ）

    vm.$options = options; // 将 options 挂载到 vm 上，以便后续使用

    // Vue 实例中的 data、 props、methods、computed 和 watch，都会在 initState 函数中
    // 进行初始化。由于我们主要解说：Vue 数据劫持，所以只对 data 进行处理。

    initState(vm);
  }
}

export {
  initMixin
}