// ==UserScript==
// @name         Vaesen
// @author       浣熊旅記
// @version      1.2.0
// @description  北欧奇谭规则检定
// @timestamp    1677126666
// @diceRequireVer 1.2.0
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

//Vaesentrpg
const vs = {
    "name":"Vaesen",
    "fullname":"北欧奇谭",
    "authors": ["浣熊旅記"],
    "version": "1.2.0",
    "updatedTime": "20230313",
    "templateVer": "1.0",

    "nameTemplate":{
        "vaesen":{
            "template":"{$t玩家_RAW}|精神状态{精神状态}|肉体状态{肉体状态}",
            "helpText": "自动设置北欧奇谭名片"
        }
    },

    "attrConfig":{
        //stshow置顶内容
        "top":['精神状态', '肉体状态', '体能', '精准', '逻辑', '共情'],
        "sortBy":"name",
        "ignores":[],
        "showAs":{
        },
        "setter":null,
    },


    "setConfig":{
        "diceSides": 6,
        "enableTip": "已切换至6面骰，并自动开启北欧奇谭拓展。详情通过.rvs help查看。",
        "keys": ["vaesen"],
        "relatedExt": ["vaesen", "coc7"],
    },

    "defaults":{
    },
    "defaultsComputed":{
    },
    "alias":{
      "精神状态": ["精神"],
      "肉体状态": ["肉体"]
    },

    "textMap": {
        "trpg-test": {
            "设置测试_成功": [
                ["设置完成", 1]
            ]
        }
    },
    "textMapHelpInfo": null
}

try {
    seal.gameSystem.newTemplate(JSON.stringify(vs))
} catch (e) {
    console.log(e)
}


let ext = seal.ext.find('vaesen');
if (!ext) {
  ext = seal.ext.new('vaesen', '浣熊旅記', '1.2.0');
  seal.ext.register(ext);
}

const cmdSeal = seal.ext.newCmdItemInfo();
cmdSeal.name = 'rvs';
cmdSeal.help = '.rvs <技能> (<掷骰原因>)// 投掷对应数目个六面骰，包括对精神/肉体状态减值的自动计算';

cmdSeal.solve = (ctx, msg, cmdArgs) => {
  let ret = seal.ext.newCmdExecuteResult(true), 
      skill = cmdArgs.getArgN(1), 
      motiv = cmdArgs.getArgN(2), 
      phys = seal.format(ctx,"{肉体状态}"), 
      mental = seal.format(ctx,"{精神状态}"), 
      roller = seal.format(ctx,"{$t玩家_RAW}"), 
      dot = '',
      text = '', 
      reason = '', 
      show = '', 
      suc = 0, 
      rDice = 0, 
      num = 0, 
      val = 0, 
      res = 0;

  if (!parseInt(skill)) {
    num = parseInt(seal.format(ctx,`{${skill}}`))
  } else {
    num = parseInt(skill)};

  if (skill == 'help' || skill == '') {
      ret.showHelp = true;
      return ret;
  } else if (skill == '敏捷' || skill == '近身战斗' || skill == '力量') {
    rDice = (num + parseInt(seal.format(ctx,`{体能}`)) - phys)
  } else if (skill == '医学' || skill == '远程战斗' || skill == '隐秘行动') {
    rDice = (num + parseInt(seal.format(ctx,`{精准}`)) - phys)
  } else if (skill == '调查' || skill == '学习' || skill == '警觉') {
    rDice = (num + parseInt(seal.format(ctx,`{逻辑}`)) - mental)
  } else if (skill == '启迪' || skill == '操控人心' || skill == '观察') {
    rDice = (num + parseInt(seal.format(ctx,`{共情}`)) - mental)
  } else if (skill == '体能' || skill == '精准') {
    rDice = (num - phys)
  } else if (skill == '逻辑' || skill == '共情') {
    rDice = (num - mental)
  } else {
    rDice = num
  }; 

  if (motiv == '' || motiv == 0) {
    if (!parseInt(skill)) {
      reason = roller + '为' + skill + '掷骰' + rDice + '次'
    } else {
      reason = roller + '掷骰' + rDice + '次'
    }
  } else {
    if (!parseInt(skill)) {
      reason = '由于' + motiv + '，' + roller + '为' + skill + '掷骰' + rDice + '次'
    } else {
      reason = '由于' + motiv + '，' + roller + '掷骰' + rDice + '次'
    }
  }; 

  if (rDice <= 0) {
    val = 1
  } else if (rDice > 0 && rDice <= 10) {
    val = 2
  } else if (rDice > 10) {
    val = 3
  }; 

  switch (val) {
    case 1: {
      text = '错误：无法掷骰0次或属性不存在。'
      break;
    }
    case 2: {
      for (i = 0; i < rDice; i++) {
        res = Math.floor(Math.random() * 6) + 1; 
        if (i < rDice - 1) {dot = '、'} else {dot = ''}; 
        if (res == 6) {suc += 1};
        show += res + dot;
        text = reason + '得到：[' + show + ']，成功' + suc + '次。';
      }; 
      break;
    }
    case 3: {
      text = '错误：掷骰次数过多。'
      break;
    }
    default: {
      text = '错误：当前版本无法为表达式掷骰或未知错误。'
    }
  }
  if (text != '') seal.replyToSender(ctx, msg, text)
  return ret
};

ext.cmdMap['rvs'] = cmdSeal;
