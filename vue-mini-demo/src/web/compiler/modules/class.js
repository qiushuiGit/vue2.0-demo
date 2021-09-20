import { getAndRemoveAttr, getBindingAttr } from '../../../compiler/parser/helpers';

// 处理 class 静态绑定和动态绑定。
function transformNode(el) {
  const staticClass = getAndRemoveAttr(el, 'class');
  if (staticClass) {
    // console.log('这是静态class', staticClass);
    el.staticClass = JSON.stringify(staticClass);
  }

  const classBinding = getBindingAttr(el, 'class', false /* getStatic */);

  if (classBinding) {
    el.classBinding = classBinding;
  }
}

// 分别拼接 class 静态和动态属性
function genData(el) {
  let data = '';
  if (el.staticClass) {
    data += `staticClass:${el.staticClass},`;
  }
  if (el.classBinding) {
    data += `class:${el.classBinding},`;
  }
  return data;
}

export default {
  staticKeys: ['staticClass'],
  transformNode,
  genData
};
