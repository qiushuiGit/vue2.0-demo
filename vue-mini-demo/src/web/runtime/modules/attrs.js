import { isUndef } from '../../../shared/util';
import { isEnumeratedAttr, isFalsyAttrValue } from '../util/attrs';

function updateAttrs(oldVnode, vnode) {
  // 新旧虚拟节点都不存在 attr
  if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
    return;
  }

  let key, cur, old;
  const elm = vnode.elm;
  const oldAttrs = oldVnode.data.attrs || {};
  let attrs = vnode.data.attrs || {};

  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];

    // 新旧虚拟节点属性不同
    if (old !== cur) {
      setAttr(elm, key, cur);
    }
  }

  for (key in oldAttrs) {
    // attrs[key] 为 undefined 或 null
    if (isUndef(attrs[key])) {
      // key 值不是 contenteditable、draggable 和 spellcheck
      if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key); // 删除空属性
      }
    }
  }
}

// 设置属性
function setAttr(el, key, value) {
  baseSetAttr(el, key, value);
}

function baseSetAttr(el, key, value) {
  // 若是假值，则删除属性
  if (isFalsyAttrValue(value)) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
}

export default {
  create: updateAttrs,
  update: updateAttrs
};
