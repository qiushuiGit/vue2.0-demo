// import { handleError } from './error'
import { isNative } from '../../shared/util';

export let isUsingMicroTask = false;

const callbacks = [];
let pending = false;

function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  for (let i = 0; i < copies.length; i++) {
    // console.log('flushCallbacks--->执行', copies[i]);
    copies[i]();
  }
}

let timerFunc;
// 若 Promise 不存在，则使用 setTimeout
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  // console.log('Promise---->存在吗');
  const p = Promise.resolve();
  timerFunc = () => {
    p.then(flushCallbacks);
  };
  isUsingMicroTask = true;
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}

export function nextTick(cb, ctx) {
  let _resolve;
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        throw e;
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });

  if (!pending) {
    pending = true;
    console.log('timerFunc----->是什么', timerFunc);
    timerFunc();
  }

  if (!cb && typeof Promise !== 'undefined') {
    return new Promise((resolve) => {
      _resolve = resolve;
    });
  }
}
