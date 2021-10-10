import Dep from './dep';
import { arrayMethods } from './array';
import {
  isObject,
  def,
  hasProto,
  hasOwn,
  isPlainObject,
} from '../../shared/util';

// 返回一个由指定对象的所有自身属性的属性名（包括不可枚举属性但不包括Symbol值作为名称的属性）组成的数组。
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

// done: 尝试为某个值创建一个观察实例，
// 如果成功地观察到，返回新的观察者，如果值已经有观察者，则返回现有的观察者。
export function observe(value, asRootData) {
  // 检查 value 是否为对象（注意：在 js 中，数组也是对象，isObject 方法并不排除数组）。
  if (!isObject(value)) return;

  let ob;
  // 检查对象是否具有 '__ob__' 属性且是一个观察者实例
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__; // 返回现有的观察实例
  } else if (
    // isPlainObject 判断值是否是普通对象，指其原始类型字符串是不是 [object object]
    (Array.isArray(value) || isPlainObject(value)) &&
    // Object.isExtensible() 方法判断一个对象是否是可扩展的（是否可以在它上面添加新的属性）。
    Object.isExtensible(value) &&
    // _isVue 是一个要被观察的标志
    !value._isVue
  ) {
    ob = new Observer(value); // 返回新的观察实例
  }

  if (asRootData && ob) {
    ob.vmCount++; // 记录实例个数
  }

  return ob;
}

// done: 附加到每个被观察对象的观察者类。
// 一旦附加，观察者将目标对象的属性键转换为收集依赖项和分派更新的 getter/setter。
export class Observer {
  constructor(value) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;

    // 为当前 value 定义 __ob__ 属性，其值为 this（即当前 Observer 类）
    def(value, '__ob__', this);

    if (Array.isArray(value)) {
      // 以是否存在 __proto__ 来判断使用何种方法增加扩充目标对象或数组
      if (hasProto) {
        protoAugment(value, arrayMethods);
      } else {
        copyAugment(value, arrayMethods, arrayKeys);
      }

      // 观察数组（Array）
      this.observeArray(value);
    } else {
      // 观察对象（Object)
      this.walk(value);
    }
  }

  // done: 遍历所有属性并将它们转换为 getter/setter。
  // 仅当值类型为 Object 时才应调用此方法
  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]; // 属性
      const value = obj[key]; // 属性值
      defineReactive(obj, key, value);
    }
  }

  // done: 观察数组（Array）的每一项
  observeArray(items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  }
}
// done: 定义响应式属性
function defineReactive(obj, key, val, customSetter, shallow) {
  // 创建订阅器
  const dep = new Dep();
  // Object.getOwnPropertyDescriptor 方法返回指定对象上一个自有属性对应的属性描述符（自有属性指的是
  // 直接赋予该对象的属性，不需要从原型链上进行查找的属性）。
  const property = Object.getOwnPropertyDescriptor(obj, key);
  // 属性存在且不可配置，则阻止运行
  if (property && property.configurable === false) {
    return;
  }

  // 预定义 getter/setter
  const getter = property && property.get;
  const setter = property && property.set;
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key];
  }

  // 递归观察 val, 它可能是一个对象（shallow，控制是否递归）
  let childOb = !shallow && observe(val);

  // Object.defineProperty() 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。
  // 它是实现数据劫持的关键所在。
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val;
      // Dep.target 当前目标订阅者
      if (Dep.target) {
        // 添加到订阅器
        dep.depend(); 
        // 子观察实例
        if (childOb) {
          childOb.dep.depend();
          if (Array.isArray(value)) {
            dependArray(value); // 收集数组元素上的依赖项
          }
        }
      }

      return value;
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val;
      // 同名属性，不需要重新赋值或观察
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return;
      }

      // 自定义setter
      if (customSetter) {
        customSetter();
      }

      // 对于没有 setter 的访问器属性，则阻止运行
      if (getter && !setter) return;

      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }

      // 递归观察 newVal，它可能是一个对象
      childOb = !shallow && observe(newVal);

      dep.notify(); // 通知更新
    },
  });
}

// done: 通过使用 __proto__ 截取原型链来增加目标对象或数组
function protoAugment(target, src) {
  target.__proto__ = src;
}

// done: 通过定义隐藏属性来扩充目标对象或数组
function copyAugment(target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    def(target, key, src[key]);
  }
}

// 当数组被接触时，收集数组元素上的依赖项，因为我们不能像属性getter那样截取数组元素访问。
function dependArray(value) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e); // 递归
    }
  }
}
