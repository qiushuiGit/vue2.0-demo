// 注意: 这只是从数组 (attrsList) 中删除了属性，以便不被 processAttrs 处理。
// 默认情况下，它不会从映射 (attrsMap) 中删除它，因为在代码生成期间需要映射。

// done: 获取并从 attrsList 数组中删除属性
export function getAndRemoveAttr(el, name, removeFromMap) {
  let val;
  if ((val = el.attrsMap[name]) != null) {
    const list = el.attrsList;
    for (let i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1);
        break;
      }
    }
  }
  // removeFromMap 为真，则从 attrsMap 中删除属性
  if (removeFromMap) {
    delete el.attrsMap[name];
  }
  return val;
}

// done: 获取绑定的属性
export function getBindingAttr(el, name, getStatic) {
  const dynamicValue =
    getAndRemoveAttr(el, ':' + name) || getAndRemoveAttr(el, 'v-bind:' + name);

  // 动态绑定属性，例如，v-bind:key = 'index' 或 :key = 'index'
  if (dynamicValue != null) {
    // return parseFilters(dynamicValue)
    return dynamicValue;
  } else if (getStatic !== false) {
    // 静态绑定属性，例如，ref = "nameRef"
    const staticValue = getAndRemoveAttr(el, name);
    if (staticValue != null) {
      return JSON.stringify(staticValue);
    }
  }
}

// DONE 为 ast 对象添加 attrs 属性
export function addAttr(el, name, value, range, dynamic) {
  const attrs = dynamic
    ? el.dynamicAttrs || (el.dynamicAttrs = [])
    : el.attrs || (el.attrs = []);
  attrs.push(
    rangeSetItem(
      {
        name,
        value,
        dynamic
      },
      range
    )
  );
  el.plain = false;
}

// DONE 合并对象属性
function rangeSetItem(item, range) {
  if (range) {
    if (range.start != null) {
      item.start = range.start;
    }
    if (range.end != null) {
      item.end = range.end;
    }
  }
  return item;
}

// DONE 依据 key 值，选出相应模块函数
export function pluckModuleFunction(modules, key) {
  return modules ? modules.map((m) => m[key]).filter((_) => _) : [];
}
