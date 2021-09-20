import { initMixin } from './init';

function Vue (options) {
  // 通过关键字 new 创建 Vue实例时，便会调用 Vue 原型方法 _init 初始化数据
  this._init(options); 
}

// 执行 initMixin，会在 Vue.prototype（Vue原型）上挂载 _init 方法
initMixin(Vue); 

export default Vue;