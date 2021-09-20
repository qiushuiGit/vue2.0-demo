import { makeMap } from '../../../shared/util';

export const isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

// DONE 是否为假值
export const isFalsyAttrValue = (val) => {
  return val == null || val === false;
};
