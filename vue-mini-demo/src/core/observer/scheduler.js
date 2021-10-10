import { nextTick } from '../util/next-tick'

export const MAX_UPDATE_COUNT = 100;

const queue = []; // 订阅队列
const activatedChildren = [];
let has = {};
let circular = {};
let waiting = false;
let flushing = false;
let index = 0;

/**
 * 重置 Scheduler（调度器）的状态。
 */
function resetSchedulerState() {
  index = queue.length = activatedChildren.length = 0;
  has = {};
  circular = {};
  waiting = flushing = false;
}

/**
 * 刷新队列并调用 watcher.run。
 */
function flushSchedulerQueue() {
  flushing = true;
  let watcher, id;

  // 刷新队列前的排序，是为确保:
  // 1. 组件从父组件更新到子组件（因为父组件总是在子组件之前创建）。
  // 2. 组件的 watcher 在它提供之前运行（因为使用的 watcher 在渲染之前创建）。
  // 3. 如果一个组件在父组件的监视程序运行期间被销毁，它的 watcher 可以被跳过。
  queue.sort((a, b) => a.id - b.id);

  // 不要缓存长度，因为当我们运行现有的 watcher 时，可能会有更多的 watcher 被推送
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];

    id = watcher.id;
    has[id] = null;
    watcher.run();
  }
  // 重置
  resetSchedulerState();
}

/**
 * 将一个订阅者者推入订阅队列。
 * 具有重复 id 的作业将被跳过，除非它是刷新队列时推入。
 */
export function queueWatcher(watcher) {
  const id = watcher.id;
  if (has[id] == null) {
    has[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // 如果已经刷新，则根据其 id 拼接订阅队列
      // 如果已经超过了它的id，它将立即运行下一步。
      let i = queue.length - 1;
      while (i > index && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i + 1, 0, watcher); // 添加到队列
    }
    // 刷新队列
    if (!waiting) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}
