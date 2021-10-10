import { isObject, _Set as Set } from '../../shared/util';

import { queueWatcher } from './scheduler';
import { pushTarget, popTarget } from './dep';

let uid = 0;

/**
 * 订阅者，收集依赖项，并在表达式值发生变化时触发回调。这用于 $watch() api 和指令。
 */
export default class Watcher {
  constructor(vm, expOrFn, cb, options, isRenderWatcher) {
    this.vm = vm;

    if (isRenderWatcher) {
      vm._watcher = this;
    }

    vm._watchers.push(this);

    this.cb = cb;
    this.id = ++uid;
    this.deps = [];
    this.newDeps = [];
    this.depIds = new Set(); // 用于判断dep是否已存在
    this.newDepIds = new Set();
    this.getter = expOrFn;
    this.value = this.get();
  }

  /**
   * 获取值并收集依赖项。
   */
  get() {
    pushTarget(this); // 添加订阅者到栈中并设置为当前正在处理的订阅者
    let value;
    const vm = this.vm;
    try {
      value = this.getter.call(vm, vm);
    } catch (e) {
      throw e;
    } finally {
      popTarget(); // 移除当前订阅者
      this.cleanupDeps(); // 清理依赖项集合。
    }

    return value;
  }

  /**
   * 添加依赖项
   */
  addDep(dep) {
    const id = dep.id;
    // 根据id，判断依赖项是否已存在
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }

  /**
   * 清理依赖项集合。
   */
  cleanupDeps() {
    let i = this.deps.length;
    while (i--) {
      const dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this); // 删除
      }
    }

    let tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();

    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  }

  /**
   * 订阅更新接口。
   * 将在依赖项更改时调用。
   */
  update() {
    queueWatcher(this);
  }

  /**
   * Scheduler（调度器）作业接口。
   * 将被 scheduler 调用。
   */
  run() {
    const value = this.get();
    if (
      value !== this.value ||
      // 即使值相同，对象/数组上的订阅也应该触发，因为值可能已经发生了变化。
      isObject(value)
    ) {
      // 设置新的值
      const oldValue = this.value;
      this.value = value;
      this.cb.call(this.vm, value, oldValue);
    }
  }

  /**
   * 依赖当前观察者收集的所有数据.
   */
  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }
}
