import { cached } from '../../../shared/util';

// DONE 创建一个解析 style 文本的函数。例如，"width: 100%;height: 50px;"
export const parseStyleText = cached(function (cssText) {
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
