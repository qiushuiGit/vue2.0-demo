import { isUndef, isDef, isPrimitive } from '../../shared/util';
import VNode, { cloneVNode } from './vnode';

/**
 * 样例展示：结合 patch函数中的 insertBefore 和 removeChild 方法看
 * <body>
 *  <div id="app"></div> 原有的
 *  <div id="app"></div> 新生成的
 *  <script></script>
 * </body>
 *
 */

export const emptyNode = new VNode('', {}, []); // 创建空的虚拟节点对象
const hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

// done: 创建 patch 函数
export function createPatchFunction(backend) {
    let i, j;
    const cbs = {};

    // modules 对象中存储着处理 attrs、class 和 style等方法
    // nodeOps 对象中存储着 HTML DOM 方法。例如，document.createElement()
    const { modules, nodeOps } = backend;

    // 整合 modules 中的函数并将它们存在 cbs 对象中
    for (i = 0; i < hooks.length; ++i) {
        cbs[hooks[i]] = [];
        for (j = 0; j < modules.length; ++j) {
            if (isDef(modules[j][hooks[i]])) {
                cbs[hooks[i]].push(modules[j][hooks[i]]);
            }
        }
    }
    
    // done: 创建虚拟节点对象
    function emptyNodeAt(elm) {
        const node = new VNode(
            nodeOps.tagName(elm).toLowerCase(),
            {},
            [],
            undefined,
            elm
        );
        return node;
    }
    // done: 调用 cbs.create 数组中函数(主要用于处理 class、style、指令等)
    function invokeCreateHooks(vnode, insertedVnodeQueue) {
        for (let i = 0; i < cbs.create.length; ++i) {
            cbs.create[i](emptyNode, vnode);
        }
    }
    // done: 创建元素
    function createElm(
        vnode, // 虚拟节点对象
        insertedVnodeQueue, // 存储已插入的 vnode 的队列
        parentElm, // vnode.elm 父元素
        refElm, // 紧跟在 vnode.elm 之后的元素
        nested,
        ownerArray,
        index
    ) {
        if (isDef(vnode.elm) && isDef(ownerArray)) {
            // 这个 vnode 在之前的渲染中使用过!
            // 现在它被用作一个新节点，当它被用作插入参考节点时，覆盖它的 elm 会导致潜在的补丁错误。
            // 相反，我们在为节点创建相关的 DOM 元素之前按需克隆节点。
            vnode = ownerArray[index] = cloneVNode(vnode);
        }

        const data = vnode.data; // 获取元素属性
        const children = vnode.children; // 获取子元素
        const tag = vnode.tag; // 获取标签

        // 元素节点
        if (isDef(tag)) {
            vnode.elm = nodeOps.createElement(tag, vnode);
            // console.log('元素节点------>', vnode);
            // 创建子元素
            createChildren(vnode, children, insertedVnodeQueue);
            if (isDef(data)) {
                // 处理元素上的各种属性
                invokeCreateHooks(vnode, insertedVnodeQueue);
            }
            // 插入元素
            insert(parentElm, vnode.elm, refElm);
        } else {
            // 纯文本节点
            // console.log('文本节点------>', vnode);
            vnode.elm = nodeOps.createTextNode(vnode.text);
            insert(parentElm, vnode.elm, refElm);
        }
    }

    // DONE 创建子元素
    function createChildren(vnode, children, insertedVnodeQueue) {
        if (Array.isArray(children)) {
            // 检查 children 中的子节点是否有重复的 key 值
            checkDuplicateKeys(children);

            for (let i = 0; i < children.length; ++i) {
                createElm(
                    children[i],
                    insertedVnodeQueue,
                    vnode.elm,
                    null,
                    true,
                    children,
                    i
                );
            }
        } else if (isPrimitive(vnode.text)) { // 是否为原始值
            nodeOps.appendChild(
                vnode.elm,
                nodeOps.createTextNode(vnode.text)
            );
        }
    }

    // done: 检查 key 值是否重复
    function checkDuplicateKeys(children) {
        const seenKeys = {};
        for (let i = 0; i < children.length; i++) {
            const vnode = children[i];
            const key = vnode.key;

            if (isDef(key)) {
                if (seenKeys[key]) {
                    console.log(
                        // 检测到重复键:'${key}'。这可能会导致更新错误。
                        `Duplicate keys detected: '${key}'. This may cause an update error.`,
                        vnode.context
                    );
                } else {
                    seenKeys[key] = true;
                }
            }
        }
    }
    // done: 插入元素
    function insert(parent, elm, ref) {
        // 存在父级
        if (isDef(parent)) {
            // elm 之后存在元素（有同级的兄弟元素）
            if (isDef(ref)) {
                // elm 和 ref 元素的父级元素是同一个（elm 和 ref是同级兄弟元素）
                if (nodeOps.parentNode(ref) === parent) {
                    nodeOps.insertBefore(parent, elm, ref);
                }
            } else {
                // elm 之后不存在元素
                nodeOps.appendChild(parent, elm);
            }
        }
    }

    // DONE 移除节点
    function removeVnodes(vnodes, startIdx, endIdx) {
        for (; startIdx <= endIdx; ++startIdx) {
            const ch = vnodes[startIdx];
            if (isDef(ch)) {
                removeNode(ch.elm);
            }
        }
    }

    function removeNode(el) {
        const parent = nodeOps.parentNode(el);
        // 元素可能已经由于 v-html 或 v-text而被删除
        if (isDef(parent)) {
            nodeOps.removeChild(parent, el);
        }
    }

    /**
     * DONE 将 vnode 虚拟节点生成相应的 HTML 元素
     * @param { HTMLDivElement } oldVnode => html
     * @param { Object } vnode => 虚拟节点对象
     */
    return function patch(oldVnode, vnode) {
        console.log("path---->执行", oldVnode, vnode);

        const insertedVnodeQueue = [];

        // 老节点不存在
        if (isUndef(oldVnode)) {
            // empty mount (likely as component), create new root element
            // isInitialPatch = true;
            // createElm(vnode, insertedVnodeQueue);
        } else {
            // 是否为真实元素
            const isRealElement = isDef(oldVnode.nodeType);

            if (isRealElement) {
                // 创建空节点对象（初始化部分数据）
                oldVnode = emptyNodeAt(oldVnode);
            }

            // 替换现有的 element
            const oldElm = oldVnode.elm;
            const parentElm = nodeOps.parentNode(oldElm); // 获取 oldElm 父元素

            // 创建新节点
            createElm(
                vnode,
                insertedVnodeQueue,
                parentElm,
                // 返回紧跟 oldElm 之后的元素
                nodeOps.nextSibling(oldElm)
            );

            // 销毁旧节点
            if (isDef(parentElm)) {
                console.log('执行销毁操作--->', oldVnode);
                removeVnodes([oldVnode], 0, 0);
            }

        }

        return vnode.elm;
    };
}
