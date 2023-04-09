// ==UserScript==
// @name         空白st show
// @author       冬子
// @version      0.0.1
// @description  基于coc7的st功能，清除了st show默认的固定显示属性和coc规则属性默认值，使用.set none开启
// @timestamp    1681016615
// 2023-04-09
// @diceRequireVer 1.2.0
// @license      MIT
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

const template = {
  name: 'none',
  fullName: '空白st show',
  authors: ['冬子'],
  version: '0.0.1',
  updatedTime: '20230409',
  templateVer: '1.0',
  // .set 相关内容，使用.set none开启，切100面骰，并提示enableTip中的内容
  setConfig: {
    diceSides: 100,
    enableTip: '已切换至100面骰，开启coc7扩展，并清除st show置顶内容、所有属性默认值、同义词自动转换',
    keys: ['none'],
    relatedExt: ['none', 'coc7'], // 开启coc7是为了蹭coc7的st指令
  },

  attrConfig: {
    // st show 置顶内容
    top: [],
    sortBy: 'name',
    // 暂未实装
    setter: null,
  },
  // 可自定义词组，未实装
  textMap: {
    'none-test': {
      设置测试_成功: [['设置完成', 1]],
    },
  },
  textMapHelpInfo: null,
};
try {
  seal.gameSystem.newTemplate(JSON.stringify(template));
} catch (e) {
  // 如果扩展已存在，或加载失败，那么会走到这里
  console.log(e);
}
