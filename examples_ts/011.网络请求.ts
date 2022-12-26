// ==UserScript==
// @name         示例:编写代骰指令
// @author       木落
// @version      1.0.0
// @description  这是一个演示脚本，并没有任何实际作用。
// @timestamp    1672066028
// 2022-12-26
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

// 请注意，不要使用async/await
// 因为目前版本的goja既不支持ES2017标准的async/await语法
// 也不支持es6标准的generator，所以polyfill无法工作
// 虽然我也不喜欢promise这个套娃语法，但目前这能这么写了

// 访问网址
fetch("https://api-music.imsyy.top/cloudsearch?keywords=稻香").then((resp) => {
  // 在返回对象的基础上，将文本流作为json解析
  resp.json().then((data) => {
    // 打印解析出的数据
    console.log(JSON.stringify(data));
  })
});

export {}
