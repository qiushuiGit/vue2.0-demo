import { getAndRemoveAttr, getBindingAttr } from '../../../compiler/parser/helpers';
import { parseStyleText } from '../util/style';

// 处理 style 静态绑定和动态绑定。
function transformNode(el) {
  const staticStyle = getAndRemoveAttr(el, 'style');
  if (staticStyle) {
    el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
  }

  const styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
  if (styleBinding) {
    el.styleBinding = styleBinding;
  }
}

// 分别拼接 style 静态和动态属性
function genData(el) {
  let data = '';
  if (el.staticStyle) {
    data += `staticStyle:${el.staticStyle},`;
  }
  if (el.styleBinding) {
    data += `style:(${el.styleBinding}),`;
  }
  return data;
}

export default {
  staticKeys: ['staticStyle'],
  transformNode,
  genData
};
