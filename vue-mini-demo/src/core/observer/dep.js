import { remove } from '../../shared/util';


let uid = 0;

/**
 * dep 是一个存储可观察对象的对象（俗称订阅器）。
 */
export default class Dep {
  static target;

  constructor() {
    this.id = uid++;
    this.subs = [];
  }
  // 添加
  addSub(sub) {
    this.subs.push(sub);
  }
  // 删除
  removeSub(sub) {
    remove(this.subs, sub);
  }
  // 添加依赖项
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }
  // 通知更新
  notify() {
    // 考虑到数据安全和稳定性，这里获取订阅列表的一个副本
    const subs = this.subs.slice();
    for (let i = 0, l = subs.length; i < l; i++) {
      console.log('通知更新--->notify', subs[i]);
      subs[i].update(); // 更新
    }
  }
}

// 当前正在处理的目标监视器。
// 因为同一时间，只有一个监视器可以被计算，所以这是全局唯一的，
Dep.target = null;
const targetStack = [];

export function pushTarget(target) {
  targetStack.push(target);
  Dep.target = target;
}

export function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}
