// done: 从数组中删除一个项
export function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}

// done: 获取值的原始类型字符串，例如，[object object]。
const _toString = Object.prototype.toString;

// done: 严格的对象类型检查。
// 仅对普通 JavaScript 对象返回 true。
export function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}

// done: 检查对象是否具有该属性
const hasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

// done:: 是否存在 __proto__
export const hasProto = '__proto__' in {};

// done: 将连字符分隔的字符串驼峰化，例如：background-color --> backgroundColor
const camelizeRE = /-(\w)/g;
export const camelize = cached((str) => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
});

// done: 用连字符连接驼峰字符串
const hyphenateRE = /\B([A-Z])/g;
export const hyphenate = cached((str) => {
  return str.replace(hyphenateRE, '-$1').toLowerCase();
});

// done: 定义一个属性
export function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}

// done: 对象检测
export function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

// done: 将对象数组合并为单个对象
export function toObject(arr) {
  const res = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res;
}
// done: 混合属性到目标对象中
export function extend(to, _from) {
  for (const key in _from) {
    to[key] = _from[key];
  }
  return to;
}

// done: 获取并删除（removeFromMap 为真） attrsMap 中的属性
export function getAndRemoveAttr(el, name, removeFromMap) {
  if (removeFromMap) {
    delete el.attrsMap[name];
  }
  return el.attrsMap[name];
}

// done: 创建一个纯函数的缓存
export function cached(fn) {
  const cache = Object.create(null);
  return function cachedFn(str) {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
}

// done: 判断 Symbol 和 Reflect 是否都存在
export const hasSymbol =
  typeof Symbol !== 'undefined' &&
  isNative(Symbol) &&
  typeof Reflect !== 'undefined' &&
  isNative(Reflect.ownKeys);

// done: native 代码实现的 built-in 函数 
export function isNative(Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
}

// done: 参数等于 undefined 或 null
export function isUndef(v) {
  return v === undefined || v === null;
}

// done: 参数不等于 undefined 和 null
export function isDef(v) {
  return v !== undefined && v !== null;
}

// done: 检查 value 是否为原始值
export function isPrimitive(value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  );
}

// done: 制作一个映射，并返回一个函数来检查键是否在该映射中。
export function makeMap(str, expectsLowerCase) {
  const map = Object.create(null);
  const list = str.split(',');

  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }

  return expectsLowerCase ? (val) => map[val.toLowerCase()] : (val) => map[val];
}
// done: 真
export function isTrue(v) {
  return v === true;
}
// done: 假
export function isFalse(v) {
  return v === false;
}

/**
  done: 在JavaScript中，您可以使用比函数预期更多的参数来调用函数。
 (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */
export function noop(a, b, c) {}

// done: 错误提示
export function warn(msg) {
  console.error(`[Vue warn]: ${msg}`);
}
// done: 一个只适用于原始键的非标准Set polyfill
export const _Set = (function () {
  function Set() {
    this.set = Object.create(null);
  }
  Set.prototype.has = function has(key) {
    return this.set[key] === true;
  };
  Set.prototype.add = function add(key) {
    this.set[key] = true;
  };
  Set.prototype.clear = function clear() {
    this.set = Object.create(null);
  };

  return Set;
})();

