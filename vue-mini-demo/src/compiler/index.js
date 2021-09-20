import { parse } from './parser/index';
import { generate } from './codegen/index';

//编译：HTML字符串（ template ） => AST => render
export function compileToFunctions(html, options) {
  // 解析 HTML 字符串，将其转换成 AST 抽象语法树
  const ast = parse(html, options);
  // 将 AST 转换成字符串函数
  const code = generate(ast, options);
  // 生成 render 渲染函数
  const render = new Function(`with(this){ return ${code} }`);

  console.log('生成render-->', render);
  return render;
}

