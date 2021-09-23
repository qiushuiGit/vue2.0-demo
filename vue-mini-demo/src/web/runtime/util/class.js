/* @flow */

import { isDef, isObject } from '../../../shared/util';

export function genClassForVnode(vnode) {
    let data = vnode.data;

    return renderClass(data.staticClass, data.class);
}

// 提供拼接好的 class
export function renderClass(staticClass, dynamicClass) {
    // 至少要有一个存在
    if (isDef(staticClass) || isDef(dynamicClass)) {
        return concat(staticClass, stringifyClass(dynamicClass));
    }

    return '';
}

// 拼接 class
export function concat(a, b) {
    return a ? (b ? a + ' ' + b : a) : b || '';
}

// 对 class 进行格式化
export function stringifyClass(value) {
    // 数组语法，例如：v-bind:class="[activeClass, errorClass]"
    if (Array.isArray(value)) {
        return stringifyArray(value);
    }
    // 对象语法，例如：v-bind:class="{ active: isActive, 'text-danger': hasError }"
    if (isObject(value)) {
        return stringifyObject(value);
    }
    // 字符串
    if (typeof value === 'string') {
        return value;
    }

    return '';
}

// class 数组绑定语法
function stringifyArray(value) {
    let res = '';
    let stringified;
    for (let i = 0, l = value.length; i < l; i++) {
        // 递归，遍历 value 数组中的每一项
        if (isDef((stringified = stringifyClass(value[i]))) && stringified !== '') {
            if (res) res += ' '; // class 之间要有空格
            res += stringified;
        }
    }
    return res;
}

// class 对象绑定语法
function stringifyObject(value) {
    let res = '';
    for (const key in value) {
        if (value[key]) {
            if (res) res += ' '; // class 之间要有空格
            res += key;
        }
    }
    return res;
}
