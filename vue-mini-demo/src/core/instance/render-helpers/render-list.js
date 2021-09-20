import { isDef, isObject, hasSymbol } from '../../../shared/util';


// DONE 处理 v-for 指令中的 lists（即要遍历的数组、字符串、数字或对象）
export function renderList(val, render) {
    var ret, i, l, keys, key;
    if (Array.isArray(val) || typeof val === "string") {
        // val 是数组或字符串
        ret = new Array(val.length);
        for (i = 0, l = val.length; i < l; i++) {
            // console.log('有ret------------------>', val[i], i);

            ret[i] = render(val[i], i);
        }
    } else if (typeof val === "number") {
        // val 是数字
        ret = new Array(val);
        for (i = 0; i < val; i++) {
            ret[i] = render(i + 1, i);
        }
    } else if (isObject(val)) {
        // val 是 'object' 对象

        if (hasSymbol && val[Symbol.iterator]) {
            // val 是 Symbol
            ret = [];
            var iterator = val[Symbol.iterator]();
            var result = iterator.next();
            while (!result.done) {
                ret.push(render(result.value, ret.length));
                result = iterator.next();
            }
        } else {
            // val 是普通对象
            keys = Object.keys(val);
            ret = new Array(keys.length);
            for (i = 0, l = keys.length; i < l; i++) {
                key = keys[i];
                ret[i] = render(val[key], key, i);
            }
        }
    }
    // ret 不存在，则设置为空数组
    if (!isDef(ret)) {
        ret = [];
    }
    // 标记为已处理
    ret._isVList = true;
    
    return ret;
}