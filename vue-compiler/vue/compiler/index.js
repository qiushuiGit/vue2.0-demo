import { parseHtml } from './parser';
import { generate } from './generate';

//编译：HTML字符串（ template ） => AST => render
function compileToFunctions(html) {
  // 解析 HTML 字符串，将其转换成 AST 抽象语法树
  const ast = parseHtml(html);
  console.log('生成 AST 语法树', ast);
  // 将 AST 转换成函数字符串
  const code = generate(ast);
  console.log('AST 转换成函数字符串', code);
  // 生成 render 渲染函数
  const render = new Function(`with(this){ return ${code} }`);

  return render;
}

export {
  compileToFunctions
}