import { isUndef } from '../../../shared/util';
import { genClassForVnode } from '../util/class';

function updateClass(oldVnode, vnode) {
  const el = vnode.elm;
  const data = vnode.data;
  const oldData = oldVnode.data;

  if (
    isUndef(data.staticClass) &&
    isUndef(data.class) &&
    (isUndef(oldData) ||
      (isUndef(oldData.staticClass) && isUndef(oldData.class)))
  ) {
    return;
  }

  let cls = genClassForVnode(vnode);

  // 设置 class
  if (cls !== el._prevClass) {
    el.setAttribute('class', cls);
    el._prevClass = cls;
  }
}

export default {
  create: updateClass,
  update: updateClass
};
