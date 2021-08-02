/**
 * 样例展示：结合 patch函数中的 insertBefore 和 removeChild 方法看
 * <body>
 *  <div id="app"></div> 原有的
 *  <div id="app"></div> 新生成的
 *  <script></script>
 * </body>
 * 
 */

/**
 * 将 vnode 虚拟节点生成相应的 HTML 元素
 * @param { HTMLDivElement } template => html
 * @param { Object } vNode => 虚拟节点对象
 */ 
function patch(template, vNode) {
  const el = createElement(vNode);
  // template.parentNode => body
  const parentElement = template.parentNode;
  // 将新生成的元素插入到 body中。在 template 的后面，script标签的前面。
  parentElement.insertBefore(el, template.nextSibling);
  parentElement.removeChild(template); // 移除原有节点
}

// 创建节点（为求简便，逻辑上并未最求严谨，但是它能跑！）
function createElement(vnode) {
  const { tag, props, children, text } = vnode;

  if (typeof tag === 'string') {
    vnode.el = document.createElement(tag); // 创建元素
    updateProps(vnode); // 为元素设置属性
    children.map((child) => {
      // 为父级元素添加子元素
      vnode.el.appendChild(createElement(child));
    })
  } else {
    // 创建纯文本节点
    vnode.el = document.createTextNode(text);
  }

  return vnode.el;
}

// 为元素设置属性，这里主要处理了 style 和 class
function updateProps(vnode) {
  const el = vnode.el;
  const nodeAttrs = vnode.props || {};

  for (let key in nodeAttrs) {
    if (key === 'style') { // 设置 style 属性
      for (let sKey in nodeAttrs.style) {
        el.style[sKey] = nodeAttrs.style[sKey];
      }
    } else if (key === 'class') { // 设置 class 属性
      el.className = el.class;
    } else {
      // 设置自定义属性，并未做特殊处理
      el.setAttribute(key, nodeAttrs[key]);
    }
  }
}

export {
  patch
}