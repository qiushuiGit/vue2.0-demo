import { pluckModuleFunction } from "../parser/helpers";

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
    dataGenFns: pluckModuleFunction(options.modules, "genData"),
  };
}

// DONE 生成 code 代码字符串
export function generate(ast, options) {
  const state = codegenState(options);
  const code = ast
    ? ast.tag === "script"
      ? "null"
      : genElement(ast, state)
    : '_c("div")';

  return code;
}

// DONE 生成 code 代码字符串
function genElement(el, state) {
  if (el.for && !el.forProcessed) {
    return genFor(el, state);
  } else {
    // 处理 element
    let code;
    let data;

    if (!el.plain) {
      data = genData(el, state);
    }

    const children = genChildren(el, state, true);

    code = `_c('${el.tag}'${
      data ? `,${data}` : "" // data
    }${
      children ? `,${children}` : "" // children
    })`;

    return code;
  }
}

// DONE 处理有 v-for 指令的 ast 对象
function genFor(el, state) {
  const exp = el.for;
  const alias = el.alias;
  const iterator1 = el.iterator1 ? `,${el.iterator1}` : "";
  const iterator2 = el.iterator2 ? `,${el.iterator2}` : "";

  el.forProcessed = true; // 避免递归时，重复处理

  return (
    `${"_l"}((${exp}),` +
    `function(${alias}${iterator1}${iterator2}){` +
    `return ${genElement(el, state)}` +
    "})"
  );
}

// DONE 处理 ast 对象中的各种属性
function genData(el, state) {
  let data = "{";

  // key
  if (el.key) {
    data += `key:${el.key},`;
  }

  // 拼接已处理好的 class 或 style 属性
  for (let i = 0; i < state.dataGenFns.length; i++) {
    data += state.dataGenFns[i](el);
  }
  // attributes
  if (el.attrs) {
    data += `attrs:${genProps(el.attrs)},`;
  }

  data = data.replace(/,$/, "") + "}";

  return data;
}

// DONE 处理子节点
function genChildren(el, state, checkSkip) {
  const children = el.children;
  // 是否存在子节点
  if (children.length) {
    const normalizationType = checkSkip
      ? getNormalizationType(children, state.maybeComponent)
      : 0;
      
    return `[${children.map((c) => genNode(c, state)).join(",")}]${
      normalizationType ? `,${normalizationType}` : ""
    }`;
  }
}

// DONE 确定子数组需要的规范化。
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
}

// DONE 将属性拼接成字符串
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
}
// DONE 根据类型的不同进行相应处理
function genNode(node, state) {
  if (node.type === 1) {
    // 元素节点
    return genElement(node, state);
  } else {
    // 文本节点
    return genText(node);
  }
}

// DONE 处理文本节点
function genText(text) {
  // 在模板编译阶段，已通过 parseText 函数对文本进行了处理
  return `_v(${
    text.type === 2
      ? text.expression
      : transformSpecialNewlines(JSON.stringify(text.text))
  })`;
}

// \u2028（行分隔符） 和 \u2029（段落分隔符）会被浏览器理解为换行，
// 而在Javascript的字符串表达式中是不允许换行的，那样会导致错误。
function transformSpecialNewlines(text) {
  return text.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
