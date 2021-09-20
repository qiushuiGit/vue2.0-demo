import { initMixin } from './init';
import { lifecycleMixin } from './lifecycle';
import { renderMixin } from './vdom/index';

function Vue(options) {
  // 通过关键字 new 创建 Vue实例时，便会调用 Vue 原型方法 _init 初始化数据
  this._init(options);
}

// 初始化相关操作，主要是在 Vue.prototype 上挂载 _init() 和 $mount() 方法
initMixin(Vue);
// 生命周期相关操作，主要是在 Vue.prototype 上挂载 _update 方法
lifecycleMixin(Vue);
// 渲染相关操作，主要是在 Vue.prototype 上挂载 _render()、 _c()、 _v() 和  _s()函数
renderMixin(Vue);

export default Vue;