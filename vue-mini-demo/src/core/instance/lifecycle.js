import Watcher from '../observer/watcher';
import { noop } from '../../shared/util';

let updateComponent;

// 挂载组件
export function mountComponent(vm) {
  // 更新组件
  updateComponent = () => {
    // 将 vm._render() 返回的 vnode 虚拟节点对象传递给 vm._update，它会调用 patch 函数生成文档树
    vm._update(vm._render());
  };

  new Watcher(vm, updateComponent, noop, {}, true /* isRenderWatcher */);
}

export function lifecycleMixin(Vue) {
  // 挂载 _update() 更新函数
  Vue.prototype._update = function (vnode) {
    const vm = this;
    console.log('_update--->执行', vm.$el, vnode);
    const prevEl = vm.$el;
    const prevVnode = vm._vnode;
    vm._vnode = vnode;

    // 将 vnode 虚拟节点生成相应的 HTML 元素
    if (!prevVnode) {
      // 初始化
      vm.$el = vm.__patch__(vm.$el, vnode);
    } else {
      // 更新
      vm.$el = vm.__patch__(prevVnode, vnode);
    }

    // 更新 __vue__ 引用
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }

    // 更新 vm.$parent.$el
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    }
  };
}
