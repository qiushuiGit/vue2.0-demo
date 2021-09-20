
import { createTextVNode } from '../vnode'
import { isFalse, isTrue, isDef, isUndef, isPrimitive } from '../../../shared/util'

// 模板编译器试图通过在编译时静态分析模板来最小化规范化的需要。
// 对于普通的HTML标记，可以完全跳过标准化，因为生成的渲染函数保证返回 Array<VNode>。
// 且有两种情况需要额外的规范化:

// 1. 当子组件包含组件时——因为函数组件可能返回Array而不是单个根。
// 在这种情况下，只需要一个简单的标准化——如果任何子元素是Array，我们就用Array.prototype.concat将整个元素平化。
// 它保证只有一级深度，因为功能组件已经规范化了它们自己的子组件。

// 2. 当子元素包含总是生成嵌套数组的构造时，例如：<template>, <slot>, v-for 或者当用户用手写的 render函数 / JSX 提供子对象时。
// 在这种情况下，需要完全标准化，以满足所有可能类型的子元素值。

// done: 对 children 进行完全标准化
// normalizeChildren 用于第二种情况，且在目前的代码中只做了对 v-for 的处理
export function normalizeChildren(children) {
    return isPrimitive(children)
        ? [createTextVNode(children)]
        : Array.isArray(children)
            ? normalizeArrayChildren(children)
            : undefined;
}

// done: 是否为文本节点
function isTextNode(node) {
    return isDef(node) && isDef(node.text) && isFalse(node.isComment);
}

// done: 标准化数组子元素
function normalizeArrayChildren(children, nestedIndex) {
    const res = [];
    let i, c, lastIndex, last;
    for (i = 0; i < children.length; i++) {
        c = children[i];
        if (isUndef(c) || typeof c === 'boolean') continue;
        lastIndex = res.length - 1;
        last = res[lastIndex];

        //  处理嵌套
        if (Array.isArray(c)) {
            if (c.length > 0) {
                c = normalizeArrayChildren(c, `${nestedIndex || ''}_${i}`)
                // 合并相邻文本节点
                if (isTextNode(c[0]) && isTextNode(last)) {
                    res[lastIndex] = createTextVNode(last.text + (c[0]).text)
                    c.shift()
                }
                res.push.apply(res, c)
            }
        } else if (isPrimitive(c)) { // 是否为原始值

            if (isTextNode(last)) {
                // 合并相邻的文本节点，这对于 SSR hydration 是必要的，
                // 因为文本节点在呈现为HTML字符串时本质上是合并的
                res[lastIndex] = createTextVNode(last.text + c)
            } else if (c !== '') {
                // 将 primitive 转换为 vnode
                res.push(createTextVNode(c))
            }
        } else {
            if (isTextNode(c) && isTextNode(last)) {
                // 合并相邻的文本节点
                res[lastIndex] = createTextVNode(last.text + c.text)
            } else {
                // 嵌套数组子数组的默认键(可能由v-for生成)
                if (isTrue(children._isVList) &&
                    isDef(c.tag) &&
                    isUndef(c.key) &&
                    isDef(nestedIndex)) {
                    c.key = `__vlist${nestedIndex}_${i}__`
                }
                res.push(c)
            }
        }
    }

    return res
}
