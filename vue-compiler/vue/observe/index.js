import observeArray from './observeArray';
import { defineReactive } from './reactive';
import { arrayMethods } from './array';
import { isObject } from '../shared/util';


function observe (val) {
  
  // 检查 val 是否为对象（注意：在 js 中，数组也是对象，isObject并不排除数组）。
  if (!isObject(val)) return;
  return new Observer(val);
}


function Observer (val) {

  if (Array.isArray(val)) {
    // arrayMethods 中存储的是：重写的数组方法，例如：push、unshift 等。
    // 重写为了在更改数组中的数据时，做出更多操作。比如，通过 push 方法向数组中新添数据时，
    // 需要对新的数据进行观察，设置 getter/setter，否则它们将不能在后续的修改中做出反应。
    // 实际上，重写的数组方法，其内部依旧使用数组的原生方法来实现数据的增、删。

    val.__proto__ = arrayMethods; // 使用 __proto__ 拦截原型链来增加目标对象
    observeArray(val); // 观察数组（Array）的每一项
  } else {
    this.walk(val); // 观察对象（Object --> {}）
  }
}

// 遍历所有属性并将它们转换为 getter/setter。仅当值类型为 Object 时才应调用此方法
Observer.prototype.walk = function (data) {

  // Object.keys() 方法会返回一个由一个给定对象的自身可枚举属性组成的数组，
  // 数组中属性名的排列顺序和正常循环遍历该对象时返回的顺序一致 。
  const keys = Object.keys(data);
   
  for (let i = 0; i < keys.length; i ++) {

    const key = keys[i]; // 属性
    const value = data[key]; // 属性值

    // 在对象上定义一个反应性属性
    defineReactive(data, key, value);

  }

}

export default observe;