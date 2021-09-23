// 挂载组件
export function mountComponent(vm) {
    // vm._render() 返回虚拟节点 vnode
    vm._update(vm._render()); // 更新组件
}

export function lifecycleMixin(Vue) {
    // 挂载 _update() 更新函数
    Vue.prototype._update = function (vnode) {
        const vm = this;
        console.log('_update--->执行', vm.$el, vnode);
        // 将 vnode 虚拟节点生成相应的 HTML 元素
        vm.__patch__(vm.$el, vnode);
    };
}