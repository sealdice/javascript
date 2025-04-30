// ==UserScript==
// @name         KBK TRPG规则
// @author       ziiz
// @version      1.0.0
// @description  用于支持KBK规则下的资源属性管理, 可特殊规则骰子, 可用.set kbk开启
// @timestamp    1742987115
// 2025-03-26
// @diceRequireVer 1.2.0
// @license      MIT
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

//const group_name = ['未分配', '花', '芽', '春', '异', '幸'];

const ruleText = `this is for kbk rule`;
const template = {
  name: 'kbk',
  fullName: '神椿市建设中。NARRATIVE',
  authors: ['ziiz'],
  version: '1.0.1',
  updatedTime: '20250326',
  templateVer: '1.0',

  setConfig: {
    diceSides: 6,
    enableTip: '已切换至6面骰，开启KBK规则(神椿市建设中。NARRATIVE)',
    keys: ['kbk'],
    relatedExt: ['kbk', 'coc7'] // 开启coc7是为了蹭coc7的st指令
  },

  nameTemplate: {
    kbk: {
      template: '{$t玩家_RAW} 共创者{g_group}组 HP{生命值}/{生命值上限} 存在{存在}/{存在上限}',
      helpText: '自动设置测试名片'
    }
  },

  attrConfig: {
    // st show 置顶内容
    top: ['共创者组', '生命值', '生命值上限', '存在', '存在上限', 'fG'],
    sortBy: 'name',
    // st show 隐藏内容
    ignores: [],
    // st show 展示内容，例如到 st show hp 会展示“生命值: 10/14”
    showAs: {
      生命值: '{生命值}/{生命值上限}',
      存在: '{存在}/{存在上限}'
    },
    // 暂未实装
    setter: null
  },

  // 默认值
  defaults: {
  },
  // 默认值 - 计算属性，如闪避为“敏捷 / 2 ”
  defaultsComputed: {
    // 注意: 目前(v1.2.4)有一些限制，showAs中的项，千万不能有默认值
    // 此外defaults中的内容也不能出现在defaultsComputed里
  },
  // 同义词，存卡和设置属性时，所有右边的词会被转换为左边的词，不分大小写(sAN视同San/san)
  alias: {
    生命值: ['hp'],
    生命值上限: ['hpmax'],
    存在: ['exist'],
    存在上限: ['existmax'],
    共创者组: ['g_group'],
  },

  // 可自定义词组，未实装
  textMap: {
    'fish-test': {
      设置测试_成功: [
        ['设置完成', 1]
      ]
    }
  },
  textMapHelpInfo: null
}

try {
  seal.gameSystem.newTemplate(JSON.stringify(template))
} catch (e) {
  // 如果扩展已存在，或加载失败，那么会走到这里
  console.log(e)
}

let ext = seal.ext.find('kbk');
if (!ext) {
  ext = seal.ext.new('kbk', 'ziiz', '1.0.0');
  seal.ext.register(ext);
}

const cmdKbk = seal.ext.newCmdItemInfo();
cmdKbk.name = 'kbk'; // 指令名字
cmdKbk.help = '.kbk st //展示人物属性(kbk规则)\n.kbk init //随机生成kbk规则下的人物属性\n.kbk rd<面数> //支持kbk规则的骰子 支持6 8 10 12 20面骰, 使用rd12t或rd12q可以进行Tesseractor的判定';
const data = {};


