/* HTML DOM 方法 */

// DONE 通过指定名称创建一个元素
export function createElement(tagName, vnode) {
  const elm = document.createElement(tagName);
  if (tagName !== 'select') {
    return elm;
  }
  // false 或 null 将删除该属性，但 undefined 不会
  if (
    vnode.data &&
    vnode.data.attrs &&
    vnode.data.attrs.multiple !== undefined
  ) {
    elm.setAttribute('multiple', 'multiple');
  }
  return elm;
}

// DONE 创建一个具有指定的命名空间URI和限定名称的元素
// export function createElementNS(namespace, tagName) {
//   return document.createElementNS(namespaceMap[namespace], tagName);
// }

// DONE 创建文本节点
export function createTextNode(text) {
  return document.createTextNode(text);
}

// DONE 创建注释节点
export function createComment(text) {
  return document.createComment(text);
}

// DONE 在已有的子节点前插入一个新的子节点
export function insertBefore(parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

// DONE 从子节点列表中删除某个节点
export function removeChild(node, child) {
  node.removeChild(child);
}

// DONE 向节点的子节点列表的末尾添加新的子节点
// 提示：如果文档树中已经存在了 newchild，它将从文档树中删除，然后重新插入它的新位置。
// 如果 newchild 是 DocumentFragment 节点，则不会直接插入它，而是把它的子节点按序插入当前节点的 childNodes[] 数组的末尾。
// 你可以使用 appendChild() 方法移除元素到另外一个元素。
export function appendChild(node, child) {
  node.appendChild(child);
}
// DONE 可返回某节点的父节点
export function parentNode(node) {
  return node.parentNode;
}

// DONE 返回某个元素之后紧跟的节点（处于同一树层级中）
export function nextSibling(node) {
  return node.nextSibling;
}

// DONE 获取元素的标签名
export function tagName(node) {
  return node.tagName;
}

// DONE 设置或者返回指定节点的文本内容
// 如果你设置了 textContent 属性, 任何的子节点会被移除及被指定的字符串的文本节点替换
export function setTextContent(node, text) {
  node.textContent = text;
}

// DONE 创建或改变某个新属性。如果指定属性已经存在,则只设置该值
export function setStyleScope(node, scopeId) {
  node.setAttribute(scopeId, '');
}
