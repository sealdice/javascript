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

// 访问网址
(async function name() {
  const resp = await fetch('https://api-music.imsyy.top/cloudsearch?keywords=稻香');
  // 在返回对象的基础上，将文本流作为json解析
  const data = resp.json();
  // 打印解析出的数据
  console.log(JSON.stringify(data));
})();
