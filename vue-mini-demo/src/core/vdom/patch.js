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
        const node = new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm);
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
            vnode.elm = nodeOps.createTextNode(vnode.text);
            insert(parentElm, vnode.elm, refElm);
        }
    }
    // done: 验证 vnode.tag（标签）是否存在
    function isPatchable(vnode) {
        while (vnode.componentInstance) {
            vnode = vnode.componentInstance._vnode;
        }
        return isDef(vnode.tag);
    }

    // done: 创建子元素
    function createChildren(vnode, children, insertedVnodeQueue) {
        if (Array.isArray(children)) {
            // 检查 children 中的子节点是否有重复的 key 值
            checkDuplicateKeys(children);

            for (let i = 0; i < children.length; ++i) {
                createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
            }
        } else if (isPrimitive(vnode.text)) {
            // 是否为原始值
            nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text));
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
                // elm 之后不存在元素，也就是 ref 不存在
                nodeOps.appendChild(parent, elm);
            }
        }
    }

    // done: 移除节点
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
    function addVnodes(
        parentElm,
        refElm,
        vnodes,
        startIdx,
        endIdx,
        insertedVnodeQueue
    ) {
        for (; startIdx <= endIdx; ++startIdx) {
            createElm(
                vnodes[startIdx],
                insertedVnodeQueue,
                parentElm,
                refElm,
                false,
                vnodes,
                startIdx
            );
        }
    }
    // done: 找出 oldCh（旧节点数组）中和 node（新子节点的开始节点） 是同一个节点的元素，然后返回其索引
    function findIdxInOld(node, oldCh, start, end) {
        for (let i = start; i < end; i++) {
            const c = oldCh[i];
            if (isDef(c) && sameVnode(node, c)) return i;
        }
    }
    // done: 创建一个用旧节点的 key 和索引做为键与值的对象并返回
    function createKeyToOldIdx(children, beginIdx, endIdx) {
        let i, key;
        const map = {};
        for (i = beginIdx; i <= endIdx; ++i) {
            key = children[i].key;
            if (isDef(key)) map[key] = i;
        }
        return map;
    }
    // done: 判断是为相同的 vnode
    function sameVnode(a, b) {
        return a.key === b.key && a.tag === b.tag && isDef(a.data) === isDef(b.data);
    }
    // done: 更新节点
    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
        let oldStartIdx = 0; // 旧节点的开始节点索引
        let newStartIdx = 0; // 新子节点的开始节点索引
        let oldEndIdx = oldCh.length - 1; // 旧子节点的结束节点索引
        let oldStartVnode = oldCh[0]; // 旧子节点的开始节点
        let oldEndVnode = oldCh[oldEndIdx]; // 旧子节点的结束节点
        let newEndIdx = newCh.length - 1; // 新子节点的结束节点索引
        let newStartVnode = newCh[0]; // 新子节点的开始节点
        let newEndVnode = newCh[newEndIdx]; // 新子节点的结束节点
        let oldKeyToIdx, idxInOld, vnodeToMove, refElm;

        // removeOnly 是仅使用 <transition-group> 时的一个特殊标志，
        // 以确保在离开转换期间被移除的元素保持在正确的相对位置
        const canMove = !removeOnly;

        checkDuplicateKeys(newCh); // 检查 key 值是否重复

        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (isUndef(oldStartVnode)) {
                // oldStartVnode 向右移动
                oldStartVnode = oldCh[++oldStartIdx];
            } else if (isUndef(oldEndVnode)) {
                // oldEndVnode 向左移动
                oldEndVnode = oldCh[--oldEndIdx];
            } else if (sameVnode(oldStartVnode, newStartVnode)) {
                // oldStartVnode 和 newStartVnode 是同一个节点，则进行比较
                patchVnode(
                    oldStartVnode,
                    newStartVnode,
                    insertedVnodeQueue,
                    newCh,
                    newStartIdx
                );
                // oldStartVnode 和 newStartVnode 向右移动
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            } else if (sameVnode(oldEndVnode, newEndVnode)) {
                // oldEndVnode 和 newEndVnode 是同一个节点，则进行比较
                patchVnode(
                    oldEndVnode,
                    newEndVnode,
                    insertedVnodeQueue,
                    newCh,
                    newEndIdx
                );
                // oldEndVnode 和 newEndVnode 向左移动
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldStartVnode, newEndVnode)) {
                // oldStartVnode 和 newEndVnode 是同一个节点，则进行比较
                patchVnode(
                    oldStartVnode,
                    newEndVnode,
                    insertedVnodeQueue,
                    newCh,
                    newEndIdx
                );

                canMove &&
                    // 插入元素
                    nodeOps.insertBefore(
                        parentElm,
                        oldStartVnode.elm,
                        nodeOps.nextSibling(oldEndVnode.elm)
                    );

                // oldStartVnode 向右移动，newEndVnode 向左移动
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldEndVnode, newStartVnode)) {
                // oldEndVnode 和 newStartVnode 是同一个节点，则进行比较
                patchVnode(
                    oldEndVnode,
                    newStartVnode,
                    insertedVnodeQueue,
                    newCh,
                    newStartIdx
                );
                canMove &&
                    // 插入元素
                    nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                // oldEndVnode 向左移动，newStartVnode 向右移动
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            } else {
                if (isUndef(oldKeyToIdx)) {
                    // 创建一个以旧子节点的 key 和索引做为键与值的对象并返回
                    oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                }
                // 获取当前的旧子节点索引
                idxInOld = isDef(newStartVnode.key)
                    ? oldKeyToIdx[newStartVnode.key]
                    // 找出 oldCh（旧节点数组）中和 newStartVnode 是同一个节点的元素，然后返回其索引
                    : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);

                // 判断 idxInOld 是否存在
                if (isUndef(idxInOld)) {
                    // 创建新节点
                    createElm(
                        newStartVnode,
                        insertedVnodeQueue,
                        parentElm,
                        oldStartVnode.elm,
                        false,
                        newCh,
                        newStartIdx
                    );
                } else {
                    // 取出当前需要比较的旧子节点
                    vnodeToMove = oldCh[idxInOld];
                    // 是否为相同节点
                    if (sameVnode(vnodeToMove, newStartVnode)) {
                        patchVnode(
                            vnodeToMove,
                            newStartVnode,
                            insertedVnodeQueue,
                            newCh,
                            newStartIdx
                        );
                        // 更新比较后，排除当前旧子节点即设置为 undefined，不在比较它。
                        oldCh[idxInOld] = undefined;
                        canMove &&
                            // 插入元素
                            nodeOps.insertBefore(
                                parentElm,
                                vnodeToMove.elm,
                                oldStartVnode.elm
                            );
                    } else {
                        // 相同的 key，但却是不同的元素。视为新元素。
                        createElm(
                            newStartVnode,
                            insertedVnodeQueue,
                            parentElm,
                            oldStartVnode.elm,
                            false,
                            newCh,
                            newStartIdx
                        );
                    }
                }
                // newStartVnode 向右移动
                newStartVnode = newCh[++newStartIdx];
            }
        }

        // 退出循环后（即新或旧子节点数组有一个已被查找完），若 oldStartIdx > oldEndIdx，
        // 则说明新节点数组中有剩余节点，需要新增。若 newStartIdx > newEndIdx，则说明旧节
        // 点数组中有剩余，需要删除。
        if (oldStartIdx > oldEndIdx) {
            refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
            addVnodes(
                parentElm,
                refElm,
                newCh,
                newStartIdx,
                newEndIdx,
                insertedVnodeQueue
            );
        } else if (newStartIdx > newEndIdx) {
            removeVnodes(oldCh, oldStartIdx, oldEndIdx);
        }
    }

    function patchVnode(
        oldVnode,
        vnode,
        insertedVnodeQueue,
        ownerArray,
        index,
        removeOnly
    ) {
        // 新旧节点相同即同一个对象，则停止比较
        if (oldVnode === vnode) {
            return;
        }

        if (isDef(vnode.elm) && isDef(ownerArray)) {
            // 克隆重用 vnode。这是 diff 中使用的一种叫就地复用的策略。
            // 它指的是尽可能复用之前的 dom，以便在渲染真实 dom 时，减少对 dom 的操作。
            vnode = ownerArray[index] = cloneVNode(vnode);
        }

        const elm = (vnode.elm = oldVnode.elm);

        let i;
        const data = vnode.data;
        const oldCh = oldVnode.children;
        const ch = vnode.children;

        // vnode 中的 data 和 tag 属性同时为真，则对其属性（class、style等）进行更新
        if (isDef(data) && isPatchable(vnode)) {
            for (i = 0; i < cbs.update.length; ++i) {
                cbs.update[i](oldVnode, vnode);
            }
        }

        // vnode.text 为 undefined 或 null
        if (isUndef(vnode.text)) {
            // oldVnode 和 vnode 都有子节点且不相等,则更新子节点
            if (isDef(oldCh) && isDef(ch)) {
                if (oldCh !== ch) {
                    updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
                }
            } else if (isDef(ch)) { // 只有 vnode 有子节点，则将其子节点添加到elm

                checkDuplicateKeys(ch); // 检测 key 是否重复

                if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, ''); // 将elm置空

                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);

            } else if (isDef(oldCh)) { // 只有 oldVnode 有子节点，则删除其子节点

                removeVnodes(oldCh, 0, oldCh.length - 1);

            } else if (isDef(oldVnode.text)) {

                nodeOps.setTextContent(elm, '');  // 将elm置空
            }

        } else if (oldVnode.text !== vnode.text) {
            // 若是 vnode 和 oldVnode 都有属性 text（文本节点）并且不相等，则将 vnode.text 赋值给elm
            nodeOps.setTextContent(elm, vnode.text);
        }

    }

    /**
     done: 将 vnode 虚拟节点生成相应的 HTML 元素
     * @param { HTMLDivElement } oldVnode => html
     * @param { Object } vnode => 虚拟节点对象
     */
    return function patch(oldVnode, vnode) {
        console.log('path---->执行', oldVnode, vnode);

        const insertedVnodeQueue = []; // 存储已插入的 vnode 的队列(未实现，所以暂时用不到)

        // 老节点不存在
        if (isUndef(oldVnode)) {
            // empty mount (likely as component), create new root element
            // isInitialPatch = true;
            // createElm(vnode, insertedVnodeQueue);
        } else {
            // 是否为真实元素
            const isRealElement = isDef(oldVnode.nodeType);

            // 不是真实元素且新旧虚拟节点是同一个对象，则进行修补更新现有的根节点
            if (!isRealElement && sameVnode(oldVnode, vnode)) {
                console.log('开始-----------了');
                // 修补现有的根节点
                patchVnode(oldVnode, vnode);
            } else {
                if (isRealElement) {
                    // 创建一个空节点替换 oldVnode
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
        }

        return vnode.elm;
    };
}
