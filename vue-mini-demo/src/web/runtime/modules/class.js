import { isUndef } from '../../../shared/util';
import { genClassForVnode } from '../util/class';

// 更新 class
function updateClass(oldVnode, vnode) {
    const el = vnode.elm;
    const data = vnode.data;
    const oldData = oldVnode.data;
    
    // 判断新旧节点是否有 staticClass 和 class
    if (
        isUndef(data.staticClass) &&
        isUndef(data.class) &&
        (isUndef(oldData) ||
            (isUndef(oldData.staticClass) && isUndef(oldData.class)))
    ) {
        return;
    }

    // 获取 class 的值
    let cls = genClassForVnode(vnode);

    // 如果当前元素的 class 和其上一个设置的class 名相同，则不在重复设置
    if (cls !== el._prevClass) {
        el.setAttribute('class', cls);
        el._prevClass = cls;
    }
}

export default {
    create: updateClass,
    update: updateClass
};
