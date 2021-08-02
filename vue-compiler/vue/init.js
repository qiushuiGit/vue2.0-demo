import { initState } from './state';
import { compileToFunctions } from './compiler';
import { mountComponent } from './lifecycle';

function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this; // 存储 this（ Vue实例 ）
    vm.$options = options; // 将 options 挂载到 vm 上，以便后续使用

    // Vue 实例中的 data、 props、methods、computed 和 watch，都会在 initState 函数中
    // 进行初始化。由于我们主要解说：Vue 数据劫持，所以只对 data 进行处理。
    initState(vm);

    if (vm.$options.el) {
      // Vue.prototype.$mount --> 挂载函数
      vm.$mount(vm.$options.el);
    }
  }

  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;

    // Vue 选项中的 render 函数若存在，则 Vue 构造函数不会从 
    // template 选项或通过 el 选项指定的挂载元素中提取出的 HTML 模板编译渲染函数。

    // 处理模板（优先级）: render  >  template   >  html模板

    // 若是 render 函数不存在，就生成 render
    if (!options.render) {

      let template = options.template; // 获取模板

      // el存在，且 template 不存在
      if (el && !template) {
        // 挂载 el（ HTML 模板），以便在实例的 _update 方法中使用
        vm.$el = document.querySelector(el);
        template = vm.$el.outerHTML;
      }

      // 编译模板，生成 AST 抽象语法树并将其生成渲染函数 render
      const render = compileToFunctions(template);
      options.render = render; // 挂载 render
    }
    
    mountComponent(vm); // 挂载组件
  }
}

export {
  initMixin
}