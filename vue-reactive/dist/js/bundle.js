!function(t){var e={};function n(o){if(e[o])return e[o].exports;var r=e[o]={i:o,l:!1,exports:{}};return t[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=t,n.c=e,n.d=function(t,e,o){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:o})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)n.d(o,r,function(e){return t[e]}.bind(null,r));return o},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){"use strict";n.r(e);var o=function(t,e,n){Object.defineProperty(t,n,{get:()=>t[e][n],set(o){t[e][n]=o}})};var r=function(t){for(let e=0;e<t.length;e++)f(t[e])};function i(t,e,n){f(n),Object.defineProperty(t,e,{get:function(){return console.log("获取",n),n},set:function(t){console.log("设置",t),t!==n&&(f(n),n=t)}})}const u=Array.prototype.slice,c=Array.prototype,s=Object.create(c);function a(t){Array.isArray(t)?(t.__proto__=s,r(t)):this.walk(t)}["push","pop","shift","unshift","splice","sort","reverse"].forEach((function(t){const e=c[t];s[t]=function(){let n,o=u.call(arguments);const i=e.apply(this,o);switch(t){case"push":case"unshift":n=o;break;case"splice":n=o.slice(2)}return n&&r(n),i}})),a.prototype.walk=function(t){const e=Object.keys(t);for(let n=0;n<e.length;n++){const o=e[n];i(t,o,t[o])}};var f=function(t){var e;if(null!==(e=t)&&"object"==typeof e)return new a(t)};function l(t){t.$options.data&&function(t){let e=t.$options.data;for(var n in e=t.$data="function"==typeof e?e.call(t):e||{},e)o(t,"$data",n);f(t.$data)}(t)}function p(t){this._init(t)}p.prototype._init=function(t){this.$options=t,l(this)};const d=new p({el:"#app",data:()=>({studentNum:1,subject:["历史","文化"],bookInfo:{name:"三国演义",author:{name:"罗贯中",age:18}},studentList:[{id:1,name:"小明"}]})});console.log("vm实例",d),d.studentList.push({id:2,name:"葡萄"}),d.studentNum=100,console.log(d.studentList,"几个人"),console.log(d.studentNum)}]);
//# sourceMappingURL=bundle.js.map