// import observe from "./index";

// function defineReactive (data, key, value) {
  
//   // 递归观察，value可能是一个对象
//   observe(value); 

//   // Object.defineProperty() 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。
//   // 它是实现数据劫持的关键所在。
//   Object.defineProperty(data, key, {
//     get: function reactiveGetter () {
//     //   console.log('获取', value);
//       return value;
//     },
//     set: function reactiveSetter (newValue) {
//     //   console.log('设置', newValue);
//       if (newValue === value) return; // 同名属性，不需要重新赋值或观察
//       observe(value); // 递归观察，value可能是一个对象
//       value = newValue;
//     }
//   });
// }

// export {
//   defineReactive
// };