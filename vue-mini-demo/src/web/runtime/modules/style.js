import { getStyle, normalizeStyleBinding } from "../util/style";
import {
  cached,
  camelize,
  extend,
  isDef,
  isUndef,
  hyphenate,
} from "../../../shared/util";

const cssVarRE = /^--/;
const importantRE = /\s*!important$/;

const setProp = (el, name, val) => {
  // cssVarRE 是针对使用 了CSS 自定义属性（变量）的情况，例如：element { color: var(--bg-color);}
  // 相关文档：https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties
  if (cssVarRE.test(name)) {
    el.style.setProperty(name, val);
  } else if (importantRE.test(val)) {
    // 设置属性的同时，规定其优先级为 'important'
    el.style.setProperty(
      hyphenate(name),
      val.replace(importantRE, ""),
      "important"
    );
  } else {
    const normalizedName = normalize(name); // 规范化 style 属性名
    if (Array.isArray(val)) {
      // style 绑定中的 property 提供一个包含多个值的数组，常用于提供多个带前缀的值，例如：
      // <div :style="{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }"></div>
      // 逐个设置，浏览器将只设置它能识别的。如果浏览器支持不带浏览器前缀的 flexbox，
      // 那么就只会渲染 display: flex
      for (let i = 0, len = val.length; i < len; i++) {
        el.style[normalizedName] = val[i];
      }
    } else {
      el.style[normalizedName] = val;
    }
  }
};
// -moz --> Firefox浏览器  -webkit --> Chrome 和 Safari浏览器  -ms --> IE浏览器
const vendorNames = ["Webkit", "Moz", "ms"];

let emptyStyle;
// cached 用于创建一个纯函数的缓存
const normalize = cached(function (prop) {
  // 获取 style（ CSSStyleDeclaration 样式声明对象 ）上的所有属性
  emptyStyle = emptyStyle || document.createElement("div").style;

  // 将连字符分隔的字符串驼峰化，例如：background-color --> backgroundColor
  prop = camelize(prop);

  // 不是 filter 且存在于 emptyStyle 中
  if (prop !== "filter" && prop in emptyStyle) {
    return prop;
  }

  // 若是走到这，则说明是 filter
  const capName = prop.charAt(0).toUpperCase() + prop.slice(1);
  for (let i = 0; i < vendorNames.length; i++) {
    // 拼接上各个浏览器的前缀，例如：WebkitFilter
    const name = vendorNames[i] + capName;
    // 再次判断是否存在于 emptyStyle 中
    if (name in emptyStyle) {
      return name;
    }
  }
});

// done: 更新 style
function updateStyle(oldVnode, vnode) {
  const data = vnode.data;
  const oldData = oldVnode.data;

  // 判断新旧节点是否有 staticStyle 和 style
  if (
    isUndef(data.staticStyle) &&
    isUndef(data.style) &&
    isUndef(oldData.staticStyle) &&
    isUndef(oldData.style)
  ) {
    return;
  }

  let cur, name;
  const el = vnode.elm;
  const oldStaticStyle = oldData.staticStyle; // 旧的静态 style
  const oldStyleBinding = oldData.normalizedStyle || oldData.style || {}; // 旧的动态 style

  // 获取 style 的老样式
  const oldStyle = oldStaticStyle || oldStyleBinding;
  // 规范化 style 样式
  const style = normalizeStyleBinding(vnode.data.style) || {};

  // 提示：__ob__ 指的是 Observe 类，可参考相关文件路径：src/core/observe/index.js

  // 存储规范化样式在一个不同的键下，以便下一次 diff
  // 如果它是响应性的（style.__ob__），请确保克隆它，因为用户可能想要改变它
  vnode.data.normalizedStyle = isDef(style.__ob__) ? extend({}, style) : style;

  // 获取 style 样式
  const newStyle = getStyle(vnode, true);

  for (name in oldStyle) {
    // 旧的样式属性在新样式中不存在，则设置 style 属性为空
    if (isUndef(newStyle[name])) {
      setProp(el, name, "");
    }
  }
  for (name in newStyle) {
    cur = newStyle[name];
    // 新旧样式属性不重复，则设置 style 属性
    if (cur !== oldStyle[name]) {
      // Ie9设置为空没有效果，必须使用空字符串
      setProp(el, name, cur == null ? "" : cur);
    }
  }
}

export default {
  create: updateStyle,
  update: updateStyle,
};
