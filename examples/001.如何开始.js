// ==UserScript==
// @name         示例:如何开始
// @author       木落
// @version      1.0.0
// @description  这是一个演示脚本，并没有任何实际作用。
// @timestamp    1671368035
// 2022-12-18
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

/*
这里是海豹支持的js脚本范例
海豹使用的js脚本引擎为goja，对js的支持程度为：
基本支持es6，能使用promise，支持async/await，不支持generator(因此不能做async/await的polyfill)

特别注意一点是js引擎的整型为32位，请小心溢出问题。

推荐使用的语法风格为airbnb风格，内容较多这里不赘述，其有代表性的一些特征为：
使用两空格缩进，{不换行，必须写分号，只用let不写var等。

if (true) {
  let a = 123;
  console.log(a);
}

推荐有经验的用户使用typescript，但注意要编译打包后才能使用，target选es6应当可以工作。

还有一个小提示：
console打印出来的东西不光会在控制台中出现，在日志中也会显示。
涉及网络请求或延迟执行的内容，有时候不会在控制台调试面板上显示出来，而在日志中能看到。

以及重要提醒：
不要灌铅！不要灌铅！不要灌铅！
*/

console.log('这是测试控制台');
console.log('可以这样来查看变量详情：');
console.log(Object.keys(seal));
console.log('更多内容正在制作中...');
console.log('注意: 测试版！API仍然可能发生重大变化！');
