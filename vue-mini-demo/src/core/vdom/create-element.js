import VNode from "./vnode";

import { isTrue, isPrimitive } from "../../shared/util";
import { normalizeChildren } from "./helpers/index";

const SIMPLE_NORMALIZE = 1;
const ALWAYS_NORMALIZE = 2;

// done: 创建元素 vnode 的包装器函数，提供更灵活的接口且不会被干扰
export function createElement(
    tag,
    data,
    children,
    normalizationType,
    alwaysNormalize
) {
    // data 是数组或原始值，则对数据进行替换。
    // 对于此处逻辑代码，建议结合生成的 render 渲染函数（看 Readme.md 文档）和 vue 官网文档-虚拟 DOM 章节进行理解(下方是链接)
    // https://cn.vuejs.org/v2/guide/render-function.html#%E8%99%9A%E6%8B%9F-DOM

    if (Array.isArray(data) || isPrimitive(data)) {
        // console.log("data是数组或原始值------------------->", tag, data, children);
        normalizationType = children;
        children = data;
        data = undefined;
    }

    // normalizationType 值: 1 代表简单标准化  2 代表完全标准化
    // alwaysNormalize 为 true，则需要对 children 进行完全标准化。
    if (isTrue(alwaysNormalize)) {
        normalizationType = ALWAYS_NORMALIZE;
    }

    return _createElement(tag, data, children, normalizationType);
}
// done: 创建元素 vnode
export function _createElement(tag, data, children, normalizationType) {
    // console.log("_createElement--->执行", tag, data, children);

    if (normalizationType === ALWAYS_NORMALIZE) {
        children = normalizeChildren(children); // children 需要完全标准化
    }

    let vnode;
    if (typeof tag === "string") {
        vnode = new VNode(tag, data, children, undefined, undefined);
    }

    return vnode;
}
