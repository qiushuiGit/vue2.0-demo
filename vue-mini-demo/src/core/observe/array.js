import { def } from '../../shared/util';

// 存储数组方法
const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
];

const slice = Array.prototype.slice;
const arrayProto = Array.prototype; // 存储数组原型
const arrayMethods = Object.create(arrayProto); // 创建一个新的数组原型对象

methodsToPatch.forEach(function (method) {

    const original = arrayProto[method]; // 缓存数组的原方法

    def(arrayMethods, method, function mutator(...args) {
        // 使用数组的原生方法，对数组进行增、删。
        const result = original.apply(this, args);
        const ob = this.__ob__;
        let inserted;

        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break
            case 'splice':
                // splice() 方法用于添加或删除数组中的元素
                // 删除：splice(0, 1) --> args 即 [0, 1]
                // 增加：splice(1, 0, '新增') --> args 即 [1, 0, '新增']

                // slice() 方法可从已有的数组中返回选定的元素
                // args.slice(2)，固定下标值为 2，是因为 splice 的使用方式：
                // splice，若是删除，则 args.slice(2) 返回空数组
                // splice，若是新增，则 args.slice(2) 返回一个新数组，里面是所有新增的数据
                inserted = args.slice(2);
                break
        }
        // inserted 为真（空数组 --> []，也是真），则调用 observeArray() 方法对其进行观察
        if (inserted) ob.observeArray(inserted);
        
        return result
    })



    // arrayMethods[method] = function () {

    //     let inserted; // 存储数组中新增的值，默认undefined
    //     let args = slice.call(arguments); // 将 arguments 转成一个新的数组并返回

    //     // 这里可以不要返回值，直接写：original.apply(this, args)
    //     const result = original.apply(this, args); // 使用数组的原生方法，对数组进行增、删。

    //     // console.log('数组新方法', args);
    //     switch (method) {
    //         case 'push':
    //         case 'unshift':
    //             inserted = args;
    //             break;
    //         case 'splice':
    //             // splice() 方法用于添加或删除数组中的元素
    //             // 删除：splice(0, 1) --> args 即 [0, 1]
    //             // 增加：splice(1, 0, '新增') --> args 即 [1, 0, '新增']

    //             // slice() 方法可从已有的数组中返回选定的元素
    //             // args.slice(2)，固定下标值为 2，是因为 splice 的使用方式：
    //             // splice，若是删除，则 args.slice(2) 返回空数组
    //             // splice，若是新增，则 args.slice(2) 返回一个新数组，里面是所有新增的数据
    //             inserted = args.slice(2);
    //             break;
    //         default:
    //             break;
    //     }

    //     // inserted 为真（空数组 --> []，也是真），则调用 observeArray() 方法对其进行观察
    //     inserted && observeArray(inserted);

    //     return result;
    // }
});

export {
    arrayMethods
}