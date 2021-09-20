/* @flow */

import { isDef, isObject } from '../../../shared/util';

export function genClassForVnode(vnode) {
  let data = vnode.data;

  return renderClass(data.staticClass, data.class);
}

export function renderClass(staticClass, dynamicClass) {
  if (isDef(staticClass) || isDef(dynamicClass)) {
    return concat(staticClass, stringifyClass(dynamicClass));
  }

  return '';
}

export function concat(a, b) {
  return a ? (b ? a + ' ' + b : a) : b || '';
}

export function stringifyClass(value) {
  if (Array.isArray(value)) {
    return stringifyArray(value);
  }
  if (isObject(value)) {
    return stringifyObject(value);
  }
  if (typeof value === 'string') {
    return value;
  }

  return '';
}

function stringifyArray(value) {
  let res = '';
  let stringified;
  for (let i = 0, l = value.length; i < l; i++) {
    if (isDef((stringified = stringifyClass(value[i]))) && stringified !== '') {
      if (res) res += ' ';
      res += stringified;
    }
  }
  return res;
}

function stringifyObject(value) {
  let res = '';
  for (const key in value) {
    if (value[key]) {
      if (res) res += ' ';
      res += key;
    }
  }
  return res;
}
