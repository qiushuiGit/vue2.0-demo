// 匹配双大括号 => {{tip}}
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

export function parseText(text) {
  const tagRE = defaultTagRE;

  if (!tagRE.test(text)) {
    return false;
  }

  const tokens = [];
  const rawTokens = [];

  // lastIndex 下一次匹配开始的位置。每次循环时，都将其初始为 0，是为防止处理其它文本时，
  // 取到 lastIndex 是上一个循环结束后保留下的值而导致出错。
  let lastIndex = tagRE.lastIndex = 0;
  let match, index, tokenValue;

  // 文本样例解析参考：<div>函数字符串，{{ tip }} 哈哈</div>

  while ((match = tagRE.exec(text))) {
    index = match.index;

    if (index > lastIndex) { // 截取 {{ tip }} 前面的纯文本
      rawTokens.push(tokenValue = text.slice(lastIndex, index));
      tokens.push(JSON.stringify(tokenValue))
    }
    // 获取 {{ tip }} 中的 tip
    const exp = match[1].trim();
    tokens.push(`_s(${exp})`);
    rawTokens.push({
      '@binding': exp
    });

    lastIndex = index + match[0].length; // 标记下一次匹配开始的位置
  }

   // 截取 {{ tip }} 之后的存文本
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex));
    tokens.push(JSON.stringify(tokenValue));
  }

  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  }
}