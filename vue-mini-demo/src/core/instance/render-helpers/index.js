
import { createTextVNode, toString } from '../../vdom/vnode'
import { createElement } from '../../vdom/create-element'
import { renderList } from './render-list'


export function installRenderHelpers (target) {
  target._v = createTextVNode;
  target._c = createElement;
  target._s = toString;
  target._l = renderList;
}
