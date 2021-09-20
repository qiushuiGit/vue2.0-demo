/* 
  以下三个个函数的作用：

  _c() => createElement() 创建元素节点

  _v() => createTextNode() 创建文本节点

  _s(value) => _s(tip) 解析双大括号，例如：{{tip}}
*/

/*
  AST => render 渲染函数

  function render() {
    return `_c("div",{id: "app",style:{ "color":"#f66","font-size":"20px"}},
      _v("函数字符串，"+_s(tip)),
      _c("span", { "class": "cla", "style": { "color": "green" } }, _v(_s(studentNum)))  
    )`;
  }
*/

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配双大括号 => {{tip}}

// 生成函数字符串
function generate(el) {
  const children = genChildren(el);
  const code = `_c('${el.tag}', ${el.attrs.length > 0 ? `${jointAttrs(el.attrs)}` : 'undefined'}${children ? `,${children}` : ''})`;

  return code;
}

// 将属性拼接成字符串，例如：`style:{ "color":"#f66","font-size":"20px"}`
function jointAttrs(attrs) {
  let str = '';

  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    // 处理 style 属性
    if (attr.name === 'style') {
      let attrValue = {};

      attr.value.split(';').map((itemArr) => {
        let [key, value] = itemArr.split(':');
        if (key) {
          attrValue[key] = value;
        }
      });
      attr.value = attrValue;
    }
    // 拼接属性（注意：不要忘记逗号）
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }

  // str.slice(0, -1) 是为了去掉字符串最后一个逗号
  return `{${str.slice(0, -1)}}`;
}

// 生成子节点
function genChildren(el) {
  const children = el.children;
  // 是否存在子节点
  if (children.length) {
    return children.map(c => genNode(c)).join(',');
  }
}

// 根据节点类型的不同进行相应处理
function genNode(node) {
  if (node.type === 1) { // 元素节点

    return generate(node);
  } else if (node.type === 3) { // 文本节点

    let text = node.text;

    if (defaultTagRE.test(text)) { // 处理双大括号
      let match,
      index,
      textArray = [],
      // lastIndex 下一次匹配开始的位置。每次循环时，都将其初始为 0，是为防止处理其它文本时，
      // 取到 lastIndex 是上一个循环结束后保留下的值而导致出错。
      lastIndex = defaultTagRE.lastIndex = 0;

      // 样例参考：<div>函数字符串，{{ tip }} 哈哈</div>

      // 处理双大括号和其之前的纯文本：函数字符串，{{ tip }}
      while (match = defaultTagRE.exec(text)) {

        index = match.index; // 双大括号的下标位置

        if (index > lastIndex) { // 截取双大括号前面的纯文本
          textArray.push(JSON.stringify(text.slice(lastIndex, index)));
        }

        textArray.push(`_s(${match[1].trim()})`); // 双大括号
        lastIndex = index + match[0].length; // 标记下一次匹配开始的位置
      }

      // 处理双大括号之后的存文本：哈哈
      if (lastIndex < text.length) {
        textArray.push(JSON.stringify(text.slice(lastIndex)));
      }

      return `_v(${textArray.join('+')})`; // 拼接整行文本

    } else { // 处理纯文本

      return `_v(${JSON.stringify(text)})`;
    }

  }
}

export {
  generate
}