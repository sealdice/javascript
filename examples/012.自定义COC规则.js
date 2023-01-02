// ==UserScript==
// @name         示例:自定义COC规则
// @author       木落
// @version      1.0.0
// @description  自设规则，出1大成功，出100大失败。困难极难等保持原样
// @timestamp    1671886435
// 2022-12-24
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

const rule = seal.coc.newRule();
rule.index = 20; // 自定义序号必须大于等于20，代表可用.setcoc 20切换
rule.key = '测试'; // 代表可用 .setcoc 测试 切换
rule.name = '自设规则'; // 已切换至规则文本 name: desc
rule.desc = '出1大成功\n出100大失败';
// d100 为出目，checkValue 为技能点数
rule.check = (ctx, d100, checkValue) => {
  let successRank = 0;
  const criticalSuccessValue = 1;
  const fumbleValue = 100;
  if (d100 <= checkValue) {
    successRank = 1;
  } else {
    successRank = -1;
  }
  // 成功判定
  if (successRank == 1) {
    // 区分大成功、困难成功、极难成功等
    if (d100 <= checkValue / 2) {
      //suffix = "成功(困难)"
      successRank = 2;
    }
    if (d100 <= checkValue / 5) {
      //suffix = "成功(极难)"
      successRank = 3;
    }
    if (d100 <= criticalSuccessValue) {
      //suffix = "大成功！"
      successRank = 4;
    }
  } else {
    if (d100 >= fumbleValue) {
      //suffix = "大失败！"
      successRank = -2;
    }
  }
  let ret = seal.coc.newRuleCheckResult();
  ret.successRank = successRank;
  ret.criticalSuccessValue = criticalSuccessValue;
  return ret;
};
// 注册规则
seal.coc.registerRule(rule);
