import { patch } from './vdom/patch';

// 挂载组件
function mountComponent(vm) {
  // vm._render() 返回虚拟节点 vnode
  vm._update(vm._render()); // 更新组件
}


function lifecycleMixin(Vue) {
  // 挂载 _update() 更新函数
  Vue.prototype._update = function (vnode) {
    const vm = this;
    patch(vm.$el, vnode); // 将 vnode 虚拟节点生成相应的 HTML 元素
  }
}

export {
  lifecycleMixin,
  mountComponent
}