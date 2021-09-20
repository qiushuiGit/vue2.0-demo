// 元素 vnode
function createElement (tag, attrs = {}, ...children) {
  return vnode(tag, attrs, children);
}
// 文本 vnode
function createTextNode (text) {
  return vnode(undefined, undefined, undefined, text);
}

// vnode（虚拟节点）对象
function vnode (tag, props, children, text) {
  return {
    tag,
    props,
    children,
    text
  }
}

export {
  createElement,
  createTextNode
}