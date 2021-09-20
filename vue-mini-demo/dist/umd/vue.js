(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function proxy(vm, target, key) {
    // Object.defineProperty() 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。
    // 将属性都挂载到 vm（Vue实例）上，并设置属性的 getter/setter，以实现数据代理：vm.name --> vm.$data.name
    Object.defineProperty(vm, key, {
      get() {
        return vm[target][key]; // vm[target][key] --> vm.$data.name
      },

      set(newValue) {
        vm[target][key] = newValue;
      }

    });
  }

  // done:: 是否存在 __proto__
  const hasProto = ('__proto__' in {}); // done: 定义一个属性

  function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    });
  } // done: 对象检测

  function isObject(obj) {
    return obj !== null && typeof obj === 'object';
  } // done: 混合属性到目标对象中

  function extend(to, _from) {
    for (const key in _from) {
      to[key] = _from[key];
    }

    return to;
  } // done: 获取并删除（removeFromMap 为真） attrsMap 中的属性

  function cached(fn) {
    const cache = Object.create(null);
    return function cachedFn(str) {
      const hit = cache[str];
      return hit || (cache[str] = fn(str));
    };
  } // done: 判断 Symbol 和 Reflect 是否都存在

  const hasSymbol = typeof Symbol !== 'undefined' && isNative(Symbol) && typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);
  function isNative(Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
  } // done: 参数等于 undefined 或 null

  function isUndef(v) {
    return v === undefined || v === null;
  } // done: 参数不等于 undefined 和 null

  function isDef(v) {
    return v !== undefined && v !== null;
  } // done: 检查 value 是否为原始值

  function isPrimitive(value) {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'symbol' || typeof value === 'boolean';
  } // done: 制作一个映射，并返回一个函数来检查键是否在该映射中。

  function makeMap(str, expectsLowerCase) {
    const map = Object.create(null);
    const list = str.split(',');

    for (let i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }

    return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val];
  }
  function isTrue(v) {
    return v === true;
  }
  function isFalse(v) {
    return v === false;
  }

  const methodsToPatch = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
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
          break;

        case 'splice':
          // splice() 方法用于添加或删除数组中的元素
          // 删除：splice(0, 1) --> args 即 [0, 1]
          // 增加：splice(1, 0, '新增') --> args 即 [1, 0, '新增']
          // slice() 方法可从已有的数组中返回选定的元素
          // args.slice(2)，固定下标值为 2，是因为 splice 的使用方式：
          // splice，若是删除，则 args.slice(2) 返回空数组
          // splice，若是新增，则 args.slice(2) 返回一个新数组，里面是所有新增的数据
          inserted = args.slice(2);
          break;
      } // inserted 为真（空数组 --> []，也是真），则调用 observeArray() 方法对其进行观察


      if (inserted) ob.observeArray(inserted);
      return result;
    }); // arrayMethods[method] = function () {
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

  // import observeArray from './observeArray';
  const arrayKeys = Object.getOwnPropertyNames(arrayMethods);
  function observe(val) {
    // 检查 val 是否为对象（注意：在 js 中，数组也是对象，isObject并不排除数组）。
    if (!isObject(val)) return;
    return new Observer(val);
  }
  class Observer {
    constructor(value) {
      this.value = value; // 为当前 value 定义 __ob__ 属性，其值为 this（即当前 Observer 类）

      def(value, '__ob__', this);

      if (Array.isArray(value)) {
        // 以是否存在 __proto__ 来判断使用何种方法增加扩充目标对象或数组
        if (hasProto) {
          protoAugment(value, arrayMethods);
        } else {
          copyAugment(value, arrayMethods, arrayKeys);
        } // 观察数组（Array）


        this.observeArray(value);
      } else {
        // 观察对象（Object)
        this.walk(value);
      }
    } // 遍历所有属性并将它们转换为 getter/setter。仅当值类型为 Object 时才应调用此方法


    walk(obj) {
      const keys = Object.keys(obj);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]; // 属性

        const value = obj[key]; // 属性值

        defineReactive(obj, key, value);
      }
    } // 观察数组（Array）的每一项


    observeArray(items) {
      for (let i = 0, l = items.length; i < l; i++) {
        observe(items[i]);
      }
    }

  } // function Observer(val) {
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
    observe(value); // Object.defineProperty() 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。
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
  } // done: 通过使用 __proto__ 截取原型链来增加目标对象或数组


  function protoAugment(target, src) {
    target.__proto__ = src;
  } // done: 通过定义隐藏属性来扩充目标对象或数组


  function copyAugment(target, src, keys) {
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i];
      def(target, key, src[key]);
    }
  } // // 遍历所有属性并将它们转换为 getter/setter。仅当值类型为 Object 时才应调用此方法
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

  function initState(vm) {
    const options = vm.$options;

    if (options.data) {
      initData(vm); // 初始化 data
    }
  }

  function initData(vm) {
    let data = vm.$options.data; // Vue 中的 data 可以是函数（Vue 中建议将 data 作为一个函数来使用），也可以是 Object --> {}

    data = vm.$data = typeof data === 'function' ? data.call(vm) : data || {};

    for (var key in data) {
      // proxy 实现数据代理，vm.name --> vm.$data.name
      proxy(vm, '$data', key);
    } // observe 观察者，对数据进行观测，以便在其发生改变时，做出反应。


    observe(vm.$data);
  }

  // 挂载组件
  function mountComponent(vm) {
    // vm._render() 返回虚拟节点 vnode
    vm._update(vm._render()); // 更新组件

  }

  function lifecycleMixin(Vue) {
    // 挂载 _update() 更新函数
    Vue.prototype._update = function (vnode) {
      const vm = this; // console.log('_update--->执行', vm.$el, vnode);
      // 将 vnode 虚拟节点生成相应的 HTML 元素

      vm.__patch__(vm.$el, vnode);
    };
  }

  // 匹配双大括号 => {{tip}}
  const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  function parseText(text) {
    const tagRE = defaultTagRE;

    if (!tagRE.test(text)) {
      return false;
    }

    const tokens = [];
    const rawTokens = []; // lastIndex 下一次匹配开始的位置。每次循环时，都将其初始为 0，是为防止处理其它文本时，
    // 取到 lastIndex 是上一个循环结束后保留下的值而导致出错。

    let lastIndex = tagRE.lastIndex = 0;
    let match, index, tokenValue; // 文本样例解析参考：<div>函数字符串，{{ tip }} 哈哈</div>

    while (match = tagRE.exec(text)) {
      index = match.index;

      if (index > lastIndex) {
        // 截取 {{ tip }} 前面的纯文本
        rawTokens.push(tokenValue = text.slice(lastIndex, index));
        tokens.push(JSON.stringify(tokenValue));
      } // 获取 {{ tip }} 中的 tip


      const exp = match[1].trim();
      tokens.push(`_s(${exp})`);
      rawTokens.push({
        '@binding': exp
      });
      lastIndex = index + match[0].length; // 标记下一次匹配开始的位置
    } // 截取 {{ tip }} 之后的存文本


    if (lastIndex < text.length) {
      rawTokens.push(tokenValue = text.slice(lastIndex));
      tokens.push(JSON.stringify(tokenValue));
    }

    return {
      expression: tokens.join('+'),
      tokens: rawTokens
    };
  }

  // 匹配属性： id="app"、id='app' 或 id=app
  const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配标签：<my-header></my-header>

  const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 匹配标签：<my:header></my:header>

  const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // 匹配开始标签：<div

  const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配闭合标签： > 或 />

  const startTagClose = /^\s*(\/?)>/; // 匹配结束标签： </div>

  const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // DONE 解析模版字符串，生成 AST 语法树

  function parseHTML(html, options) {
    let text; // 纯文本
    // vue2.0 源码中对以下几种情况分别进行了处理：注释标签、条件注释标签、Doctype、开始标签、结束标签。
    // 而每当处理完一种情况时，都会阻断代码继续往下执行且开启新的一轮循环（注：使用 continue 实现 ），
    // 并且会重置 html 字符串，也就是删掉匹配到的 html 字符串，保留未匹配的 ，以便在下一次循环处理。
    // 提示：在解读以上几种情况的源码时，配合模板样例来理解会让你理解起来更容易。

    while (html) {
      // textEnd 为 0，则说明是一个开始标签。
      let textEnd = html.indexOf('<');

      if (textEnd === 0) {
        // 解析开始标签及其属性并将其存放在一个对象中返回，例如：
        // { tagName: 'div', attrs: [{ name: 'id', value: 'app' }] }
        const startTagMatch = parseStartTag(); // console.log('解析——开始标签——结果', startTagMatch);
        // 处理开始标签

        if (options.start && startTagMatch) {
          options.start(startTagMatch.tagName, startTagMatch.attrs);
          continue; // 执行到 continue，将开始新的一轮循环，后续代码不会执行
        }

        const endTagMatch = html.match(endTag); // 匹配结束标签
        // 处理结束标签

        if (options.end && endTagMatch) {
          advance(endTagMatch[0].length);
          options.end(endTagMatch[1]);
          continue;
        }
      } // 截取 HTML 模版字符串中的文本


      if (textEnd > 0) {
        text = html.substring(0, textEnd);
      } // 处理文本内容


      if (options.chars && text) {
        advance(text.length);
        options.chars(text);
      }
    } // 解析开始标签及其属性，例如：<div id="app">


    function parseStartTag() {
      // 如果没有找到任何匹配的文本， match() 将返回 null。否则，它返回一个数组，
      // 其中存放了与它找到的匹配文本有关的信息。
      const start = html.match(startTagOpen); // 匹配开始标签

      let end, attr;

      if (start) {
        // 存放开始标签名和属性
        const match = {
          tagName: start[1],
          // 开始标签的名，例如：div
          attrs: [] // 开始标签的属性，例如：{ name: 'id', value: 'app' }

        }; // 删除已匹配到的 HTML 字符串，保留未匹配到的。
        // 例如：匹配到 <div id="app"></div> 中的 <div，调用 advance() 方法后，
        // 原 HTML 字符窜就是这样：id="app"></div>

        advance(start[0].length); // 当匹配到属性（ 形如：id='app'），但未匹配到开始标签的闭合（ 形如：> ）时，进入循环

        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          match.attrs.push({
            name: attr[1],
            // 属性名: id
            // 若是你在通过 new 关键字创建 vue 实例时，提供了 template 选项
            // 且在它的字符串中,有的标签的属性使用的是单引号或者没有带引号，
            // 例如：<div id='app'></div> 或 <div id=app></div> 这种形式，那么
            // 在匹配标签的属性时，其返回的数组中这个属性的值，可能在此数组的 下标4 或 下标5
            value: attr[3] || attr[4] || attr[5] // 属性值: app

          });
          advance(attr[0].length);
        } // 如果匹配到开始标签的闭合（ 形如：> ），则返回 match 对象


        if (end) {
          advance(end[0].length);
          return match;
        }
      }
    } // DONE 截取 HTML 字符串，将已匹配到的字符从原有字符中删除。


    function advance(n) {
      // substring() 方法用于提取字符串中介于两个指定下标之间的字符。
      html = html.substring(n);
    }
  }

  // 注意: 这只是从数组 (attrsList) 中删除了属性，以便不被 processAttrs 处理。
  // 默认情况下，它不会从映射 (attrsMap) 中删除它，因为在代码生成期间需要映射。
  // done: 获取并删除属性
  function getAndRemoveAttr(el, name, removeFromMap) {
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

    if (removeFromMap) {
      delete el.attrsMap[name];
    }

    return val;
  } // DONE 获取绑定的属性

  function getBindingAttr(el, name, getStatic) {
    const dynamicValue = getAndRemoveAttr(el, ':' + name) || getAndRemoveAttr(el, 'v-bind:' + name); // 动态绑定属性，例如，v-bind:key = 'index' 或 :key = 'index'

    if (dynamicValue != null) {
      // parseFilters(dynamicValue)
      return dynamicValue;
    } else if (getStatic !== false) {
      // 静态绑定属性，例如，ref = "nameRef"
      const staticValue = getAndRemoveAttr(el, name);

      if (staticValue != null) {
        return JSON.stringify(staticValue);
      }
    }
  } // DONE 为 ast 对象添加 attrs 属性

  function addAttr(el, name, value, range, dynamic) {
    const attrs = dynamic ? el.dynamicAttrs || (el.dynamicAttrs = []) : el.attrs || (el.attrs = []);
    attrs.push(rangeSetItem({
      name,
      value,
      dynamic
    }, range));
    el.plain = false;
  } // DONE 合并对象属性

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
  } // DONE 依据 key 值，选出相应模块函数


  function pluckModuleFunction(modules, key) {
    return modules ? modules.map(m => m[key]).filter(_ => _) : [];
  }

  const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/; // 匹配圆括号 ——> ()

  const stripParensRE = /^\(|\)$/g; // 匹配',' 和 'index'，例如：item, index ——> , index

  const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
  /*
    假设模板样例：
     <div id="app" style="color: #f66;font-size: 20px;">
      函数字符串，{{ tip }}
      <span class="cla">{{ studentNum }}</span>
    </div>
  */

  let transforms; // done: 解析模版字符串，生成 ast 语法树

  function parse(template, options) {
    // 获取 transformNode 函数，用于处理 class、style 等属性
    transforms = pluckModuleFunction(options.modules, 'transformNode');
    const stack = []; // 存放所有开始标签的初始 AST 对象

    let root; // 最终返回的 AST 对象

    let currentParent; // 当前元素的父级

    parseHTML(template, {
      // DONE 标签开始
      start(tag, attrs) {
        // 创建 AST 对象
        const element = createASTElement(tag, attrs);
        processFor(element); // 处理 v-for 指令
        // 如果 root 根节点不存在，则说明当前节点即是整个模版的最顶层节点，也就是第一个节点

        if (!root) {
          root = element;
        } // 保存当前父节点（AST 对象）


        currentParent = element; // 将 AST 对象 push 到 stack 栈中，当解析到其相对应的结束标签时，
        // 则将这个标签对应的 AST 对象 从栈中 pop 出来。
        // 原因：解析开始标签时，是顺时针；解析结束标签时，是逆时针。结合模板样例看，
        // 解析顺序如下：<div> => <span> => ...  => </span> => </div>
        // 因此，解析开始标签生成的 AST 对象被 push 到栈中后，若想在解析到其相应的结束标签时取出，
        // 则要使用 pop。整个操作流程，结合 start() 和 end() 方法一起看，会更易理解。

        stack.push(element);
      },

      // done: 标签结束
      end(tag) {
        // pop() 方法将删除数组的最后一个元素，把数组长度减 1，并且返回它删除的元素的值。
        // 如果数组已经为空，则 pop() 不改变数组，并返回 undefined 值。
        const element = stack.pop(); // 获取当前元素标签的 AST 对象

        currentParent = stack[stack.length - 1]; // 获取当前元素标签的父级 AST 对象
        // 处理 ast 对象中的属性

        processElement(element);

        if (currentParent) {
          // 标记父子元素
          element.parent = currentParent; // 子元素存储父元素

          currentParent.children.push(element); // 父元素存入子元素
        }
      },

      // done: 解析文本
      chars(text) {
        if (!currentParent) {
          return;
        }

        let res;
        let child;
        const children = currentParent.children;
        text = text.trim(); // 去掉首尾空格

        if (text) {
          // console.log('text------解析文本-->', 'text: ' + text, 'children: ', children);
          if (text !== ' ' && (res = parseText(text))) {
            child = {
              type: 2,
              // 标记 ast 对象子元素的类型
              text,
              expression: res.expression,
              tokens: res.tokens
            };
          } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
            child = {
              type: 3,
              // 标记 ast 对象子元素的类型
              text
            };
          }

          if (child) {
            children.push(child);
          }
        }
      }

    });
    return root;
  } // done: 生成 ast 对象

  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      // 标签名
      type: 1,
      // 标记 ast 对象类型
      children: [],
      // 标签子级
      attrsList: attrs,
      // 标签属性
      attrsMap: makeAttrsMap(attrs),
      parent // 标签父级

    };
  } // DONE 标签属性的映射


  function makeAttrsMap(attrs) {
    const map = {};

    for (var i = 0, len = attrs.length; i < len; i++) {
      if (map[attrs[i].name]) {
        console.log('duplicate attribute: 属性重复' + attrs[i].name, attrs[i]);
        return false;
      }

      map[attrs[i].name] = attrs[i].value;
    }

    return map;
  } // DONE 处理 v-for 指令


  function processFor(el) {
    const exp = getAndRemoveAttr(el, 'v-for'); // 判断 v-for 是否存在

    if (exp && typeof exp === 'string') {
      const res = parseFor(exp); // 解析 v-for 指令

      if (res) {
        // 将 res中的属性（例如：item、arrList）添加到目标对象（el即ast对象）中
        extend(el, res);
      } else {
        console.log(`Invalid v-for expression: ${exp}`);
      }
    }
  } // DONE 解析 v-for 指令


  function parseFor(exp) {
    // 匹配 v-for='(item,index) in arrList' 中的：'(item,index) in arrList'，这里仅是举例
    const inMatch = exp.match(forAliasRE); // 如果没有找到任何匹配的文本， match() 将返回 null。否则，它将返回一个数组，
    // 其中存放了与它找到的匹配文本有关的信息。

    if (!inMatch) return;
    const res = {}; // 获取 arrList 并去掉其前后空格

    res.for = inMatch[2].trim(); // 获取 (item, index) 并去掉其前后空格以及将圆括号即 () 替换为空。例如：(item, index) ——> item, index

    const alias = inMatch[1].trim().replace(stripParensRE, ''); // 匹配 ',' 和 'index'，例如：item, index ——> , index

    const iteratorMatch = alias.match(forIteratorRE); // iteratorMatch 为真，说明你使用 v-for 时，写的是 (item, index)。否则，就是 (item) 或 item。

    if (iteratorMatch) {
      // 将 ',' 和 'index'替换为空，得到 item 并去除其前后空格。例如：item, index ——> item
      res.alias = alias.replace(forIteratorRE, '').trim(); // 获取 index 并去除其前后空格

      res.iterator1 = iteratorMatch[1].trim();

      if (iteratorMatch[2]) {
        // 若是走到这里，说明你多写了逗号。例如：(item, , , index)。
        // 而这时，index 的值在 iteratorMatch[2] 的位置
        res.iterator2 = iteratorMatch[2].trim();
      }
    } else {
      res.alias = alias;
    }

    return res;
  } // DONE 处理 ast 对象


  function processElement(element) {
    // 处理 key
    processKey(element); // 在删除结构属性后确定这是否是普通元素

    element.plain = !element.key && !element.scopedSlots && !element.attrsList.length; // 处理 class 或 style 属性

    for (let i = 0; i < transforms.length; i++) {
      element = transforms[i](element) || element;
    }

    processAttrs(element); // 处理属性

    return element;
  } // DONE 处理 key


  function processKey(el) {
    const exp = getBindingAttr(el, 'key');

    if (exp) {
      if (el.tag === 'template') {
        console.log(`<template>不能被设置 key。请将 key 放在真实元素上。`);
        return false;
      }

      if (el.for) {
        const iterator = el.iterator2 || el.iterator1;
        const parent = el.parent;

        if (iterator && iterator === exp && parent && parent.tag === 'transition-group') {
          console.log(`不要使用 v-for 索引（index）作为 <transition-group> 子节点的 key`);
          return false;
        }
      }

      el.key = exp;
    }
  } // DONE 处理属性


  function processAttrs(el) {
    const list = el.attrsList;
    let i, l, name, value;

    for (i = 0, l = list.length; i < l; i++) {
      name = list[i].name;
      value = list[i].value; // 为 ast 对象添加 attrs 属性，用于存放 ast 中的属性

      addAttr(el, name, JSON.stringify(value), list[i]);
    }
  }

  /* 
    以下三个个函数的作用：

    _c() => createElement() 创建元素节点

    _v() => createTextNode() 创建文本节点

    _s(value) => _s(tip) 解析双大括号，例如：{{tip}}
  */

  /*
    ast => render 渲染函数

    function render() {
      return `_c("div",{id: "app",style:{ "color":"#f66","font-size":"20px"}},
        _v("函数字符串，"+_s(tip)),
        _c("span", { "class": "cla", "style": { "color": "green" } }, _v(_s(studentNum)))  
      )`;
    }
  */
  // DONE 生成配置状态对象

  function codegenState(options) {
    return {
      options,
      // 获取 class 和 style 模块中的 genData函数，用于拼接 class 和 style 属性
      dataGenFns: pluckModuleFunction(options.modules, "genData")
    };
  } // DONE 生成 code 代码字符串


  function generate(ast, options) {
    const state = codegenState(options);
    const code = ast ? ast.tag === "script" ? "null" : genElement(ast, state) : '_c("div")';
    return code;
  } // DONE 生成 code 代码字符串

  function genElement(el, state) {
    if (el.for && !el.forProcessed) {
      return genFor(el, state);
    } else {
      // 处理 element
      let code;
      let data;

      if (!el.plain) {
        data = genData$2(el, state);
      }

      const children = genChildren(el, state, true);
      code = `_c('${el.tag}'${data ? `,${data}` : "" // data
    }${children ? `,${children}` : "" // children
    })`;
      return code;
    }
  } // DONE 处理有 v-for 指令的 ast 对象


  function genFor(el, state) {
    const exp = el.for;
    const alias = el.alias;
    const iterator1 = el.iterator1 ? `,${el.iterator1}` : "";
    const iterator2 = el.iterator2 ? `,${el.iterator2}` : "";
    el.forProcessed = true; // 避免递归时，重复处理

    return `${"_l"}((${exp}),` + `function(${alias}${iterator1}${iterator2}){` + `return ${genElement(el, state)}` + "})";
  } // DONE 处理 ast 对象中的各种属性


  function genData$2(el, state) {
    let data = "{"; // key

    if (el.key) {
      data += `key:${el.key},`;
    } // 拼接已处理好的 class 或 style 属性


    for (let i = 0; i < state.dataGenFns.length; i++) {
      data += state.dataGenFns[i](el);
    } // attributes


    if (el.attrs) {
      data += `attrs:${genProps(el.attrs)},`;
    }

    data = data.replace(/,$/, "") + "}";
    return data;
  } // DONE 处理子节点


  function genChildren(el, state, checkSkip) {
    const children = el.children; // 是否存在子节点

    if (children.length) {
      const normalizationType = checkSkip ? getNormalizationType(children, state.maybeComponent) : 0;
      return `[${children.map(c => genNode(c, state)).join(",")}]${normalizationType ? `,${normalizationType}` : ""}`;
    }
  } // DONE 确定子数组需要的规范化。
  // 0:不需要标准化
  // 1:需要简单的规范化(可能是1级深嵌套数组)
  // 2:需要完全标准化


  function getNormalizationType(children, maybeComponent) {
    let res = 0;

    for (let i = 0; i < children.length; i++) {
      const el = children[i];

      if (el.type !== 1) {
        continue;
      }

      if (needsNormalization(el)) {
        res = 2;
        break;
      }
    }

    return res;
  }

  function needsNormalization(el) {
    return el.for !== undefined || el.tag === "template" || el.tag === "slot";
  } // DONE 将属性拼接成字符串
  // 例如：`style:{ "color":"#f66","font-size":"20px"}`


  function genProps(props) {
    let staticProps = ``;
    let dynamicProps = ``;

    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      const value = transformSpecialNewlines(prop.value);

      if (prop.dynamic) {
        dynamicProps += `${prop.name},${value},`;
      } else {
        staticProps += `"${prop.name}":${value},`;
      }
    }

    staticProps = `{${staticProps.slice(0, -1)}}`;

    if (dynamicProps) {
      return `_d(${staticProps},[${dynamicProps.slice(0, -1)}])`;
    } else {
      return staticProps;
    }
  } // DONE 根据类型的不同进行相应处理


  function genNode(node, state) {
    if (node.type === 1) {
      // 元素节点
      return genElement(node, state);
    } else {
      // 文本节点
      return genText(node);
    }
  } // DONE 处理文本节点


  function genText(text) {
    // 在模板编译阶段，已通过 parseText 函数对文本进行了处理
    return `_v(${text.type === 2 ? text.expression : transformSpecialNewlines(JSON.stringify(text.text))})`;
  } // \u2028（行分隔符） 和 \u2029（段落分隔符）会被浏览器理解为换行，
  // 而在Javascript的字符串表达式中是不允许换行的，那样会导致错误。


  function transformSpecialNewlines(text) {
    return text.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }

  function compileToFunctions(html, options) {
    // 解析 HTML 字符串，将其转换成 AST 抽象语法树
    const ast = parse(html, options); // 将 AST 转换成字符串函数

    const code = generate(ast, options); // 生成 render 渲染函数

    const render = new Function(`with(this){ return ${code} }`);
    console.log('生成render-->', render);
    return render;
  }

  function transformNode$1(el) {
    const staticClass = getAndRemoveAttr(el, 'class');

    if (staticClass) {
      // console.log('这是静态class', staticClass);
      el.staticClass = JSON.stringify(staticClass);
    }

    const classBinding = getBindingAttr(el, 'class', false
    /* getStatic */
    );

    if (classBinding) {
      el.classBinding = classBinding;
    }
  } // 分别拼接 class 静态和动态属性


  function genData$1(el) {
    let data = '';

    if (el.staticClass) {
      data += `staticClass:${el.staticClass},`;
    }

    if (el.classBinding) {
      data += `class:${el.classBinding},`;
    }

    return data;
  }

  var klass$1 = {
    staticKeys: ['staticClass'],
    transformNode: transformNode$1,
    genData: genData$1
  };

  const parseStyleText = cached(function (cssText) {
    const res = {};
    const listDelimiter = /;(?![^(]*\))/g;
    const propertyDelimiter = /:(.+)/; // 匹配冒号
    // 以分号进行分割

    cssText.split(listDelimiter).forEach(function (item) {
      if (item) {
        const tmp = item.split(propertyDelimiter); // 以冒号进行分割

        tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return res;
  });

  function transformNode(el) {
    const staticStyle = getAndRemoveAttr(el, 'style');

    if (staticStyle) {
      el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
    }

    const styleBinding = getBindingAttr(el, 'style', false
    /* getStatic */
    );

    if (styleBinding) {
      el.styleBinding = styleBinding;
    }
  } // 分别拼接 style 静态和动态属性


  function genData(el) {
    let data = '';

    if (el.staticStyle) {
      data += `staticStyle:${el.staticStyle},`;
    }

    if (el.styleBinding) {
      data += `style:(${el.styleBinding}),`;
    }

    return data;
  }

  var style = {
    staticKeys: ['staticStyle'],
    transformNode,
    genData
  };

  var modules$1 = [klass$1, style];

  const baseOptions = {
    modules: modules$1
  };

  /* HTML DOM 方法 */
  // DONE 通过指定名称创建一个元素
  function createElement$1(tagName, vnode) {
    const elm = document.createElement(tagName);

    if (tagName !== 'select') {
      return elm;
    } // false 或 null 将删除该属性，但 undefined 不会


    if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
      elm.setAttribute('multiple', 'multiple');
    }

    return elm;
  } // DONE 创建一个具有指定的命名空间URI和限定名称的元素
  // export function createElementNS(namespace, tagName) {
  //   return document.createElementNS(namespaceMap[namespace], tagName);
  // }
  // DONE 创建文本节点

  function createTextNode(text) {
    return document.createTextNode(text);
  } // DONE 创建注释节点

  function createComment(text) {
    return document.createComment(text);
  } // DONE 在已有的子节点前插入一个新的子节点

  function insertBefore(parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  } // DONE 从子节点列表中删除某个节点

  function removeChild(node, child) {
    node.removeChild(child);
  } // DONE 向节点的子节点列表的末尾添加新的子节点
  // 提示：如果文档树中已经存在了 newchild，它将从文档树中删除，然后重新插入它的新位置。
  // 如果 newchild 是 DocumentFragment 节点，则不会直接插入它，而是把它的子节点按序插入当前节点的 childNodes[] 数组的末尾。
  // 你可以使用 appendChild() 方法移除元素到另外一个元素。

  function appendChild(node, child) {
    node.appendChild(child);
  } // DONE 可返回某节点的父节点

  function parentNode(node) {
    return node.parentNode;
  } // DONE 返回某个元素之后紧跟的节点（处于同一树层级中）

  function nextSibling(node) {
    return node.nextSibling;
  } // DONE 获取元素的标签名

  function tagName(node) {
    return node.tagName;
  } // DONE 设置或者返回指定节点的文本内容
  // 如果你设置了 textContent 属性, 任何的子节点会被移除及被指定的字符串的文本节点替换

  function setTextContent(node, text) {
    node.textContent = text;
  } // DONE 创建或改变某个新属性。如果指定属性已经存在,则只设置该值

  function setStyleScope(node, scopeId) {
    node.setAttribute(scopeId, '');
  }

  var nodeOps = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createElement: createElement$1,
    createTextNode: createTextNode,
    createComment: createComment,
    insertBefore: insertBefore,
    removeChild: removeChild,
    appendChild: appendChild,
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    setStyleScope: setStyleScope
  });

  // done: vnode（虚拟节点）类
  class VNode {
    constructor(tag, data, children, text, elm, context) {
      this.tag = tag;
      this.data = data;
      this.children = children;
      this.text = text;
      this.elm = elm;
      this.context = context;
      this.key = data && data.key;
    }

  } // done: 创建空节点

  function createTextVNode(text) {
    return new VNode(undefined, undefined, undefined, text);
  } // done: 解析双大括号中的表达式，例如：{{tip}} => tip

  function toString(value) {
    if (value === null) return;
    return typeof value === 'object' ? JSON.stringify(value) : value;
  }
  //用于静态节点和槽节点，因为它们可以在多个渲染中重用，克隆它们可以避免DOM操作依赖它们的elm引用时出现错误。

  function cloneVNode(vnode) {
    const cloned = new VNode(vnode.tag, vnode.data, //克隆子数组，以避免在克隆子数组时发生原数组的突变。
    vnode.children && vnode.children.slice(), vnode.text, vnode.elm, vnode.context);
    cloned.key = vnode.key;
    cloned.isCloned = true;
    return cloned;
  }

  /**
   * 样例展示：结合 patch函数中的 insertBefore 和 removeChild 方法看
   * <body>
   *  <div id="app"></div> 原有的
   *  <div id="app"></div> 新生成的
   *  <script></script>
   * </body>
   *
   */

  const emptyNode = new VNode('', {}, []); // 创建空的虚拟节点对象

  const hooks = ['create', 'activate', 'update', 'remove', 'destroy'];
  function createPatchFunction(backend) {
    let i, j;
    const cbs = {}; // modules 对象中存储着处理 attrs、class 和 style等方法
    // nodeOps 对象中存储着 HTML DOM 方法。例如，document.createElement()

    const {
      modules,
      nodeOps
    } = backend; // 整合 modules 中的函数并将它们存在 cbs 对象中

    for (i = 0; i < hooks.length; ++i) {
      cbs[hooks[i]] = [];

      for (j = 0; j < modules.length; ++j) {
        if (isDef(modules[j][hooks[i]])) {
          cbs[hooks[i]].push(modules[j][hooks[i]]);
        }
      }
    } // done: 创建虚拟节点对象


    function emptyNodeAt(elm) {
      const node = new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm);
      return node;
    } // done: 调用 cbs.create 数组中函数(主要用于处理 class、style、指令等)


    function invokeCreateHooks(vnode, insertedVnodeQueue) {
      for (let i = 0; i < cbs.create.length; ++i) {
        cbs.create[i](emptyNode, vnode);
      }
    } // done: 创建元素


    function createElm(vnode, // 虚拟节点对象
    insertedVnodeQueue, // 存储已插入的 vnode 的队列
    parentElm, // vnode.elm 父元素
    refElm, // 紧跟在 vnode.elm 之后的元素
    nested, ownerArray, index) {
      if (isDef(vnode.elm) && isDef(ownerArray)) {
        // 这个 vnode 在之前的渲染中使用过!
        // 现在它被用作一个新节点，当它被用作插入参考节点时，覆盖它的 elm 会导致潜在的补丁错误。
        // 相反，我们在为节点创建相关的 DOM 元素之前按需克隆节点。
        vnode = ownerArray[index] = cloneVNode(vnode);
      }

      const data = vnode.data; // 获取元素属性

      const children = vnode.children; // 获取子元素

      const tag = vnode.tag; // 获取标签
      // 元素节点

      if (isDef(tag)) {
        vnode.elm = nodeOps.createElement(tag, vnode); // console.log('元素节点------>', vnode);
        // 创建子元素

        createChildren(vnode, children, insertedVnodeQueue);

        if (isDef(data)) {
          // 处理元素上的各种属性
          invokeCreateHooks(vnode);
        } // 插入元素


        insert(parentElm, vnode.elm, refElm);
      } else {
        // 纯文本节点
        // console.log('文本节点------>', vnode);
        vnode.elm = nodeOps.createTextNode(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      }
    } // DONE 创建子元素


    function createChildren(vnode, children, insertedVnodeQueue) {
      if (Array.isArray(children)) {
        // 检查 children 中的子节点是否有重复的 key 值
        checkDuplicateKeys(children);

        for (let i = 0; i < children.length; ++i) {
          createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
        }
      } else if (isPrimitive(vnode.text)) {
        // 是否为原始值
        nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text));
      }
    } // done: 检查 key 值是否重复


    function checkDuplicateKeys(children) {
      const seenKeys = {};

      for (let i = 0; i < children.length; i++) {
        const vnode = children[i];
        const key = vnode.key;

        if (isDef(key)) {
          if (seenKeys[key]) {
            console.log( // 检测到重复键:'${key}'。这可能会导致更新错误。
            `Duplicate keys detected: '${key}'. This may cause an update error.`, vnode.context);
          } else {
            seenKeys[key] = true;
          }
        }
      }
    } // done: 插入元素


    function insert(parent, elm, ref) {
      // 存在父级
      if (isDef(parent)) {
        // elm 之后存在元素（有同级的兄弟元素）
        if (isDef(ref)) {
          // elm 和 ref 元素的父级元素是同一个（elm 和 ref是同级兄弟元素）
          if (nodeOps.parentNode(ref) === parent) {
            nodeOps.insertBefore(parent, elm, ref);
          }
        } else {
          // elm 之后不存在元素
          nodeOps.appendChild(parent, elm);
        }
      }
    } // DONE 移除节点


    function removeVnodes(vnodes, startIdx, endIdx) {
      for (; startIdx <= endIdx; ++startIdx) {
        const ch = vnodes[startIdx];

        if (isDef(ch)) {
          removeNode(ch.elm);
        }
      }
    }

    function removeNode(el) {
      const parent = nodeOps.parentNode(el); // 元素可能已经由于 v-html 或 v-text而被删除

      if (isDef(parent)) {
        nodeOps.removeChild(parent, el);
      }
    }
    /**
     * DONE 将 vnode 虚拟节点生成相应的 HTML 元素
     * @param { HTMLDivElement } oldVnode => html
     * @param { Object } vnode => 虚拟节点对象
     */


    return function patch(oldVnode, vnode) {
      console.log("path---->执行", oldVnode, vnode);
      const insertedVnodeQueue = []; // 老节点不存在

      if (isUndef(oldVnode)) ; else {
        // 是否为真实元素
        const isRealElement = isDef(oldVnode.nodeType);

        if (isRealElement) {
          // 创建空节点对象（初始化部分数据）
          oldVnode = emptyNodeAt(oldVnode);
          console.log('是真实的元素，初始化oldVnode--->', oldVnode);
        } // 替换现有的 element


        const oldElm = oldVnode.elm;
        const parentElm = nodeOps.parentNode(oldElm); // 获取 oldElm 父元素
        // 创建新节点

        createElm(vnode, insertedVnodeQueue, parentElm, // 返回紧跟 oldElm 之后的元素
        nodeOps.nextSibling(oldElm)); // 销毁旧节点

        if (isDef(parentElm)) {
          console.log('执行销毁操作--->', oldVnode);
          removeVnodes([oldVnode], 0, 0);
        }
      }

      return vnode.elm;
    };
  }

  const isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck'); // DONE 是否为假值

  const isFalsyAttrValue = val => {
    return val == null || val === false;
  };

  function updateAttrs(oldVnode, vnode) {
    // 新旧虚拟节点都不存在 attr
    if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
      return;
    }

    let key, cur, old;
    const elm = vnode.elm;
    const oldAttrs = oldVnode.data.attrs || {};
    let attrs = vnode.data.attrs || {};

    for (key in attrs) {
      cur = attrs[key];
      old = oldAttrs[key]; // 新旧虚拟节点属性不同

      if (old !== cur) {
        setAttr(elm, key, cur);
      }
    }

    for (key in oldAttrs) {
      // attrs[key] 为 undefined 或 null
      if (isUndef(attrs[key])) {
        // key 值不是 contenteditable、draggable 和 spellcheck
        if (!isEnumeratedAttr(key)) {
          elm.removeAttribute(key); // 删除空属性
        }
      }
    }
  } // 设置属性


  function setAttr(el, key, value) {
    baseSetAttr(el, key, value);
  }

  function baseSetAttr(el, key, value) {
    // 若是假值，则删除属性
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, value);
    }
  }

  var attrs = {
    create: updateAttrs,
    update: updateAttrs
  };

  /* @flow */
  function genClassForVnode(vnode) {
    let data = vnode.data;
    return renderClass(data.staticClass, data.class);
  }
  function renderClass(staticClass, dynamicClass) {
    if (isDef(staticClass) || isDef(dynamicClass)) {
      return concat(staticClass, stringifyClass(dynamicClass));
    }

    return '';
  }
  function concat(a, b) {
    return a ? b ? a + ' ' + b : a : b || '';
  }
  function stringifyClass(value) {
    if (Array.isArray(value)) {
      return stringifyArray(value);
    }

    if (isObject(value)) {
      return stringifyObject(value);
    }

    if (typeof value === 'string') {
      return value;
    }

    return '';
  }

  function stringifyArray(value) {
    let res = '';
    let stringified;

    for (let i = 0, l = value.length; i < l; i++) {
      if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
        if (res) res += ' ';
        res += stringified;
      }
    }

    return res;
  }

  function stringifyObject(value) {
    let res = '';

    for (const key in value) {
      if (value[key]) {
        if (res) res += ' ';
        res += key;
      }
    }

    return res;
  }

  function updateClass(oldVnode, vnode) {
    const el = vnode.elm;
    const data = vnode.data;
    const oldData = oldVnode.data;

    if (isUndef(data.staticClass) && isUndef(data.class) && (isUndef(oldData) || isUndef(oldData.staticClass) && isUndef(oldData.class))) {
      return;
    }

    let cls = genClassForVnode(vnode); // 设置 class

    if (cls !== el._prevClass) {
      el.setAttribute('class', cls);
      el._prevClass = cls;
    }
  }

  var klass = {
    create: updateClass,
    update: updateClass
  };

  var platformModules = [attrs, klass];

  const modules = platformModules;
  const patch = createPatchFunction({
    nodeOps,
    modules
  });

  function initMixin(Vue) {
    // 初始化函数
    Vue.prototype._init = function (options) {
      const vm = this; // 存储 this（ Vue实例 ）

      vm.$options = options; // 将 options 挂载到 vm 上，以便后续使用
      // Vue 实例中的 data、 props、methods、computed 和 watch，都会在 initState 函数中
      // 进行初始化。由于我们主要解说：Vue 数据劫持，所以只对 data 进行处理。

      initState(vm);

      if (vm.$options.el) {
        // Vue.prototype.$mount --> 挂载函数
        vm.$mount(vm.$options.el);
      }
    }; // 挂载函数


    Vue.prototype.$mount = function (el) {
      const vm = this;
      const options = vm.$options; // Vue 选项中的 render 函数若存在，则 Vue 构造函数不会从
      // template 选项或通过 el 选项指定的挂载元素中提取出的 HTML 模板编译渲染函数。
      // 处理模板（优先级）: render  >  template   >  html模板
      // 若是 render 函数不存在，就生成 render

      if (!options.render) {
        let template = options.template; // 获取模板
        // el存在，且 template 不存在

        if (el && !template) {
          // 挂载 el（ HTML 模板），以便在实例的 _update 方法中使用
          vm.$el = document.querySelector(el);
          template = vm.$el.outerHTML;
        } // 编译模板，生成 AST 抽象语法树并将其生成渲染函数 render


        const render = compileToFunctions(template, baseOptions);
        options.render = render; // 挂载 render
      } // 挂载组件


      mountComponent(vm);
    }; // patch 函数，用于创建文档树


    Vue.prototype.__patch__ = patch;
  }

  // 对于普通的HTML标记，可以完全跳过标准化，因为生成的渲染函数保证返回 Array<VNode>。
  // 且有两种情况需要额外的规范化:
  // 1. 当子组件包含组件时——因为函数组件可能返回Array而不是单个根。
  // 在这种情况下，只需要一个简单的标准化——如果任何子元素是Array，我们就用Array.prototype.concat将整个元素平化。
  // 它保证只有一级深度，因为功能组件已经规范化了它们自己的子组件。
  // 2. 当子元素包含总是生成嵌套数组的构造时，例如：<template>, <slot>, v-for 或者当用户用手写的 render函数 / JSX 提供子对象时。
  // 在这种情况下，需要完全标准化，以满足所有可能类型的子元素值。
  // done: 对 children 进行完全标准化
  // normalizeChildren 用于第二种情况，且在目前的代码中只做了对 v-for 的处理

  function normalizeChildren(children) {
    return isPrimitive(children) ? [createTextVNode(children)] : Array.isArray(children) ? normalizeArrayChildren(children) : undefined;
  } // done: 是否为文本节点

  function isTextNode(node) {
    return isDef(node) && isDef(node.text) && isFalse(node.isComment);
  } // done: 标准化数组子元素


  function normalizeArrayChildren(children, nestedIndex) {
    const res = [];
    let i, c, lastIndex, last;

    for (i = 0; i < children.length; i++) {
      c = children[i];
      if (isUndef(c) || typeof c === 'boolean') continue;
      lastIndex = res.length - 1;
      last = res[lastIndex]; //  处理嵌套

      if (Array.isArray(c)) {
        if (c.length > 0) {
          c = normalizeArrayChildren(c, `${nestedIndex || ''}_${i}`); // 合并相邻文本节点

          if (isTextNode(c[0]) && isTextNode(last)) {
            res[lastIndex] = createTextVNode(last.text + c[0].text);
            c.shift();
          }

          res.push.apply(res, c);
        }
      } else if (isPrimitive(c)) {
        // 是否为原始值
        if (isTextNode(last)) {
          // 合并相邻的文本节点，这对于 SSR hydration 是必要的，
          // 因为文本节点在呈现为HTML字符串时本质上是合并的
          res[lastIndex] = createTextVNode(last.text + c);
        } else if (c !== '') {
          // 将 primitive 转换为 vnode
          res.push(createTextVNode(c));
        }
      } else {
        if (isTextNode(c) && isTextNode(last)) {
          // 合并相邻的文本节点
          res[lastIndex] = createTextVNode(last.text + c.text);
        } else {
          // 嵌套数组子数组的默认键(可能由v-for生成)
          if (isTrue(children._isVList) && isDef(c.tag) && isUndef(c.key) && isDef(nestedIndex)) {
            c.key = `__vlist${nestedIndex}_${i}__`;
          }

          res.push(c);
        }
      }
    }

    return res;
  }

  const ALWAYS_NORMALIZE = 2; // done: 创建元素 vnode 的包装器函数，提供更灵活的接口且不会被干扰

  function createElement(tag, data, children, normalizationType, alwaysNormalize) {
    // data 是数组或原始值，则对数据进行替换。
    // 对于此处逻辑代码，建议结合生成的 render 渲染函数（看 Readme.md 文档）和 vue 官网文档-虚拟 DOM 章节进行理解(下方是链接)
    // https://cn.vuejs.org/v2/guide/render-function.html#%E8%99%9A%E6%8B%9F-DOM
    if (Array.isArray(data) || isPrimitive(data)) {
      // console.log("data是数组或原始值------------------->", tag, data, children);
      normalizationType = children;
      children = data;
      data = undefined;
    } // normalizationType 值: 1 代表简单标准化  2 代表完全标准化
    // alwaysNormalize 为 true，则需要对 children 进行完全标准化。


    if (isTrue(alwaysNormalize)) {
      normalizationType = ALWAYS_NORMALIZE;
    }

    return _createElement(tag, data, children, normalizationType);
  } // done: 创建元素 vnode

  function _createElement(tag, data, children, normalizationType) {
    // console.log("_createElement--->执行", tag, data, children);
    if (normalizationType === ALWAYS_NORMALIZE) {
      children = normalizeChildren(children); // children 需要完全标准化
    }

    let vnode;

    if (typeof tag === "string") {
      vnode = new VNode(tag, data, children, undefined, undefined);
    }

    return vnode;
  }

  function renderList(val, render) {
    var ret, i, l, keys, key;

    if (Array.isArray(val) || typeof val === "string") {
      // val 是数组或字符串
      ret = new Array(val.length);

      for (i = 0, l = val.length; i < l; i++) {
        // console.log('有ret------------------>', val[i], i);
        ret[i] = render(val[i], i);
      }
    } else if (typeof val === "number") {
      // val 是数字
      ret = new Array(val);

      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i);
      }
    } else if (isObject(val)) {
      // val 是 'object' 对象
      if (hasSymbol && val[Symbol.iterator]) {
        // val 是 Symbol
        ret = [];
        var iterator = val[Symbol.iterator]();
        var result = iterator.next();

        while (!result.done) {
          ret.push(render(result.value, ret.length));
          result = iterator.next();
        }
      } else {
        // val 是普通对象
        keys = Object.keys(val);
        ret = new Array(keys.length);

        for (i = 0, l = keys.length; i < l; i++) {
          key = keys[i];
          ret[i] = render(val[key], key, i);
        }
      }
    } // ret 不存在，则设置为空数组


    if (!isDef(ret)) {
      ret = [];
    } // 标记为已处理


    ret._isVList = true;
    return ret;
  }

  function installRenderHelpers(target) {
    target._v = createTextVNode;
    target._c = createElement;
    target._s = toString;
    target._l = renderList;
  }

  function renderMixin(Vue) {
    // 安装运行时所需的辅助性渲染函数
    installRenderHelpers(Vue.prototype); // 调用 vm.$options.render 渲染函数，生成虚拟节点

    Vue.prototype._render = function () {
      const vm = this;
      const vnode = vm.$options.render.call(vm); // 生成虚拟节点对象并返回

      return vnode;
    };
  }

  function Vue(options) {
    // 通过关键字 new 创建 Vue实例时，便会调用 Vue 原型方法 _init 初始化数据
    this._init(options);
  } // 初始化相关操作


  initMixin(Vue); // 生命周期相关操作

  lifecycleMixin(Vue); // 渲染相关操作

  renderMixin(Vue);

  Vue.version = '2.0';

  return Vue;

})));
//# sourceMappingURL=vue.js.map
