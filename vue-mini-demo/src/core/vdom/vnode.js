
// done: vnode（虚拟节点）类
export default class VNode {
    constructor(tag, data, children, text, elm, context) {
        this.tag = tag;
        this.data = data;
        this.children = children;
        this.text = text;
        this.elm = elm;
        this.context = context;
        this.key = data && data.key;
    }
}


// done: 创建空节点
export const createEmptyVNode = (text = '') => {
    const node = new VNode();
    node.text = text;
    node.isComment = true;
    return node;
}

// done: 创建文本 vnode
export function createTextVNode(text) {
    return new VNode(undefined, undefined, undefined, text);
}
// done: 解析双大括号中的表达式，例如：{{tip}} => tip
export function toString(value) {
    if (value === null) return;
    return typeof value === 'object' ? JSON.stringify(value) : value;
};
// done: 克隆节点对象。
//用于静态节点和槽节点，因为它们可以在多个渲染中重用，克隆它们可以避免DOM操作依赖它们的elm引用时出现错误。
export function cloneVNode(vnode) {
    const cloned = new VNode(
        vnode.tag,
        vnode.data,
        //克隆子数组，以避免在克隆子数组时发生原数组的突变。
        vnode.children && vnode.children.slice(),
        vnode.text,
        vnode.elm,
        vnode.context
    );

    cloned.key = vnode.key;

    cloned.isCloned = true;

    return cloned;
}