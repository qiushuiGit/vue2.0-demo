import { installRenderHelpers } from './render-helpers/index'

export function renderMixin(Vue) {
    // 安装运行时所需的辅助性渲染函数
    installRenderHelpers(Vue.prototype);

    // 调用 vm.$options.render 渲染函数，生成虚拟节点
    Vue.prototype._render = function () {
        const vm = this;
        const vnode = vm.$options.render.call(vm); // 生成虚拟节点对象并返回

        return vnode;
    };
}