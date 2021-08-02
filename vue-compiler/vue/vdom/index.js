import { createElement, createTextNode } from './vnode';

function renderMixin(Vue) {
  // 创建虚拟元素节点对象
  Vue.prototype._c = function () {
    return createElement(...arguments);
  }
 
  // 创建虚拟文本节点对象
  Vue.prototype._v = function (text) {
    return createTextNode(text);
  }

   // 处理双大括号，例如：{{tip}}
   Vue.prototype._s = function (value) {
    if (value === null) return;
    return typeof value === 'object' ? JSON.stringify(value) : value;
  }

  // 调用 vm.$options.render 渲染函数，生成虚拟节点
  Vue.prototype._render = function () {
    const vm = this;
    const vnode = vm.$options.render.call(vm); // 生成虚拟节点对象并返回

    return vnode;
  }
}

export {
  renderMixin
}