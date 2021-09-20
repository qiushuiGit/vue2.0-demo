(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  const originArrMethods = Array.prototype,
        newArrMethods = Object.create(originArrMethods);
  const ARR_METHODS = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
  ARR_METHODS.map(method => {
    newArrMethods[method] = function (...args) {
      const result = originArrMethods[methods].apply(this, args),
            ob = this.__ob__;
      let newArr;

      switch (method) {
        case 'push':
        case 'unshift':
          newArr = args;
          break;

        case 'splice':
          newArr = args.slice(2);
          break;
      }

      if (newArr) ob.observeArr(newArr);
      return result;
    };
  });

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get() {
        return vm[target][key];
      },

      set(newValue) {
        if (vm[target][key] === newValue) return;
        vm[target][key] = newValue;
      }

    });
  }

  function isObject(value) {
    return typeof value === 'object' && value !== null;
  }

  function isArray(value) {
    return Array.isArray(value);
  }

  function setConstantProperty(data, key, value) {
    Object.defineProperty(data, key, {
      enumerable: false,
      configurable: false,
      value
    });
  }

  class Observer {
    constructor(data) {
      setConstantProperty(data, '__ob__', this);

      if (isArray(data)) {
        data.__proto__ = newArrMethods;
        this.observeArr(data);
      } else {
        this.walk(data);
      }
    }

    walk(data) {
      const keys = Object.keys(data);
      keys.map(key => {
        defineReactive(data, key, data[key]);
      });
    }

    observeArr(data) {
      data.map(item => {
        observe(item);
      });
    }

  }

  function defineReactive(data, key, value) {
    observe(value);
    Object.defineProperty(data, key, {
      get() {
        console.log('响应式获取：' + value);
        return value;
      },

      set(newValue) {
        if (value === newValue) return;
        console.log('响应式设置：' + key + ' = ' + newValue);
        observe(newValue);
        value = newValue;
      }

    });
  }

  function observe(data) {
    if (!isObject(data) || data.__ob__) {
      return data;
    }

    new Observer(data);
  }

  function initState(vm) {
    const options = vm.$options;

    if (options.data) {
      initData(vm);
    }
  }

  function initData(vm) {
    let data = vm.$options.data;
    vm._data = data = typeof data === 'function' ? data.call(vm) : data;

    for (let key in data) {
      proxy(vm, '_data', key);
    }

    observe(data);
  }

  // id="app" id='app' id=app
  const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //标签名  <my-header></my-header>

  const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // <my:header></my:header>

  const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // <div

  const startTagOpen = new RegExp(`^<${qnameCapture}`); // > />

  const startTagClose = /^\s*(\/?)>/; // </div>

  const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
  /*
  <div id="app" style="color: red;font-size: 20px;">
      你好，{{ name }}
      <span class="text" style="color: green">{{age}}</span>
    </div>
  */

  function parseHtmlToAst(html) {
    let text,
        root,
        currentParent,
        stack = [];

    while (html) {
      let textEnd = html.indexOf('<');

      if (textEnd === 0) {
        const startTagMatch = parseStartTag();

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        const endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }

      if (textEnd > 0) {
        text = html.substring(0, textEnd);
      }

      if (text) {
        advance(text.length);
        chars(text);
      }
    }

    function parseStartTag() {
      const start = html.match(startTagOpen);
      let end, attr;

      if (start) {
        const match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length);

        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
          advance(attr[0].length);
        }

        if (end) {
          advance(end[0].length);
          return match;
        }
      }
    }

    function advance(n) {
      html = html.substring(n);
    } // currentParent div
    //stack [div]


    function start(tagName, attrs) {
      const element = createASTElement(tagName, attrs);

      if (!root) {
        root = element;
      }

      currentParent = element;
      stack.push(element);
    }

    function end(tagName) {
      // span
      const element = stack.pop(); // div

      currentParent = stack[stack.length - 1];

      if (currentParent) {
        // span => parent => div
        element.parent = currentParent; // div => children => push => span

        currentParent.children.push(element);
      }
    }

    function chars(text) {
      text = text.trim();

      if (text.length > 0) {
        currentParent.children.push({
          type: 3,
          text
        });
      }
    }

    function createASTElement(tagName, attrs) {
      return {
        tag: tagName,
        type: 1,
        children: [],
        attrs,
        parent
      };
    }

    return root;
  }

  /*
  <div id="app" style="color: red;font-size: 20px;">
    你好，{{ name }}
    <span class="text" style="color: green">{{age}}</span>
  </div>

  _c() => createElement()
  _v() => createTextNode()
  _s() => {{name}} => _s(name)
  */
  // function render() {
  //   return `
  //     _c(
  //       "div", 
  //       {
  //         id: "app", 
  //         style: { 
  //           "color": "red", 
  //           "font-size": "20px" 
  //         }
  //       },
  //       _v("你好，"+_s(name)),
  //       _c(
  //         "span",
  //         {
  //           "class": "text",
  //           "style": {
  //             "color": "green"
  //           }
  //         },
  //         _v(_s(age))
  //       )  
  //     )
  //   `;
  // }
  const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function formatProps(attrs) {
    let attrStr = '';

    for (var i = 0; i < attrs.length; i++) {
      let attr = attrs[i];

      if (attr.name === 'style') {
        let styleAttrs = {};
        attr.value.split(';').map(styleAttr => {
          let [key, value] = styleAttr.split(':');
          styleAttrs[key] = value;
        });
        attr.value = styleAttrs;
      }

      attrStr += `${attr.name}:${JSON.stringify(attr.value)},`;
    }

    return `{${attrStr.slice(0, -1)}}`;
  }

  function generateChild(node) {
    if (node.type === 1) {
      return generate(node);
    } else if (node.type === 3) {
      let text = node.text;

      if (!defaultTagRE.test(text)) {
        return `_v(${JSON.stringify(text)})`;
      }

      let match,
          index,
          lastIndex = defaultTagRE.lastIndex = 0,
          textArr = [];

      while (match = defaultTagRE.exec(text)) {
        index = match.index;

        if (index > lastIndex) {
          textArr.push(JSON.stringify(text.slice(lastIndex, index)));
        }

        textArr.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length;
      }

      if (lastIndex < text.length) {
        textArr.push(JSON.stringify(text.slice(lastIndex)));
      }

      return `_v(${textArr.join('+')})`;
    }
  }

  function geChildren(el) {
    const children = el.children;

    if (children) {
      return children.map(c => generateChild(c)).join(',');
    }
  }

  function generate(el) {
    let children = geChildren(el);
    let code = `_c('${el.tag}', ${el.attrs.length > 0 ? `${formatProps(el.attrs)}` : 'undefined'}${children ? `,${children}` : ''})`;
    return code;
  }

  function compileToRenderFunction(html) {
    const ast = parseHtmlToAst(html),
          code = generate(ast),
          render = new Function(`
          with(this){ return ${code} }
        `);
    return render;
  }

  function patch(oldNode, vNode) {
    let el = createElement$1(vNode),
        parentElement = oldNode.parentNode;
    parentElement.insertBefore(el, oldNode.nextSibling);
    parentElement.removeChild(oldNode);
  }

  function createElement$1(vnode) {
    const {
      tag,
      props,
      children,
      text
    } = vnode;

    if (typeof tag === 'string') {
      vnode.el = document.createElement(tag);
      updateProps(vnode);
      children.map(child => {
        vnode.el.appendChild(createElement$1(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function updateProps(vnode) {
    const el = vnode.el,
          newProps = vnode.props || {};

    for (let key in newProps) {
      if (key === 'style') {
        for (let sKey in newProps.style) {
          el.style[sKey] = newProps.style[sKey];
        }
      } else if (key === 'class') {
        el.className = el.class;
      } else {
        el.setAttribute(key, newProps[key]);
      }
    }
  }

  function mountComponent(vm) {
    // vnode
    vm._update(vm._render());
  }

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      const vm = this;
      patch(vm.$el, vnode);
    };
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      const vm = this;
      vm.$options = options;
      initState(vm);

      if (vm.$options.el) {
        // 挂载函数   Vue.prototype.$mount
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      const vm = this,
            options = vm.$options;
      el = document.querySelector(el), vm.$el = el;

      if (!options.render) {
        let template = options.template;

        if (!template && el) {
          template = el.outerHTML;
        }

        const render = compileToRenderFunction(template);
        options.render = render;
      }

      mountComponent(vm);
    };
  }

  function createElement(tag, attrs = {}, ...children) {
    return vnode(tag, attrs, children);
  }

  function createTextVnode(text) {
    return vnode(undefined, undefined, undefined, text);
  }

  function vnode(tag, props, children, text) {
    return {
      tag,
      props,
      children,
      text
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._c = function () {
      return createElement(...arguments);
    };

    Vue.prototype._s = function (value) {
      if (value === null) return;
      return typeof value === 'object' ? JSON.stringify(value) : value;
    };

    Vue.prototype._v = function (text) {
      return createTextVnode(text);
    };

    Vue.prototype._render = function () {
      const vm = this,
            render = vm.$options.render,
            vnode = render.call(vm);
      return vnode;
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);
  lifecycleMixin(Vue);
  renderMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
