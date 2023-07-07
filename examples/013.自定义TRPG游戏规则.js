// ==UserScript==
// @name         示例:摸鱼大赛TRPG规则
// @author       木落
// @version      1.0.0
// @description  一个自建trpg规则的演示，包括规则模板(人物卡)和自制检定指令两部分。可用.set fish开启，此模板完全为演示作用。
// @timestamp    1677167150
// 2023-02-24
// @diceRequireVer 1.2.0
// @license      MIT
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==
// 编写规则模板
// 这是一个简单的游戏规则，解释一下：
const ruleText = `《摸鱼大赛》

1. 基础属性
每个角色有2个关键属性，即脸皮厚度和摸鱼技能等级，各有1-3的等级。
此外有生命值，生命值上限 = 脸皮厚度 * 2

2. 游戏规则
简单说：这是一个类21点游戏
开始游戏时，每个玩家可以创建一个角色。角色的脸皮厚度和摸鱼技能等级通过投掷两个d3来生成。
每个玩家可以互换交换一次属性点位置。
每一轮游戏中，每个玩家都要决定“摸鱼”和“不摸鱼”
如果选择摸鱼，获得 d6 + d(摸鱼等级) 的积分
玩家的目标是尽可能使得积分数量靠近21，但不能大于等于22（因为摸到22就不存在了！）
如果超过22，玩家自动消耗1点生命值随机弃牌1张，如果剩余仍大于22，那么再来一轮。
如果生命值归零，此玩家就无法再摸鱼了。
当连续两轮，所有玩家都选择不摸鱼时，游戏结束。积分最大的人取胜，如果积分相同，生命值更大的人取胜。`;
const template = {
  name: 'fish',
  fullName: '示例:TRPG规则-摸鱼大赛！',
  authors: ['木落'],
  version: '1.0.0',
  updatedTime: '20230326',
  templateVer: '1.0',
  // .set 相关内容，使用.set fish开启，切6面骰，并提示enableTip中的内容
  setConfig: {
    diceSides: 6,
    enableTip: '已切换至6面骰，并自动开启摸大鱼(fish)扩展',
    keys: ['fish', '摸鱼'],
    relatedExt: ['fish', 'coc7'], // 开启coc7是为了蹭coc7的st指令
  },
  // sn相关内容，可使用.sn fish自动设置名片
  nameTemplate: {
    fish: {
      template: '{$t玩家_RAW} HP{生命值}/{生命值上限} 摸鱼{摸鱼} 点数{点数}',
      helpText: '自动设置测试名片',
    },
  },
  attrConfig: {
    // st show 置顶内容
    top: ['脸皮', '摸鱼', '生命值', '点数'],
    sortBy: 'name',
    // st show 隐藏内容
    ignores: ['生命值上限'],
    // st show 展示内容，例如到 st show hp 会展示“生命值: 10/14”
    showAs: {
      生命值: '{生命值}/{生命值上限}',
    },
    // 暂未实装
    setter: null,
  },
  // 默认值
  defaults: {
    上工: 5,
  },
  // 默认值 - 计算属性，如闪避为“敏捷 / 2 ”
  defaultsComputed: {
    // 注意: 目前(v1.2.4)有一些限制，showAs中的项，千万不能有默认值
    // 此外defaults中的内容也不能出现在defaultsComputed里
    生命值上限: '脸皮 * 2',
  },
  // 同义词，存卡和设置属性时，所有右边的词会被转换为左边的词，不分大小写(sAN视同San/san)
  alias: {
    生命值: ['hp'],
    生命值上限: ['hpmax'],
    摸鱼: ['fish'],
    脸皮: ['face'],
  },
  // 可自定义词组，未实装
  textMap: {
    'fish-test': {
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
// 摸鱼
let ext = seal.ext.find('fish');
if (!ext) {
  ext = seal.ext.new('fish', '木落', '1.0.0');
  seal.ext.register(ext);
}
const cmdFish = seal.ext.newCmdItemInfo();
cmdFish.name = 'fish'; // 指令名字
cmdFish.help = '.fish 规则 //规则讲解\n' + '.fish 制卡 // 创建角色\n' + '.fish 1 // 进行一次摸鱼\n' + '.fish 2 // 跳过本轮\n' + '.fish clr // 清除摸鱼数据';
const data = {};
cmdFish.solve = (ctx, msg, cmdArgs) => {
  let val = cmdArgs.getArgN(1);
  switch (val) {
    case 'help': {
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }
    case '制卡':
      seal.replyToSender(ctx, msg, seal.format(ctx, '.st 脸皮:{$t1=1d3} 摸鱼:{1d3} 生命值:{$t1 * 2}'));
      break;
    case '1':
      // 随机抽 d6 + d(摸鱼)
      const v1 = parseInt(seal.format(ctx, '{d6}'));
      const v2 = parseInt(seal.format(ctx, `{d(摸鱼)}`));
      // 存入记录表
      if (!data[ctx.player.userId]) data[ctx.player.userId] = [];
      let curList = data[ctx.player.userId];
      curList.push(v1 + v2);
      // 计算总点数
      const history = curList.toString();
      let allPoints = 0;
      for (let i of curList) {
        allPoints += i;
      }
      // 检查是否爆掉
      let [hp, _] = seal.vars.intGet(ctx, '生命值');
      let text = seal.format(ctx, `{$t玩家}选择了摸鱼！他摸到了一条鱼，点数为${v1} + ${v2}\n当前点数: ${history} = ${allPoints}`);
      if (allPoints > 21) {
        text += '\n>=22, 爆掉了！';
        while (allPoints >= 22) {
          const index = Math.floor(Math.random() * curList.length);
          const theOne = curList[index];
          curList.splice(index, 1);
          allPoints -= theOne;
          text += `随机弃牌: ${theOne} `;
          hp -= 1;
        }
      }
      seal.vars.intSet(ctx, '生命值', hp);
      if (hp <= 0) {
        text += seal.format(ctx, '\n{$t玩家}挂了！');
      }
      seal.vars.intSet(ctx, '点数', allPoints);
      text += seal.format(ctx, '\n生命值: {生命值} 点数: {点数}');
      seal.replyToSender(ctx, msg, text);
      break;
    case '2':
      seal.replyToSender(ctx, msg, seal.format(ctx, `{$t玩家}跳过此轮`));
      break;
    case 'clr':
      data[ctx.player.userId] = [];
      seal.replyToSender(ctx, msg, `数据已清除`);
      break;
    case '规则':
      seal.replyToSender(ctx, msg, ruleText);
      break;
    default: {
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }
  }
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['fish'] = cmdFish;
ext.cmdMap['摸鱼'] = cmdFish;