cmdKbk.solve = (ctx, msg, cmdArgs) => {
  const group_name = ['未分配', '花', '芽', '春', '异', '幸'];
  let [g,_] = seal.vars.intGet(ctx, '共创者组');
  let gname = group_name[g];
  let val = cmdArgs.getArgN(1);
  switch (val) {
    case 'help': {
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }

    case 'init': {
      seal.replyToSender(ctx, msg, seal.format(ctx, '.st 共创者组:{1d5} 生命值:{$t1=20+1d6} 生命值上限:{$t1} 存在:{10} 存在上限:{20} fG:{5000}\n1-5对应花芽春异幸组'));
      break
    }

    case 'st': {
      let text = seal.format(ctx, '{$t玩家} 个人属性:\n');
      text += seal.format(ctx, '共创者组: '+gname+'组\tfG:{fG}\n');
      text += seal.format(ctx, '生命值:{生命值}/{生命值上限}\t存在:{存在}/{存在上限}');
      seal.replyToSender(ctx, msg, text);
      break
    }

    case 't': {//测试 检测你是不是春组
      if(g == 3){
        seal.replyToSender(ctx, msg, seal.format(ctx, '你是春组的共创者'));
      }else{
        seal.replyToSender(ctx, msg, seal.format(ctx, '你不是春组的共创者'));
      }
      break
    }

    case 'rd6': {
      let text = seal.format(ctx, '['+gname+']'+'{$t玩家} ');
      const v1 = parseInt(seal.format(ctx, '{d6}'));
      text += seal.format(ctx, `骰出了 ${v1} `);
      if (v1 == 6) {
        text += seal.format(ctx, 'Q: FUMBLE');
      }else{
        switch (g) {
          case 1: {
            if(v1==5){
              text += seal.format(ctx, '成功');
            }else{
              text += seal.format(ctx, '失败');
            }
            break;
          }
          case 2: {
            if(v1==1){
              text += seal.format(ctx, '成功');
            }else{
              text += seal.format(ctx, '失败');
            }
            break;
          }
          case 3 : {
            if(v1==2){
              text += seal.format(ctx, '成功');
            }else{
              text += seal.format(ctx, '失败');
            }
            break;
          }
          case 4 : {
            if(v1==3){
              text += seal.format(ctx, '成功');
            }else{
              text += seal.format(ctx, '失败');
            }
            break;
          }
          case 5: {
            if(v1==4){
              text += seal.format(ctx, '成功');
            }else{
              text += seal.format(ctx, '失败');
            }
            break;
          }
        }
      }
      //const res = 
      seal.replyToSender(ctx, msg, text);
      break;
    }

    case 'rd8': {
      let text = seal.format(ctx, '['+gname+']'+'{$t玩家} ');
      const v1 = parseInt(seal.format(ctx, '{d8}'));
      text += seal.format(ctx, `骰出了 ${v1} `);
      
      if(v1==1){
        text += seal.format(ctx, 'FUMBLE 大失败');
      }else if(v1 >= 2 && v1 <= 4){
        text += seal.format(ctx, '失败');
      }else if(v1 >=5 && v1 <= 7){
        text += seal.format(ctx, '成功');
      }else if(v1 == 8){
        text += seal.format(ctx, 'MAGIC 大成功');
      }

      seal.replyToSender(ctx, msg, text);
      break;
    }

    case 'rd10': {
      let text = seal.format(ctx, '['+gname+']'+'{$t玩家} ');
      const v1 = parseInt(seal.format(ctx, '{d10}'));
      text += seal.format(ctx, `骰出了 ${v1} `);
      
      if(v1==1){
        text += seal.format(ctx, 'FUMBLE 大失败');
      }else if(v1 ==2 || v1 == 3){
        text += seal.format(ctx, '失败');
      }else if(v1 >=4 && v1 <= 8){
        text += seal.format(ctx, '成功');
      }else if(v1 == 9 || v1 == 10){
        text += seal.format(ctx, 'MAGIC 大成功');
      }

      seal.replyToSender(ctx, msg, text);
      break;
    }

    case 'rd20': {
      let text = seal.format(ctx, '['+gname+']'+'{$t玩家} ');
      const v1 = parseInt(seal.format(ctx, '{d20}'));
      text += seal.format(ctx, `骰出了 ${v1} `);

      if(v1==1){
        text += seal.format(ctx, 'MAGIC 大成功');
      }else if(v1 == 20){
        text += seal.format(ctx, 'FUMBLE 大失败');
      }
      seal.replyToSender(ctx, msg, text);
      break;
    }

    case 'rd12': {
      let text = seal.format(ctx, '['+gname+']'+'{$t玩家} ');
      const v1 = parseInt(seal.format(ctx, '{d12}'));
      text += seal.format(ctx, `骰出了 ${v1} `);
      switch (g) {
        case 1: {//花
          if(v1==1){
            text += seal.format(ctx, '大失败');
          }else if(v1 == 2||v1 == 3){
            text += seal.format(ctx, '失败');
          }else if(v1>=4 && v1<=10){
            text += seal.format(ctx, '成功');
          }else if(v1 == 11 || v1 == 12){
            text += seal.format(ctx, '大成功');
          }
          break;
        }
        case 2: {//芽	
          if(v1==1||v1==2){
            text += seal.format(ctx, '大成功');
          }else if(v1>=3 && v1<=9){
            text += seal.format(ctx, '成功');
          }else if(v1 == 11 || v1 == 10){
            text += seal.format(ctx, '失败');
          }else if(v1 == 12){
            text += seal.format(ctx, '大失败');
          }
          break;
        }
        case 3 : {//haru
          if(v1==1||v1==2){
            text += seal.format(ctx, '大失败');
          }else if(v1>=3 && v1<=5){
            text += seal.format(ctx, '成功');
          }else if(v1>=6 && v1<=8){
            text += seal.format(ctx, '失败');
          }else if(v1>=9 && v1<=12){
            text += seal.format(ctx, '大成功');
          }
          break;
        }
        case 4 : {//i
          if(v1==2||v1==11){
            text += seal.format(ctx, '失败');
          }else if(v1==5||v1==7){
            text += seal.format(ctx, '大成功');
          }else if(v1==6){
            text += seal.format(ctx, '大失败');
          }else{
              text += seal.format(ctx, '成功');
          }
          break;
        }
        case 5: {//koko
          if(v1==1){
            text += seal.format(ctx, '大失败');
          }else if(v1 == 2||v1 == 3){
            text += seal.format(ctx, '失败');
          }else if(v1>=4 && v1<=10){
            switch (v1) {
              case 4:
                text += seal.format(ctx, '成功 3颗子弹');
                break;
              case 5:
                text += seal.format(ctx, '成功 2颗子弹');
                break;
              case 6:
                text += seal.format(ctx, '成功 1颗子弹');
                break;
              case 7:
                text += seal.format(ctx, '成功 3颗子弹');
                break;
              case 8:
                text += seal.format(ctx, '成功 2颗子弹');
                break;
              case 9: 
                text += seal.format(ctx, '成功 1颗子弹');
                break;
              case 10:
                text += seal.format(ctx, '成功 1颗子弹');
                break;
            }
          }else if(v1 == 11 || v1 == 12){
            text += seal.format(ctx, '大成功');
          }
          break;
        }
      }
      //const res = 
      seal.replyToSender(ctx, msg, text);
      break;
    }

    case 'rd12q': 
    case 'rd12t': {
      let text = seal.format(ctx, 'Tesseractor ');
      const v1 = parseInt(seal.format(ctx, '{d12}'));
      text += seal.format(ctx, `骰出了 ${v1} `);

      //花
      if(v1==1){
        text += seal.format(ctx, '失败');
      }else if(v1 == 2||v1 == 3){
        text += seal.format(ctx, '失败');
      }else if(v1>=4 && v1<=10){
        text += seal.format(ctx, '成功');
      }else if(v1 == 11 || v1 == 12){
        text += seal.format(ctx, '大成功');
      }        
      //const res = 
      seal.replyToSender(ctx, msg, text);
      break;
    }
  
    default: {
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }
  }
  return seal.ext.newCmdExecuteResult(true);
}

ext.cmdMap['kbk'] = cmdKbk;
