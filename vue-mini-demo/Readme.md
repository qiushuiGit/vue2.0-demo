### render 渲染函数

```js
// 生成 render 渲染函数
const render = new Function(`with(this){ return ${code} }`);
```

```js
// render 函数——打印结果
(function anonymous() {
  with (this) {
    return _c(
      "div",
      {
        staticStyle: { color: "red", "font-size": "20px" },
        attrs: { id: "app" },
      },
      [
        _l(students, function (item, index) {
          return _c("span", { key: item.id }, [_v(_s(item.name))]);
        }),
        _c("div", [_v("姓名：" + _s(name) + "，嘿嘿")]),
      ],
      2
    );
  }
});
```
