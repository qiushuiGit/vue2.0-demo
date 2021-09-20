// import observeArray from './observeArray';
// import { defineReactive } from './reactive';
import { arrayMethods } from './array';
import { isObject, def, hasProto } from '../../shared/util';

const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

export function observe(val) {

    // 检查 val 是否为对象（注意：在 js 中，数组也是对象，isObject并不排除数组）。
    if (!isObject(val)) return;
    return new Observer(val);
}

export class Observer {

    constructor(value) {
        this.value = value;

        // 为当前 value 定义 __ob__ 属性，其值为 this（即当前 Observer 类）
        def(value, '__ob__', this);

        if (Array.isArray(value)) {
            // 以是否存在 __proto__ 来判断使用何种方法增加扩充目标对象或数组
            if (hasProto) {
                protoAugment(value, arrayMethods);
            } else {
                copyAugment(value, arrayMethods, arrayKeys);
            }

            // 观察数组（Array）
            this.observeArray(value);
        } else {
            // 观察对象（Object)
            this.walk(value)
        }
    }

    // 遍历所有属性并将它们转换为 getter/setter。仅当值类型为 Object 时才应调用此方法
    walk(obj) {
        const keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]; // 属性
            const value = obj[key]; // 属性值
            defineReactive(obj, key, value)
        }
    }

    // 观察数组（Array）的每一项
    observeArray(items) {
        for (let i = 0, l = items.length; i < l; i++) {
            observe(items[i])
        }
    }
}

// function Observer(val) {

//     if (Array.isArray(val)) {
//         // arrayMethods 中存储的是：重写的数组方法，例如：push、unshift 等。
//         // 重写为了在更改数组中的数据时，做出更多操作。比如，通过 push 方法向数组中新添数据时，
//         // 需要对新的数据进行观察，设置 getter/setter，否则它们将不能在后续的修改中做出反应。
//         // 实际上，重写的数组方法，其内部依旧使用数组的原生方法来实现数据的增、删。

//         val.__proto__ = arrayMethods; // 使用 __proto__ 拦截原型链来增加目标对象
//         observeArray(val); // 观察数组（Array）的每一项
//     } else {
//         this.walk(val); // 观察对象（Object --> {}）
//     }
// }

// export function observeArray(arr) {
//     for (let i = 0; i < arr.length; i++) {
//         observe(arr[i]); // 递归观察，arr[i]可能是一个对象
//     }
// }

function defineReactive(data, key, value) {

    // 递归观察，value可能是一个对象
    observe(value);

    // Object.defineProperty() 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。
    // 它是实现数据劫持的关键所在。
    Object.defineProperty(data, key, {
        get: function reactiveGetter() {
              console.log('获取', value);
            return value;
        },
        set: function reactiveSetter(newValue) {
              console.log('设置', newValue);
            if (newValue === value) return; // 同名属性，不需要重新赋值或观察
            observe(value); // 递归观察，value可能是一个对象
            value = newValue;
        }
    });
}

// done: 通过使用 __proto__ 截取原型链来增加目标对象或数组
function protoAugment(target, src) {
    target.__proto__ = src;
}

// done: 通过定义隐藏属性来扩充目标对象或数组
function copyAugment(target, src, keys) {
    for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        def(target, key, src[key]);
    }
}
// // 遍历所有属性并将它们转换为 getter/setter。仅当值类型为 Object 时才应调用此方法
// Observer.prototype.walk = function (data) {

//     // Object.keys() 方法会返回一个由一个给定对象的自身可枚举属性组成的数组，
//     // 数组中属性名的排列顺序和正常循环遍历该对象时返回的顺序一致 。
//     const keys = Object.keys(data);

//     for (let i = 0; i < keys.length; i++) {

//         const key = keys[i]; // 属性
//         const value = data[key]; // 属性值

//         // 在对象上定义一个反应性属性
//         defineReactive(data, key, value);

//     }

// }
