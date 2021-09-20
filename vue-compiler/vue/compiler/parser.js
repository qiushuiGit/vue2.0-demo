// 匹配属性： id="app"、id='app' 或 id=app
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
// 匹配标签：<my-header></my-header>
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
// 匹配标签：<my:header></my:header>
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
// 匹配开始标签：<div
const startTagOpen = new RegExp(`^<${qnameCapture}`);
// 匹配闭合标签： > 或 />
const startTagClose = /^\s*(\/?)>/;
// 匹配结束标签： </div>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);

/*
  假设模板样例：
   <div id="app" style="color: #f66;font-size: 20px;">
    函数字符串，{{ tip }}
    <span class="cla">{{ studentNum }}</span>
  </div>
*/

// 解析模版字符串，生成 AST 语法树
function parseHtml(html) {
  const stack = []; // 所有开始标签的初始 AST 对象
  let root; // 最终返回的 AST 对象
  let text; // 纯文本
  let currentParent; // 当前元素的父级

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
      const startTagMatch = parseStartTag();
      // console.log('解析——开始标签——结果', startTagMatch);

      // 处理开始标签
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue; // 执行到 continue，将开始新的一轮循环，后续代码不会执行
      }

      const endTagMatch = html.match(endTag); // 匹配结束标签

      // 处理结束标签
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
        continue;
      }
    }
    // 截取 HTML 模版字符串中的文本
    if (textEnd > 0) {
      text = html.substring(0, textEnd);
    }
    // 处理文本内容
    if (text) {
      advance(text.length);
      chars(text);
    }
  }

  // 解析开始标签及其属性，例如：<div id="app">
  function parseStartTag() {
    // 如果没有找到任何匹配的文本， match() 将返回 null。否则，它返回一个数组，
    // 其中存放了与它找到的匹配文本有关的信息。
    const start = html.match(startTagOpen); // 匹配开始标签
    let end, attr;
    if (start) {
      // 存放开始标签名和属性
      const match = {
        tagName: start[1], // 开始标签的名，例如：div
        attrs: [] // 开始标签的属性，例如：{ name: 'id', value: 'app' }
      }

      // 删除已匹配到的 HTML 字符串，保留未匹配到的。
      // 例如：匹配到 <div id="app"></div> 中的 <div，调用 advance() 方法后，
      // 原 HTML 字符窜就是这样：id="app"></div>
      advance(start[0].length);

      // 当匹配到属性（ 形如：id='app'），但未匹配到开始标签的闭合（ 形如：> ）时，进入循环
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        match.attrs.push({
          name: attr[1], // 属性名: id
          // 若是你在通过 new 关键字创建 vue 实例时，提供了 template 选项
          // 且在它的字符串中,有的标签的属性使用的是单引号或者没有带引号，
          // 例如：<div id='app'></div> 或 <div id=app></div> 这种形式，那么
          // 在匹配标签的属性时，其返回的数组中这个属性的值，可能在此数组的 下标4 或 下标5
          value: attr[3] || attr[4] || attr[5] // 属性值: app
        });

        advance(attr[0].length);
      }

      // 如果匹配到开始标签的闭合（ 形如：> ），则返回 match 对象
      if (end) {
        advance(end[0].length);
        return match;
      }
    }
  }
  // 截取 HTML 字符串，将已匹配到的字符从原有字符中删除。
  function advance(n) {
    // substring() 方法用于提取字符串中介于两个指定下标之间的字符。
    html = html.substring(n);
  }

  function start(tag, attrs) {
    // 创建 AST 对象
    const element = createASTElement(tag, attrs);
    // 如果 root 根节点不存在，则说明当前节点即是整个模版的最顶层节点，也就是第一个节点
    if (!root) {
      root = element;
    }
    // 保存当前父节点（AST 对象）
    currentParent = element;
    // 将 AST 对象 push 到 stack 栈中，当解析到其相对应的结束标签时，
    // 则将这个标签对应的 AST 对象 从栈中 pop 出来。

    // 原因：解析开始标签时，是顺时针；解析结束标签时，是逆时针。结合模板样例看，
    // 解析顺序如下：<div> => <span> => ...  => </span> => </div>

    // 因此，解析开始标签生成的 AST 对象被 push 到栈中后，若想在解析到其相应的结束标签时取出，
    // 则要使用 pop。整个操作流程，结合 start() 和 end() 方法一起看，会更易理解。

    stack.push(element);
  }

  function end(tag) {
    // pop() 方法将删除数组的最后一个元素，把数组长度减 1，并且返回它删除的元素的值。
    // 如果数组已经为空，则 pop() 不改变数组，并返回 undefined 值。

    const element = stack.pop(); // 获取当前元素标签的 AST 对象
    currentParent = stack[stack.length - 1]; // 获取当前元素标签的父级 AST 对象

    if (currentParent) {
      // 标记父子元素
      element.parent = currentParent; // 子元素存储父元素
      currentParent.children.push(element); // 父元素存入子元素
    }
  }

  function chars(text) {
    text = text.trim(); // 去掉首尾空格

    // 若文本存在，则直接放入父级的 children 中
    if (text && text !== ' ') {
      const element = {
        type: 3, // 文本元素的节点类型（nodeType）：3
        text
      };
      
      currentParent.children.push(element);
    }
  }

  return root;
}

// 生成 AST 对象
function createASTElement(tagName, attrs) {
  return {
    tag: tagName, // 标签名
    type: 1, // 标签元素的节点类型（nodeType）：1
    children: [], // 标签子级
    attrs, // 标签属性
    parent // 标签父级
  }
}


export {
  parseHtml
}