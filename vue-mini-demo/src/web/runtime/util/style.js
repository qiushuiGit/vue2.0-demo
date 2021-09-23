import { cached, extend, toObject } from "../../../shared/util";

// done: 解析 style 文本（cached 用于创建一个纯函数的缓存）
export const parseStyleText = cached(function (cssText) {
  const res = {};
  const listDelimiter = /;(?![^(]*\))/g; // 匹配分号
  const propertyDelimiter = /:(.+)/; // 匹配冒号

  // 以分号进行分割
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      const tmp = item.split(propertyDelimiter); // 以冒号进行分割
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return res;
});

// done: 合并同一个 vnode 的静态和动态 style
function normalizeStyleData(data) {
  const style = normalizeStyleBinding(data.style);
  // 静态样式在编译期间被预处理为对象，并且始终是一个新对象，以便合并到其中是安全的
  return data.staticStyle ? extend(data.staticStyle, style) : style;
}

// done: 将可能的数组或字符串值规范化为 Object
export function normalizeStyleBinding(bindingStyle) {
  // 数组
  if (Array.isArray(bindingStyle)) {
    return toObject(bindingStyle); // 将对象数组合并为单个对象
  }
  // 字符串
  if (typeof bindingStyle === "string") {
    return parseStyleText(bindingStyle); // 解析 style 字符串
  }
  return bindingStyle;
}

// done: 获取 style 样式
// 父组件的样式应该在子组件的样式之后，以便父组件的样式可以覆盖它
export function getStyle(vnode, checkChild) {
  const res = {};
  let styleData;

  if (checkChild) { // 为真，则检查子节点
    let childNode = vnode;

    // 子节点是否为组件
    while (childNode.componentInstance) { 
      childNode = childNode.componentInstance._vnode; // 子组件节点
      if (
        childNode &&
        childNode.data &&
        (styleData = normalizeStyleData(childNode.data))
      ) {
        extend(res, styleData); // 混合属性到目标对象中
      }
    }
  }

  if ((styleData = normalizeStyleData(vnode.data))) {
    extend(res, styleData); // 混合属性到目标对象中
  }

  let parentNode = vnode;
  // 存在父节点
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
      extend(res, styleData);
    }
  }
  return res;
}
