import observe from './index';

function observeArray (arr) {
  for (let i = 0; i < arr.length; i ++) {
    observe(arr[i]); // 递归观察，arr[i]可能是一个对象
  }
}

export default observeArray;