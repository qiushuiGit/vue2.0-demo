import { nextTick } from '../util/next-tick'

export const MAX_UPDATE_COUNT = 100;

const queue = []; // 监视者队列
const activatedChildren = [];
let has = {};
let circular = {};
let waiting = false;
let flushing = false;
let index = 0;

/**
 * 重置调度程序的状态。
 */
function resetSchedulerState() {
  index = queue.length = activatedChildren.length = 0;
  has = {};
  circular = {};
  waiting = flushing = false;
}

/**
 * 刷新队列并运行监视器。
 */
function flushSchedulerQueue() {
  flushing = true;
  let watcher, id;

  // 刷新队列前的排序，是为确保:
  // 1. 组件从父组件更新到子组件（因为父组件总是在子组件之前创建）。
  // 2. 组件的用户监视器在它的呈现监视器之前运行（因为用户观察者在渲染观察者之前创建）。
  // 3. 如果一个组件在父组件的监视程序运行期间被销毁，它的观察者可以被跳过。
  queue.sort((a, b) => a.id - b.id);

  // 不要缓存长度，因为当我们运行现有的监视器时，可能会有更多的监视器被推送
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
 * 将一个监视者推入监视者队列。
 * 具有重复 id 的作业将被跳过，除非它是刷新队列时推入。
 */
export function queueWatcher(watcher) {
  const id = watcher.id;
  if (has[id] == null) {
    has[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // 如果已经刷新，则根据其id拼合监视器
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
