import { parseText } from './text-parser';
import { parseHTML } from './html-parser';
import { addAttr } from '../helpers';
import { extend } from '../../shared/util';
import {
    getAndRemoveAttr,
    getBindingAttr,
    pluckModuleFunction
} from '../helpers';

// 匹配 v-for='(item,index) in arrList' 中的：'(item,index) in arrList'，这里仅是举例
const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
// 匹配圆括号 ——> ()
const stripParensRE = /^\(|\)$/g;
// 匹配',' 和 'index'，例如：item, index ——> , index
const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;

/*
  假设模板样例：
   <div id="app" style="color: #f66;font-size: 20px;">
    函数字符串，{{ tip }}
    <span class="cla">{{ studentNum }}</span>
  </div>
*/

let transforms;

// done: 解析模版字符串，生成 ast 语法树
export function parse(template, options) {
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
                        type: 2, // 标记 ast 对象子元素的类型
                        text,
                        expression: res.expression,
                        tokens: res.tokens
                    };
    
                } else if (
                    text !== ' ' ||
                    !children.length ||
                    children[children.length - 1].text !== ' '
                ) {
                    
                    child = {
                        type: 3, // 标记 ast 对象子元素的类型
                        text,
                    };
                    
                }

                if (child) {
                    children.push(child);
                }
            }
        }
    });

    return root;
}

// done: 生成 ast 对象
function createASTElement(tagName, attrs) {
    return {
        tag: tagName, // 标签名
        type: 1, // 标记 ast 对象类型
        children: [], // 标签子级
        attrsList: attrs, // 标签属性
        attrsMap: makeAttrsMap(attrs),
        parent // 标签父级
    };
}

// DONE 标签属性的映射
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
}
// done: 处理 v-for 指令
function processFor(el) {
    // 获取并从 attrsList 数组中删除属性
    const exp = getAndRemoveAttr(el, 'v-for');
    // 判断 v-for 是否存在
    if (exp && typeof exp === 'string') {
        const res = parseFor(exp); // 解析 v-for 指令
        if (res) {
            // 将 res 中的属性（例如：item、arrList）添加到目标对象（el即ast对象）中
            extend(el, res);
        } else {
            console.log(`Invalid v-for expression: ${exp}`);
        }
    }
}
// done: 解析 v-for 指令
function parseFor(exp) {
    // 匹配 v-for='(item,index) in arrList' 中的：'(item,index) in arrList'，这里仅是举例
    const inMatch = exp.match(forAliasRE);
    // 如果没有找到任何匹配的文本， match() 将返回 null。否则，它将返回一个数组，
    // 其中存放了与它找到的匹配文本有关的信息。
    if (!inMatch) return;

    const res = {};
    // 获取 arrList 并去掉其前后空格
    res.for = inMatch[2].trim();
    // 获取 (item, index) 并去掉其前后空格以及将圆括号即 () 替换为空。例如：(item, index) ——> item, index
    const alias = inMatch[1].trim().replace(stripParensRE, '');
    // 匹配 ',' 和 'index'，例如：item, index ——> , index
    const iteratorMatch = alias.match(forIteratorRE);

    // iteratorMatch 为真，说明你使用 v-for 时，写的是 (item, index)。否则，就是 (item) 或 item。
    if (iteratorMatch) {
        // 将 ',' 和 'index'替换为空，得到 item 并去除其前后空格。例如：item, index ——> item
        res.alias = alias.replace(forIteratorRE, '').trim();
        // 获取 index 并去除其前后空格
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
}

// done: 处理 ast 对象
function processElement(element) {
    // 处理 key
    processKey(element);

    // 在删除结构属性后确定这是否是普通元素
    element.plain =
        !element.key && !element.scopedSlots && !element.attrsList.length;

    // 处理 class 或 style 属性
    for (let i = 0; i < transforms.length; i++) {
        element = transforms[i](element) || element;
    }
    
    processAttrs(element); // 处理属性

    return element;
}

// done: 处理 key
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

            if (
                iterator &&
                iterator === exp &&
                parent &&
                parent.tag === 'transition-group'
            ) {
                console.log(
                    `不要使用 v-for 索引（index）作为 <transition-group> 子节点的 key`
                );
                return false;
            }
        }

        el.key = exp;
    }
}

// DONE 处理属性
function processAttrs(el) {
    const list = el.attrsList;
    let i, l, name, rawName, value;

    for (i = 0, l = list.length; i < l; i++) {
        name = rawName = list[i].name;
        value = list[i].value;
        // 为 ast 对象添加 attrs 属性，用于存放 ast 中的属性
        addAttr(el, name, JSON.stringify(value), list[i]);
    }
}
