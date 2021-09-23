// done:: 是否存在 __proto__
export const hasProto = "__proto__" in {};

// done: 将连字符分隔的字符串驼峰化，例如：background-color --> backgroundColor
const camelizeRE = /-(\w)/g;
export const camelize = cached((str) => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ""));
});

// done: 用连字符连接驼峰字符串
const hyphenateRE = /\B([A-Z])/g;
export const hyphenate = cached((str) => {
  return str.replace(hyphenateRE, "-$1").toLowerCase();
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
  return obj !== null && typeof obj === "object";
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
  typeof Symbol !== "undefined" &&
  isNative(Symbol) &&
  typeof Reflect !== "undefined" &&
  isNative(Reflect.ownKeys);

export function isNative(Ctor) {
  return typeof Ctor === "function" && /native code/.test(Ctor.toString());
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
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "symbol" ||
    typeof value === "boolean"
  );
}

// done: 制作一个映射，并返回一个函数来检查键是否在该映射中。
export function makeMap(str, expectsLowerCase) {
  const map = Object.create(null);
  const list = str.split(",");

  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }

  return expectsLowerCase ? (val) => map[val.toLowerCase()] : (val) => map[val];
}

export function isTrue(v) {
  return v === true;
}

export function isFalse(v) {
  return v === false;
}
